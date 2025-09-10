export type GuiAction =
  | { type: 'click'; x: number; y: number }
  | { type: 'type'; text: string }
  | { type: 'keypress'; keys: string[] };

export class GuiOperator {
  generateAction(input: { goal: string; observation?: string }): GuiAction {
    // Stub: default to a noop typing action
    return { type: 'type', text: `Working on: ${input.goal}` };
  }
}

