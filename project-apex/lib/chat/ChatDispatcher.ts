export type ChatResult =
  | { type: 'reply'; text: string }
  | { type: 'suggest_agent'; reason: string };

export class ChatDispatcher {
  async processMessage(message: string): Promise<ChatResult> {
    // Stub: suggest agent if message includes keyword, else echo reply
    if (/\b(agent|automate|run)\b/i.test(message)) {
      return { type: 'suggest_agent', reason: 'User requested an actionable task' };
    }
    return { type: 'reply', text: `You said: ${message}` };
  }
}

