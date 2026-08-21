import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({});

const TTL_SECONDS = 7200;

export async function checkRateLimit(
  tableName: string,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (!key) return true;

  const bucket = Math.floor(Date.now() / windowMs);
  const pk = key.includes('#') ? `${key}#${bucket}` : `EVENT#${key}#${bucket}`;
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
