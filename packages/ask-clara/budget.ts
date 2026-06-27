import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({});

/** Per-token pricing (USD) for cost estimation. */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'amazon.nova-lite-v1:0': {
    input: 0.000_000_06,
    output: 0.000_000_24,
  },
  'amazon.nova-micro-v1:0': {
    input: 0.000_000_035,
    output: 0.000_000_14,
  },
  'anthropic.claude-3-haiku-20240307-v1:0': {
    input: 0.000_000_25,
    output: 0.000_001_25,
  },
};

const DEFAULT_PRICING = MODEL_PRICING['amazon.nova-lite-v1:0'];

export function getMonthlyPartitionKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[modelId] ?? DEFAULT_PRICING;
  return inputTokens * pricing.input + outputTokens * pricing.output;
}

export function getBudgetLimitUsd(): number {
  const raw = process.env.ASK_CLARA_MONTHLY_BUDGET_USD ?? '5';
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export async function checkBudget(
  tableName: string,
  budgetUsd: number,
): Promise<{ allowed: boolean; current: number }> {
  const pk = getMonthlyPartitionKey();
  const result = await dynamo.send(
    new GetItemCommand({
      TableName: tableName,
      Key: { pk: { S: pk } },
    }),
  );

  const current = result.Item?.totalCostUsd?.N
    ? Number.parseFloat(result.Item.totalCostUsd.N)
    : 0;

  return {
    allowed: current < budgetUsd,
    current,
  };
}

export async function recordUsage(
  tableName: string,
  costUsd: number,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const pk = getMonthlyPartitionKey();
  const budgetUsd = getBudgetLimitUsd();

  await dynamo.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { pk: { S: pk } },
      UpdateExpression:
        'ADD totalCostUsd :cost, requestCount :one SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':cost': { N: costUsd.toFixed(8) },
        ':one': { N: '1' },
        ':now': { S: new Date().toISOString() },
        ':zero': { N: '0' },
      },
      ConditionExpression: 'attribute_not_exists(pk) OR totalCostUsd >= :zero',
    }),
  );

  const updated = await checkBudget(tableName, budgetUsd);
  const total = updated.current;
  if (total >= budgetUsd * 0.8) {
    console.warn(
      JSON.stringify({
        event: 'ask_clara_budget_warning',
        pk,
        totalCostUsd: total,
        budgetUsd,
        percentUsed: Math.round((total / budgetUsd) * 100),
        lastRequestCostUsd: costUsd,
        lastInputTokens: inputTokens,
        lastOutputTokens: outputTokens,
      }),
    );
  }
}

export async function recordRefusedOverBudget(tableName: string): Promise<void> {
  const pk = getMonthlyPartitionKey();

  await dynamo.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { pk: { S: pk } },
      UpdateExpression:
        'ADD refusedOverBudget :one SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':one': { N: '1' },
        ':now': { S: new Date().toISOString() },
      },
    }),
  );
}
