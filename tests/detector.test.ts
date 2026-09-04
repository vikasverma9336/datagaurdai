import { describe, it, expect } from "vitest";
import { SensitiveDataDetector } from "../src/detector/detector";

describe("SensitiveDataDetector", () => {
  const detector = new SensitiveDataDetector();

  describe("Email Detection", () => {
    it("should detect basic email", () => {
      const text = "My email is rahul@gmail.com";
      const detections = detector.detectEmail(text);
      expect(detections).toHaveLength(1);
      expect(detections[0].type).toBe("EMAIL");
      expect(detections[0].confidence).toBe(0.99);
    });

    it("should detect multiple emails", () => {
      const text = "Contact john.doe@company.com or jane@example.org";
      const detections = detector.detectEmail(text);
      expect(detections.length).toBeGreaterThanOrEqual(2);
    });

    it("should detect emails with dots in local part", () => {
      const text = "user.name.here@example.com";
      const detections = detector.detectEmail(text);
      expect(detections.length).toBeGreaterThan(0);
    });
  });

  describe("Phone Detection", () => {
    it("should detect Indian 10-digit phone", () => {
      const text = "Call me at 9876543210";
      const detections = detector.detectPhone(text);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0].type).toBe("PHONE");
    });

    it("should detect phone with country code +91", () => {
      const text = "My number is +91 9876543210";
      const detections = detector.detectPhone(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect phone with country code format +91-", () => {
      const text = "Call +91-9876543210";
      const detections = detector.detectPhone(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should not detect short sequences as phone", () => {
      const text = "The year is 2026";
      const detections = detector.detectPhone(text);
      // Should not detect "2026" as phone (less than 10 digits or all same pattern)
      expect(detections).toHaveLength(0);
    });

    it("should not detect numbers like 100", () => {
      const text = "I need 100 items";
      const detections = detector.detectPhone(text);
      expect(detections).toHaveLength(0);
    });
  });

  describe("Customer ID Detection", () => {
    it("should detect CUST- format", () => {
      const text = "Customer ID: CUST-92831";
      const detections = detector.detectCustomerId(text);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0].type).toBe("CUSTOMER_ID");
    });

    it("should detect CUSTOMER- format", () => {
      const text = "customer_id=CUSTOMER-12345";
      const detections = detector.detectCustomerId(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect with contextual prefix", () => {
      const text = "CUSTOMER_ID: CUST-92831";
      const detections = detector.detectCustomerId(text);
      expect(detections.length).toBeGreaterThan(0);
    });
  });

  describe("Person Detection", () => {
    it("should detect name with Customer prefix", () => {
      const text = "Customer: Rahul Sharma";
      const detections = detector.detectPerson(text);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0].type).toBe("PERSON");
    });

    it("should detect name with Name prefix", () => {
      const text = "Name: John Smith";
      const detections = detector.detectPerson(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect name with Employee prefix", () => {
      const text = "Employee: Amit Kumar";
      const detections = detector.detectPerson(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should not detect single words as names", () => {
      const text = "Hello there";
      const detections = detector.detectPerson(text);
      // "Hello" and "there" are not proper names
      expect(detections).toHaveLength(0);
    });
  });

  describe("Credit Card Detection", () => {
    it("should detect valid credit card with spaces", () => {
      const text = "Card: 4111 1111 1111 1111";
      const detections = detector.detectCreditCard(text);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0].type).toBe("CREDIT_CARD");
    });

    it("should detect valid credit card with dashes", () => {
      const text = "4111-1111-1111-1111";
      const detections = detector.detectCreditCard(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect valid credit card without separators", () => {
      const text = "4111111111111111";
      const detections = detector.detectCreditCard(text);
      expect(detections.length).toBeGreaterThan(0);
    });
  });

  describe("Secret Detection", () => {
    it("should detect AWS access key", () => {
      const text = "My AWS key is AKIAIOSFODNN7EXAMPLE";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
      expect(detections[0].type).toBe("SECRET");
    });

    it("should detect GitHub token", () => {
      const text = "token: ghp_abcdefghijklmnopqrstuvwxyzabcdefghij";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect OpenAI API key", () => {
      const text = "api_key=sk-proj-abcdefghijklmnopqrs";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect Bearer token", () => {
      const text = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect API_KEY pattern", () => {
      const text = "API_KEY=abcdefghijklmnopqrstuvwxyz123456";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
    });

    it("should detect PASSWORD pattern", () => {
      const text = "PASSWORD=SuperSecretPassword123456";
      const detections = detector.detectSecret(text);
      expect(detections.length).toBeGreaterThan(0);
    });
  });

  describe("Multiple Entity Detection", () => {
    it("should detect multiple different entity types", () => {
      const text = `
        Customer: Rahul Sharma
        Email: rahul@gmail.com
        Phone: 9876543210
        Customer ID: CUST-92831
      `;
      const detections = detector.detect(text);
      expect(detections.length).toBeGreaterThan(0);

      const types = new Set(detections.map((d) => d.type));
      expect(types.has("PERSON")).toBe(true);
      expect(types.has("EMAIL")).toBe(true);
      expect(types.has("PHONE")).toBe(true);
      expect(types.has("CUSTOMER_ID")).toBe(true);
    });

    it("should not detect overlapping entities", () => {
      const text = "rahul@gmail.com";
      const detections = detector.detect(text);
      // Should only detect as EMAIL, not also as something else
      expect(detections.every((d) => d.type === "EMAIL")).toBe(true);
    });
  });

  describe("No Sensitive Data", () => {
    it("should return empty for normal text", () => {
      const text = "Explain the difference between RAG and fine-tuning.";
      const detections = detector.detect(text);
      expect(detections).toHaveLength(0);
    });

    it("should return empty for empty string", () => {
      const text = "";
      const detections = detector.detect(text);
      expect(detections).toHaveLength(0);
    });
  });
});
