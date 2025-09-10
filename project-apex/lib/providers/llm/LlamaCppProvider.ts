export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ILlmProvider {
  generate(messages: LlmMessage[], opts?: { temperature?: number }): Promise<string>;
}

export class LlamaCppProvider implements ILlmProvider {
  constructor(private baseUrl = process.env.LLAMA_CPP_URL || 'http://localhost:8080') {}

  async generate(messages: LlmMessage[]): Promise<string> {
    // Stub: no real call, just mirror last user message
    const last = [...messages].reverse().find((m) => m.role === 'user');
    return `LLM stub: ${last?.content ?? ''}`.trim();
  }
}

