export type SubGoal = { id: string; title: string; done?: boolean };

export class Orchestrator {
  decide(input: { goal: string; context?: unknown }): { next: 'program' | 'gui' | 'done'; reason: string } {
    // Stub decision logic
    if (!input.goal) return { next: 'done', reason: 'no goal' };
    return { next: 'gui', reason: 'stub: default to gui' };
  }
}

