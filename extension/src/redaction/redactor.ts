import { Detection, EntityType } from "../types/index";

export class RedactionEngine {
  private readonly PLACEHOLDERS: Record<EntityType, string> = {
    PERSON: "[NAME]",
    EMAIL: "[EMAIL]",
    PHONE: "[PHONE]",
    CUSTOMER_ID: "[CUSTOMER_ID]",
    CREDIT_CARD: "[CREDIT_CARD]",
    SECRET: "[SECRET]",
  };

  redact(text: string, detections: Detection[]): string {
    if (!detections || detections.length === 0) {
      return text;
    }

    // Sort detections in reverse order (end to start) to avoid index shifting
    const sortedDetections = [...detections].sort((a, b) => b.start - a.start);

    let result = text;

    for (const detection of sortedDetections) {
      const placeholder = this.PLACEHOLDERS[detection.type];
      result =
        result.substring(0, detection.start) +
        placeholder +
        result.substring(detection.end);
    }

    return result;
  }

  redactMultiple(text: string, detections: Detection[], types: EntityType[]): string {
    // Only redact specified types
    const toRedact = detections.filter((d) => types.includes(d.type));
    return this.redact(text, toRedact);
  }

  redactAll(text: string, detections: Detection[]): string {
    return this.redact(text, detections);
  }

  getRedactionPreview(text: string, detections: Detection[]): string {
    return this.redact(text, detections);
  }
}

export default new RedactionEngine();
