import type { KnowledgeChunk } from './types.js';

const MIN_SCORE_THRESHOLD = 1;
const DEFAULT_LIMIT = 5;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreChunk(query: string, chunk: KnowledgeChunk): number {
  const queryLower = query.toLowerCase();
  const queryTokens = new Set(tokenize(query));
  let score = 0;

  for (const keyword of chunk.keywords) {
    const kw = keyword.toLowerCase();
    if (queryTokens.has(kw) || queryLower.includes(kw)) {
      score++;
    }
  }

  return score;
}

export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunk[],
  limit = DEFAULT_LIMIT,
): KnowledgeChunk[] {
  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(query, chunk) }))
    .filter(({ score }) => score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ chunk }) => chunk);
}

export { MIN_SCORE_THRESHOLD };
