import { Orchestrator } from './Orchestrator';
import { Programmer } from './Programmer';
import { GuiOperator } from './GuiOperator';

export class TaskOrchestrator {
  private orch = new Orchestrator();
  private prog = new Programmer();
  private gui = new GuiOperator();

  async step(goal: string) {
    const decision = this.orch.decide({ goal });
    switch (decision.next) {
      case 'program':
        return { kind: 'code' as const, payload: this.prog.generateCode({ task: goal }) };
      case 'gui':
        return { kind: 'gui' as const, payload: this.gui.generateAction({ goal }) };
      default:
        return { kind: 'done' as const };
    }
  }
}

