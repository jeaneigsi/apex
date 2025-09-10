export interface IVlmProvider {
  describe(image: ArrayBuffer, prompt?: string): Promise<string>;
}

export class LlamaCppMultimodalProvider implements IVlmProvider {
  async describe(_image: ArrayBuffer, prompt = 'Describe the image'): Promise<string> {
    // Stub: returns a canned description
    return `VLM stub: ${prompt}`;
  }
}

