export interface KnowledgeChunk {
  id: string;
  type: string;
  text: string;
  keywords: string[];
}

export interface KnowledgeData {
  chunks: KnowledgeChunk[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskRequest {
  message: string;
  history?: ChatMessage[];
}

export interface AskResponse {
  answer: string;
  refused: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface BudgetStatus {
  allowed: boolean;
  current: number;
}
