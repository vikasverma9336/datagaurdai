import { describe, it, expect } from "vitest";
import { RiskEngine } from "../src/risk/riskEngine";
import { Detection } from "../src/types/index";

describe("RiskEngine", () => {
  const riskEngine = new RiskEngine();

  describe("Risk Score Calculation", () => {
    it("should calculate LOW risk for no detections", () => {
      const detections: Detection[] = [];
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("LOW");
      expect(result.score).toBeLessThanOrEqual(30);
    });

    it("should calculate MEDIUM risk for email and phone", () => {
      const detections: Detection[] = [
        {
          type: "EMAIL",
          start: 0,
          end: 5,
          confidence: 0.99,
          risk: 20,
        },
        {
          type: "PHONE",
          start: 10,
          end: 20,
          confidence: 0.85,
          risk: 20,
        },
      ];
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("MEDIUM");
      expect(result.score).toBeGreaterThan(30);
      expect(result.score).toBeLessThanOrEqual(60);
    });

    it("should calculate CRITICAL risk for multiple PII", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 5, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 10, end: 20, confidence: 0.85, risk: 20 },
        { type: "CUSTOMER_ID", start: 30, end: 40, confidence: 0.9, risk: 25 },
      ];
      const result = riskEngine.calculateRisk(detections);
      // EMAIL (20) + PHONE (20) + CUSTOMER_ID (25) + ChatGPT (20) = 85
      expect(result.level).toBe("CRITICAL");
      expect(result.score).toBeGreaterThan(80);
    });

    it("should calculate CRITICAL risk for secret", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
      ];
      const result = riskEngine.calculateRisk(detections);
      // SECRET (50) + ChatGPT (20) = 70 -> HIGH
      expect(result.level).toBe("HIGH");
      expect(result.score).toBeGreaterThan(60);
    });

    it("should calculate CRITICAL risk for credit card", () => {
      const detections: Detection[] = [
        { type: "CREDIT_CARD", start: 0, end: 16, confidence: 0.95, risk: 40 },
      ];
      const result = riskEngine.calculateRisk(detections);
      // CREDIT_CARD (40) + ChatGPT (20) = 60 -> MEDIUM
      expect(result.level).toBe("MEDIUM");
      expect(result.score).toBeGreaterThanOrEqual(31);
    });

    it("should calculate CRITICAL risk for secret and credit card together", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
        { type: "CREDIT_CARD", start: 30, end: 46, confidence: 0.95, risk: 40 },
      ];
      const result = riskEngine.calculateRisk(detections);
      // SECRET (50) + CREDIT_CARD (40) + ChatGPT (20) = 110, capped at 100
      expect(result.level).toBe("CRITICAL");
      expect(result.score).toBe(100);
    });

    it("should cap score at maximum 100", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
        { type: "CREDIT_CARD", start: 30, end: 46, confidence: 0.95, risk: 40 },
        { type: "EMAIL", start: 50, end: 60, confidence: 0.99, risk: 20 },
      ];
      const result = riskEngine.calculateRisk(detections);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should include destination risk for ChatGPT", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 5, confidence: 0.99, risk: 20 },
      ];
      const result = riskEngine.calculateRisk(detections, "chatgpt.com");
      // EMAIL risk (20) + ChatGPT destination risk (20) = 40
      expect(result.score).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Risk Level Mapping", () => {
    it("should map 0-30 to LOW", () => {
      const detections: Detection[] = [
        { type: "PERSON", start: 0, end: 5, confidence: 0.75, risk: 10 },
      ];
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("LOW");
    });

    it("should map 31-60 to MEDIUM", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 5, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 10, end: 20, confidence: 0.85, risk: 20 },
      ];
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("MEDIUM");
    });

    it("should map 61-80 to HIGH", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 5, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 10, end: 20, confidence: 0.85, risk: 20 },
        { type: "PERSON", start: 30, end: 40, confidence: 0.75, risk: 10 },
      ];
      // EMAIL (20) + PHONE (20) + PERSON (10) + ChatGPT (20) = 70 -> HIGH
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("HIGH");
    });

    it("should map 81-100 to CRITICAL", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
        { type: "CREDIT_CARD", start: 30, end: 46, confidence: 0.95, risk: 40 },
      ];
      // SECRET (50) + CREDIT_CARD (40) + ChatGPT (20) = 110, capped at 100
      const result = riskEngine.calculateRisk(detections);
      expect(result.level).toBe("CRITICAL");
    });
  });

  describe("Sensitive Data Detection", () => {
    it("should return true when detections exist", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 5, confidence: 0.99, risk: 20 },
      ];
      expect(riskEngine.hasSensitiveData(detections)).toBe(true);
    });

    it("should return false when no detections", () => {
      const detections: Detection[] = [];
      expect(riskEngine.hasSensitiveData(detections)).toBe(false);
    });
  });
});
