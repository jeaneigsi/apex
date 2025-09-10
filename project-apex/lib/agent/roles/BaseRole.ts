export type RoleContext = {
  name: string;
  description?: string;
};

export abstract class BaseRole {
  protected ctx: RoleContext;
  constructor(ctx: RoleContext) {
    this.ctx = ctx;
  }
  abstract systemPrompt(): string;
}

