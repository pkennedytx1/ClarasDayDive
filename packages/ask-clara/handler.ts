import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  checkBudget,
  estimateCost,
  getBudgetLimitUsd,
  recordRefusedOverBudget,
  recordUsage,
} from './budget.js';
import {
  blocklistCheck,
  classifyTopic,
  filterOutput,
  sanitizeInput,
  validateInput,
} from './guardrails.js';
import knowledgeData from './knowledge.json';
import {
  buildSystemPrompt,
  FALLBACK_ANSWER,
  REFUSAL_OFF_TOPIC,
  REFUSAL_OVER_BUDGET,
  REFUSAL_RATE_LIMIT,
} from './prompts.js';
import { retrieveChunks } from './retrieve.js';
import { checkRateLimit } from './rate-limit.js';
import type { AskRequest, AskResponse, ChatMessage, TokenUsage } from './types.js';

const HISTORY_TURN_LIMIT = 4;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

function jsonResponse(
  statusCode: number,
  body: AskResponse | { error: string },
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function refusedResponse(answer: string): APIGatewayProxyResultV2 {
  return jsonResponse(200, { answer, refused: true });
}

function getModelId(): string {
  return process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0';
}

function getUsageTableName(): string {
  return process.env.ASK_CLARA_USAGE_TABLE ?? 'AskClaraUsage';
}

function capHistory(history: ChatMessage[] | undefined): ChatMessage[] {
  if (!history?.length) {
    return [];
  }

  return history
    .filter(
      (turn) =>
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.content === 'string' &&
        turn.content.trim().length > 0,
    )
    .slice(-HISTORY_TURN_LIMIT);
}

function extractAllowedUrls(chunks: { text: string }[]): string[] {
  const urls = new Set<string>();
  const urlPattern = /https?:\/\/[^\s)\]>]+/gi;

  for (const chunk of chunks) {
    const matches = chunk.text.match(urlPattern) ?? [];
    for (const match of matches) {
      urls.add(match.replace(/[.,;:!?)]+$/, ''));
    }
  }

  return [...urls];
}

function parseRequestBody(body: string | undefined): AskRequest | null {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as AskRequest;
    if (typeof parsed.message !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function invokeMainModel(
  bedrock: BedrockRuntimeClient,
  modelId: string,
  systemPrompt: string,
  message: string,
  history: ChatMessage[],
): Promise<{ text: string; usage: TokenUsage }> {
  const messages = [
    ...history.map((turn) => ({
      role: turn.role as 'user' | 'assistant',
      content: [{ text: turn.content }],
    })),
    {
      role: 'user' as const,
      content: [{ text: message }],
    },
  ];

  const response = await bedrock.send(
    new ConverseCommand({
      modelId,
      system: [{ text: systemPrompt }],
      messages,
      inferenceConfig: {
        maxTokens: 512,
        temperature: 0.4,
      },
    }),
  );

  const text =
    response.output?.message?.content
      ?.map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim() ?? '';

  return {
    text,
    usage: {
      inputTokens: response.usage?.inputTokens ?? 0,
      outputTokens: response.usage?.outputTokens ?? 0,
    },
  };
}

/**
 * Ask Clara Lambda handler for API Gateway HTTP API (v2).
 *
 * Guardrails: rate limit → input validation → blocklist → budget → classifier → RAG → main LLM → output filter.
 */
export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const request = parseRequestBody(event.body);
  if (!request) {
    return jsonResponse(400, { error: 'Invalid request body' });
  }

  const tableName = getUsageTableName();
  const clientIp =
    event.requestContext?.http?.sourceIp ??
    event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
    'unknown';

  if (!(await checkRateLimit(tableName, clientIp))) {
    return refusedResponse(REFUSAL_RATE_LIMIT);
  }

  const validationError = validateInput(request.message);
  if (validationError) {
    return jsonResponse(400, { error: validationError });
  }

  const message = sanitizeInput(request.message);
  const history = capHistory(request.history);
  const modelId = getModelId();
  const budgetUsd = getBudgetLimitUsd();

  if (blocklistCheck(message)) {
    return refusedResponse(REFUSAL_OFF_TOPIC);
  }

  const budget = await checkBudget(tableName, budgetUsd);
  if (!budget.allowed) {
    await recordRefusedOverBudget(tableName);
    return refusedResponse(REFUSAL_OVER_BUDGET);
  }

  const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? 'us-east-2',
  });

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    const classification = await classifyTopic(bedrock, modelId, message);
    totalInputTokens += classification.usage.inputTokens;
    totalOutputTokens += classification.usage.outputTokens;

    if (!classification.allowed) {
      const classifierCost = estimateCost(
        modelId,
        classification.usage.inputTokens,
        classification.usage.outputTokens,
      );
      await recordUsage(
        tableName,
        classifierCost,
        classification.usage.inputTokens,
        classification.usage.outputTokens,
      );
      return refusedResponse(REFUSAL_OFF_TOPIC);
    }

    const chunks = retrieveChunks(message, knowledgeData.chunks);
    const systemPrompt = buildSystemPrompt(chunks);
    const main = await invokeMainModel(
      bedrock,
      modelId,
      systemPrompt,
      message,
      history,
    );
    totalInputTokens += main.usage.inputTokens;
    totalOutputTokens += main.usage.outputTokens;

    const allowedUrls = extractAllowedUrls(chunks);
    const answer = filterOutput(main.text, allowedUrls) || REFUSAL_OFF_TOPIC;
    const refused = answer === REFUSAL_OFF_TOPIC;

    const totalCost = estimateCost(modelId, totalInputTokens, totalOutputTokens);
    await recordUsage(
      tableName,
      totalCost,
      totalInputTokens,
      totalOutputTokens,
    );

    return jsonResponse(200, { answer, refused });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'ask_clara_bedrock_error',
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return jsonResponse(200, { answer: FALLBACK_ANSWER, refused: false });
  }
}
