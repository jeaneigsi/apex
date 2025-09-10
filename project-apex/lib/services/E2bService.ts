export type SandboxInfo = { sandboxId: string; vncUrl?: string };

export class E2bService {
  async createSandbox(_opts?: { resolution?: [number, number]; timeoutMs?: number }): Promise<SandboxInfo> {
    // Stub: returns a fake sandbox id
    return { sandboxId: 'sandbox-stub', vncUrl: undefined };
  }

  async execute(_action: unknown): Promise<{ ok: boolean }> {
    // Stub: pretend action executed
    return { ok: true };
  }
}

