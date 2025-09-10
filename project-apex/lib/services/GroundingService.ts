import type { IOcrProvider } from '../providers/ocr/TesseractProvider';

export class GroundingService {
  constructor(private ocr: IOcrProvider) {}

  async findClickTarget(_screenshot: ArrayBuffer, _label: string): Promise<{ x: number; y: number } | null> {
    // Stub: no real grounding yet
    return null;
  }
}

