import { describe, it, expect } from "vitest";
import { RedactionEngine } from "../src/redaction/redactor";
import { Detection } from "../src/types/index";

describe("RedactionEngine", () => {
  const redactor = new RedactionEngine();

  describe("Email Redaction", () => {
    it("should redact email with [EMAIL] placeholder", () => {
      const text = "My email is rahul@gmail.com";
      const detections: Detection[] = [
        { type: "EMAIL", start: 12, end: 28, confidence: 0.99, risk: 20 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[EMAIL]");
      expect(result).not.toContain("rahul@gmail.com");
      expect(result).toBe("My email is [EMAIL]");
    });
  });

  describe("Phone Redaction", () => {
    it("should redact phone with [PHONE] placeholder", () => {
      const text = "Call me at 9876543210";
      const detections: Detection[] = [
        { type: "PHONE", start: 11, end: 21, confidence: 0.85, risk: 20 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[PHONE]");
      expect(result).not.toContain("9876543210");
    });
  });

  describe("Customer ID Redaction", () => {
    it("should redact customer ID with [CUSTOMER_ID] placeholder", () => {
      const text = "Customer ID: CUST-92831";
      const detections: Detection[] = [
        { type: "CUSTOMER_ID", start: 13, end: 23, confidence: 0.9, risk: 25 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[CUSTOMER_ID]");
      expect(result).not.toContain("CUST-92831");
    });
  });

  describe("Person Name Redaction", () => {
    it("should redact person name with [NAME] placeholder", () => {
      const text = "Customer: Rahul Sharma";
      const detections: Detection[] = [
        { type: "PERSON", start: 10, end: 23, confidence: 0.75, risk: 10 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[NAME]");
      expect(result).not.toContain("Rahul Sharma");
    });
  });

  describe("Credit Card Redaction", () => {
    it("should redact credit card with [CREDIT_CARD] placeholder", () => {
      const text = "Card: 4111 1111 1111 1111";
      const detections: Detection[] = [
        { type: "CREDIT_CARD", start: 6, end: 26, confidence: 0.95, risk: 40 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[CREDIT_CARD]");
      expect(result).not.toContain("4111 1111 1111 1111");
    });
  });

  describe("Secret Redaction", () => {
    it("should redact secret with [SECRET] placeholder", () => {
      const text = "API_KEY=sk-abcdefghijklmnopqrs";
      const detections: Detection[] = [
        { type: "SECRET", start: 8, end: 28, confidence: 0.98, risk: 50 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("[SECRET]");
      expect(result).not.toContain("sk-abcdefghijklmnopqrs");
    });
  });

  describe("Multiple Entity Redaction", () => {
    it("should redact multiple entities correctly", () => {
      const text = `Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

The customer wants a refund.
Write a professional response.`;

      const detections: Detection[] = [
        { type: "PERSON", start: 10, end: 23, confidence: 0.75, risk: 10 },
        { type: "EMAIL", start: 31, end: 47, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 55, end: 65, confidence: 0.85, risk: 20 },
        { type: "CUSTOMER_ID", start: 78, end: 88, confidence: 0.9, risk: 25 },
      ];

      const result = redactor.redact(text, detections);
      expect(result).toContain("[NAME]");
      expect(result).toContain("[EMAIL]");
      expect(result).toContain("[PHONE]");
      expect(result).toContain("[CUSTOMER_ID]");
      expect(result).toContain("Write a professional response.");
    });

    it("should handle overlapping detections by processing from end", () => {
      const text = "Email: test@example.com Phone: 1234567890";
      const detections: Detection[] = [
        { type: "EMAIL", start: 7, end: 25, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 32, end: 42, confidence: 0.85, risk: 20 },
      ];

      const result = redactor.redact(text, detections);
      expect(result).toContain("[EMAIL]");
      expect(result).toContain("[PHONE]");
      expect(result).not.toContain("test@example.com");
      expect(result).not.toContain("1234567890");
    });
  });

  describe("Selective Redaction", () => {
    it("should redact only specified types", () => {
      const text = "Contact john@example.com at 5551234567";
      const detections: Detection[] = [
        { type: "EMAIL", start: 8, end: 25, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 29, end: 39, confidence: 0.85, risk: 20 },
      ];

      // Only redact email
      const result = redactor.redactMultiple(text, detections, ["EMAIL"]);
      expect(result).toContain("[EMAIL]");
      expect(result).toContain("5551234567");
      expect(result).not.toContain("john@example.com");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty detections", () => {
      const text = "Some normal text";
      const detections: Detection[] = [];
      const result = redactor.redact(text, detections);
      expect(result).toBe(text);
    });

    it("should handle null or undefined gracefully", () => {
      const text = "Some text";
      const detections: Detection[] = [];
      const result = redactor.redact(text, detections);
      expect(result).toBe(text);
    });

    it("should preserve text structure", () => {
      const text = "Employee: John Smith\nDepartment: Sales";
      const detections: Detection[] = [
        { type: "PERSON", start: 10, end: 20, confidence: 0.75, risk: 10 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toContain("Employee:");
      expect(result).toContain("Department:");
      expect(result).toContain("[NAME]");
    });

    it("should handle repeated entities", () => {
      const text = "Call 9876543210 or 9876543210 again";
      const detections: Detection[] = [
        { type: "PHONE", start: 5, end: 15, confidence: 0.85, risk: 20 },
        { type: "PHONE", start: 19, end: 29, confidence: 0.85, risk: 20 },
      ];
      const result = redactor.redact(text, detections);
      expect(result).toBe("Call [PHONE] or [PHONE] again");
    });
  });

  describe("Redaction Preview", () => {
    it("should provide preview of redacted text", () => {
      const text = "My email is user@example.com";
      const detections: Detection[] = [
        { type: "EMAIL", start: 12, end: 28, confidence: 0.99, risk: 20 },
      ];
      const preview = redactor.getRedactionPreview(text, detections);
      expect(preview).toBe("My email is [EMAIL]");
      expect(preview).not.toContain("user@example.com");
    });
  });
});
