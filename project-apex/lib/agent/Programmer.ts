export class Programmer {
  generateCode(spec: { task: string }): { language: 'bash' | 'python' | 'typescript'; code: string } {
    // Stub: return minimal code
    return { language: 'bash', code: `echo "${spec.task}"` };
  }
}

