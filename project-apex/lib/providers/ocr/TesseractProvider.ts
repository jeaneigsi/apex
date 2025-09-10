export interface IOcrProvider {
  extractText(image: ArrayBuffer): Promise<string[]>;
}

export class TesseractProvider implements IOcrProvider {
  async extractText(_image: ArrayBuffer): Promise<string[]> {
    // Stub: return empty OCR results
    return [];
  }
}

