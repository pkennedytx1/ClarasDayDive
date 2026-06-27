import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { TokenUsage } from './types.js';
import { CLASSIFIER_PROMPT } from './prompts.js';

const MAX_MESSAGE_LENGTH = 400;

const BLOCKLIST_PATTERNS: RegExp[] = [
  /ignore (all )?(previous|prior|above) (instructions|prompts?)/i,
  /disregard (your|the) (instructions|rules|prompt)/i,
  /you are now (a|an)/i,
  /pretend (you are|to be)/i,
  /act as (a|an)/i,
  /write (me )?(code|python|javascript|java|c\+\+|essay|homework)/i,
  /help (me )?(with )?(my )?(homework|assignment|exam)/i,
  /\b(dan mode|jailbreak|system prompt)\b/i,
  /<\s*script/i,
];

const OUTPUT_AI_PATTERNS: RegExp[] = [
  /\bas an ai\b/i,
  /\bas a language model\b/i,
  /\bas an artificial intelligence\b/i,
  /\bi('m| am) (an )?ai\b/i,
  /\bi('m| am) (a )?language model\b/i,
];

export function validateInput(message: string): string | null {
  if (typeof message !== 'string') {
    return 'Message must be a string';
  }

  const stripped = message.replace(/<[^>]*>/g, '').trim();
  if (!stripped) {
    return 'Message cannot be empty';
  }
  if (stripped.length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`;
  }

  return null;
}

export function sanitizeInput(message: string): string {
  return message.replace(/<[^>]*>/g, '').trim();
}

export function blocklistCheck(message: string): boolean {
  return BLOCKLIST_PATTERNS.some((pattern) => pattern.test(message));
}

export async function classifyTopic(
  bedrock: BedrockRuntimeClient,
  modelId: string,
  message: string,
): Promise<{ allowed: boolean; usage: TokenUsage }> {
  const response = await bedrock.send(
    new ConverseCommand({
      modelId,
      system: [{ text: CLASSIFIER_PROMPT }],
      messages: [
        {
          role: 'user',
          content: [{ text: message }],
        },
      ],
      inferenceConfig: {
        maxTokens: 10,
        temperature: 0,
      },
    }),
  );

  const text =
    response.output?.message?.content
      ?.map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim()
      .toUpperCase() ?? '';

  const allowed = text.startsWith('YES');
  const usage: TokenUsage = {
    inputTokens: response.usage?.inputTokens ?? 0,
    outputTokens: response.usage?.outputTokens ?? 0,
  };

  return { allowed, usage };
}

export function filterOutput(text: string, allowedUrls: string[]): string {
  let filtered = text.trim();

  for (const pattern of OUTPUT_AI_PATTERNS) {
    filtered = filtered.replace(pattern, '').trim();
  }

  const urlPattern = /https?:\/\/[^\s)\]>]+/gi;
  filtered = filtered.replace(urlPattern, (url) => {
    const normalized = url.replace(/[.,;:!?)]+$/, '');
    const isAllowed = allowedUrls.some(
      (allowed) =>
        normalized === allowed ||
        normalized.startsWith(allowed) ||
        allowed.startsWith(normalized),
    );
    return isAllowed ? normalized : '';
  });

  return filtered.replace(/\s{2,}/g, ' ').trim();
}

export { MAX_MESSAGE_LENGTH };
