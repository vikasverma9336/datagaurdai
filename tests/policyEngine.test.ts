import { describe, it, expect } from "vitest";
import { PolicyEngine } from "../src/policy/policyEngine";
import { Detection, RiskResult } from "../src/types/index";

describe("PolicyEngine", () => {
  const policyEngine = new PolicyEngine();

  describe("Recommended Actions", () => {
    it("should recommend BLOCK for SECRET", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
      ];
      const risk: RiskResult = { score: 70, level: "CRITICAL" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });

    it("should recommend BLOCK for CREDIT_CARD", () => {
      const detections: Detection[] = [
        { type: "CREDIT_CARD", start: 0, end: 16, confidence: 0.95, risk: 40 },
      ];
      const risk: RiskResult = { score: 60, level: "HIGH" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });

    it("should recommend REDACT for EMAIL", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 20, confidence: 0.99, risk: 20 },
      ];
      const risk: RiskResult = { score: 40, level: "MEDIUM" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });

    it("should recommend REDACT for PHONE", () => {
      const detections: Detection[] = [
        { type: "PHONE", start: 0, end: 10, confidence: 0.85, risk: 20 },
      ];
      const risk: RiskResult = { score: 40, level: "MEDIUM" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });

    it("should recommend REDACT for CUSTOMER_ID", () => {
      const detections: Detection[] = [
        { type: "CUSTOMER_ID", start: 0, end: 10, confidence: 0.9, risk: 25 },
      ];
      const risk: RiskResult = { score: 45, level: "MEDIUM" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });

    it("should recommend REDACT for PERSON", () => {
      const detections: Detection[] = [
        { type: "PERSON", start: 0, end: 10, confidence: 0.75, risk: 10 },
      ];
      const risk: RiskResult = { score: 30, level: "LOW" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });

    it("should recommend ALLOW when no detections", () => {
      const detections: Detection[] = [];
      const risk: RiskResult = { score: 0, level: "LOW" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("ALLOW");
    });

    it("should prioritize BLOCK over REDACT when both exist", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
        { type: "EMAIL", start: 30, end: 50, confidence: 0.99, risk: 20 },
      ];
      const risk: RiskResult = { score: 90, level: "CRITICAL" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });

    it("should recommend REDACT for multiple non-blocking entities", () => {
      const detections: Detection[] = [
        { type: "EMAIL", start: 0, end: 20, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 30, end: 40, confidence: 0.85, risk: 20 },
        { type: "CUSTOMER_ID", start: 50, end: 60, confidence: 0.9, risk: 25 },
      ];
      const risk: RiskResult = { score: 85, level: "HIGH" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });
  });

  describe("Default Actions by Risk Level", () => {
    it("should return BLOCK for CRITICAL level", () => {
      const action = policyEngine.getDefaultAction("CRITICAL");
      expect(action).toBe("BLOCK");
    });

    it("should return REDACT for HIGH level", () => {
      const action = policyEngine.getDefaultAction("HIGH");
      expect(action).toBe("REDACT");
    });

    it("should return REDACT for MEDIUM level", () => {
      const action = policyEngine.getDefaultAction("MEDIUM");
      expect(action).toBe("REDACT");
    });

    it("should return ALLOW for LOW level", () => {
      const action = policyEngine.getDefaultAction("LOW");
      expect(action).toBe("ALLOW");
    });

    it("should return ALLOW for unknown level", () => {
      const action = policyEngine.getDefaultAction("UNKNOWN");
      expect(action).toBe("ALLOW");
    });
  });

  describe("Policy Scenarios", () => {
    it("scenario 1: Normal prompt - should allow", () => {
      const detections: Detection[] = [];
      const risk: RiskResult = { score: 0, level: "LOW" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("ALLOW");
    });

    it("scenario 2: Customer PII - should redact", () => {
      const detections: Detection[] = [
        { type: "PERSON", start: 0, end: 10, confidence: 0.75, risk: 10 },
        { type: "EMAIL", start: 20, end: 40, confidence: 0.99, risk: 20 },
        { type: "PHONE", start: 50, end: 60, confidence: 0.85, risk: 20 },
        { type: "CUSTOMER_ID", start: 70, end: 80, confidence: 0.9, risk: 25 },
      ];
      const risk: RiskResult = { score: 85, level: "CRITICAL" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("REDACT");
    });

    it("scenario 3: Secret detected - should block", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
      ];
      const risk: RiskResult = { score: 70, level: "CRITICAL" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });

    it("scenario 4: Credit card detected - should block", () => {
      const detections: Detection[] = [
        { type: "CREDIT_CARD", start: 0, end: 16, confidence: 0.95, risk: 40 },
      ];
      const risk: RiskResult = { score: 60, level: "HIGH" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });

    it("scenario 5: Multiple secrets - should block", () => {
      const detections: Detection[] = [
        { type: "SECRET", start: 0, end: 20, confidence: 0.98, risk: 50 },
        { type: "CREDIT_CARD", start: 30, end: 46, confidence: 0.95, risk: 40 },
      ];
      const risk: RiskResult = { score: 100, level: "CRITICAL" };
      const action = policyEngine.getRecommendedAction(detections, risk);
      expect(action).toBe("BLOCK");
    });
  });
});
