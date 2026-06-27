import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({});

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const TTL_SECONDS = 120;

export async function checkRateLimit(
  tableName: string,
  ip: string,
  limit = RATE_LIMIT,
): Promise<boolean> {
  if (!ip || ip === 'unknown') {
    return true;
  }

  const bucket = Math.floor(Date.now() / WINDOW_MS);
  const pk = `RATE#${ip}#${bucket}`;
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  const result = await dynamo.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { pk: { S: pk } },
      UpdateExpression: 'ADD requestCount :one SET expiresAt = :exp',
      ExpressionAttributeValues: {
        ':one': { N: '1' },
        ':exp': { N: String(expiresAt) },
      },
      ReturnValues: 'UPDATED_NEW',
    }),
  );

  const count = Number(result.Attributes?.requestCount?.N ?? '0');
  return count <= limit;
}
