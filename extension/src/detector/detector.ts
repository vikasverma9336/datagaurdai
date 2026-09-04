import { Detection, EntityType } from "../types/index";
import {
  EMAIL_PATTERN,
  PHONE_PATTERNS,
  CUSTOMER_ID_PATTERNS,
  CREDIT_CARD_PATTERNS,
  SECRET_PATTERNS,
  PERSON_PATTERNS,
} from "./patterns";
import {
  createDetection,
  validateCreditCardLuhn,
  isValidPhoneNumber,
  couldBeName,
} from "./entities";

export class SensitiveDataDetector {
  detectEmail(text: string): Detection[] {
    const detections: Detection[] = [];
    let match;

    const pattern = new RegExp(EMAIL_PATTERN);
    while ((match = pattern.exec(text)) !== null) {
      detections.push(createDetection("EMAIL", match.index, match.index + match[0].length));
    }

    return detections;
  }

  detectPhone(text: string): Detection[] {
    const detections: Detection[] = [];

    for (const pattern of PHONE_PATTERNS) {
      let match;
      const regexPattern = new RegExp(pattern);
      while ((match = regexPattern.exec(text)) !== null) {
        const phoneText = match[0];
        if (isValidPhoneNumber(phoneText)) {
          detections.push(
            createDetection("PHONE", match.index, match.index + phoneText.length)
          );
        }
      }
    }

    // Remove duplicates
    return this.removeDuplicateDetections(detections);
  }

  detectCustomerId(text: string): Detection[] {
    const detections: Detection[] = [];

    for (const pattern of CUSTOMER_ID_PATTERNS) {
      let match;
      const regexPattern = new RegExp(pattern);
      while ((match = regexPattern.exec(text)) !== null) {
        const customerIdText = this.getSensitiveMatchText(match, ["CUST-", "CUSTOMER-"]);
        const startIndex = match.index + match[0].indexOf(customerIdText);
        detections.push(
          createDetection("CUSTOMER_ID", startIndex, startIndex + customerIdText.length)
        );
      }
    }

    return this.removeDuplicateDetections(detections);
  }

  detectCreditCard(text: string): Detection[] {
    const detections: Detection[] = [];

    for (const pattern of CREDIT_CARD_PATTERNS) {
      let match;
      const regexPattern = new RegExp(pattern);
      while ((match = regexPattern.exec(text)) !== null) {
        const cardText = match[0];
        if (validateCreditCardLuhn(cardText)) {
          detections.push(
            createDetection("CREDIT_CARD", match.index, match.index + cardText.length)
          );
        }
      }
    }

    return this.removeDuplicateDetections(detections);
  }

  detectSecret(text: string): Detection[] {
    const detections: Detection[] = [];

    for (const pattern of SECRET_PATTERNS) {
      let match;
      const regexPattern = new RegExp(pattern);
      while ((match = regexPattern.exec(text)) !== null) {
        detections.push(
          createDetection("SECRET", match.index, match.index + match[0].length)
        );
      }
    }

    return this.removeDuplicateDetections(detections);
  }

  detectPerson(text: string): Detection[] {
    const detections: Detection[] = [];

    for (const pattern of PERSON_PATTERNS) {
      let match;
      const regexPattern = new RegExp(pattern);
      while ((match = regexPattern.exec(text)) !== null) {
        // For person patterns, we need to validate the captured group
        const nameText = match[1] || match[0];
        if (couldBeName(nameText)) {
          const startIndex = match.index + match[0].indexOf(nameText);
          const endIndex = startIndex + nameText.length;
          detections.push(createDetection("PERSON", startIndex, endIndex));
        }
      }
    }

    return this.removeDuplicateDetections(detections);
  }

  private removeDuplicateDetections(detections: Detection[]): Detection[] {
    const seen = new Set<string>();
    const unique: Detection[] = [];

    for (const detection of detections) {
      const key = `${detection.type}-${detection.start}-${detection.end}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(detection);
      }
    }

    return unique;
  }

  private getSensitiveMatchText(match: RegExpExecArray, fullMatchPrefixes: string[]): string {
    const fullMatch = match[0];
    const upperFullMatch = fullMatch.toUpperCase();

    if (fullMatchPrefixes.some((prefix) => upperFullMatch.startsWith(prefix))) {
      return fullMatch;
    }

    return match[1] || fullMatch;
  }

  detect(text: string): Detection[] {
    if (!text || typeof text !== "string") {
      return [];
    }

    const allDetections: Detection[] = [];

    // Detect in order of priority (highest risk first)
    allDetections.push(...this.detectSecret(text));
    allDetections.push(...this.detectCreditCard(text));
    allDetections.push(...this.detectCustomerId(text));
    allDetections.push(...this.detectPhone(text));
    allDetections.push(...this.detectEmail(text));
    allDetections.push(...this.detectPerson(text));

    // Remove overlapping detections, keeping the highest risk ones
    return this.removeOverlappingDetections(allDetections);
  }

  private removeOverlappingDetections(detections: Detection[]): Detection[] {
    if (detections.length === 0) return [];

    // Sort by risk (descending) then by position
    const sorted = [...detections].sort((a, b) => {
      if (b.risk !== a.risk) return b.risk - a.risk;
      return a.start - b.start;
    });

    const kept: Detection[] = [];
    const ranges: Array<{ start: number; end: number }> = [];

    for (const detection of sorted) {
      // Check if this detection overlaps with any kept detection
      const overlaps = ranges.some(
        (range) =>
          (detection.start < range.end && detection.end > range.start)
      );

      if (!overlaps) {
        kept.push(detection);
        ranges.push({ start: detection.start, end: detection.end });
      }
    }

    // Sort back by position for redaction
    return kept.sort((a, b) => a.start - b.start);
  }
}

export default new SensitiveDataDetector();
