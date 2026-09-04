import { describe, it, expect } from "vitest";
import detector from "../src/detector/detector";
import riskEngine from "../src/risk/riskEngine";
import policyEngine from "../src/policy/policyEngine";
import redactor from "../src/redaction/redactor";

describe("Test Case: Customer Information Prompt", () => {
  const testPrompt = `Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

Write a professional response.`;

  it("Should detect all sensitive entities", () => {
    const detections = detector.detect(testPrompt);

    console.log("Detections found:", detections.length);
    detections.forEach((d) => {
      const text = testPrompt.substring(d.start, d.end);
      console.log(`  - ${d.type}: "${text}" (confidence: ${d.confidence})`);
    });

    // Verify all entity types are detected
    const types = detections.map((d) => d.type);
    expect(types).toContain("PERSON"); // Rahul Sharma
    expect(types).toContain("EMAIL"); // rahul@gmail.com
    expect(types).toContain("PHONE"); // 9876543210
    expect(types).toContain("CUSTOMER_ID"); // CUST-92831
  });

  it("Should calculate HIGH/CRITICAL risk", () => {
    const detections = detector.detect(testPrompt);
    const risk = riskEngine.calculateRisk(detections, "chatgpt.com");

    console.log(`\nRisk Score: ${risk.score}/100`);
    console.log(`Risk Level: ${risk.level}`);

    // Multiple PII + destination should be HIGH or CRITICAL
    expect(
      risk.level === "HIGH" || risk.level === "CRITICAL"
    ).toBe(true);
    expect(risk.score).toBeGreaterThan(60);
  });

  it("Should recommend REDACT action", () => {
    const detections = detector.detect(testPrompt);
    const risk = riskEngine.calculateRisk(detections, "chatgpt.com");
    const action = policyEngine.getRecommendedAction(detections, risk, "chatgpt.com");

    console.log(`\nRecommended Action: ${action}`);
    expect(action).toBe("REDACT");
  });

  it("Should redact all sensitive data", () => {
    const detections = detector.detect(testPrompt);
    const redactedText = redactor.redact(testPrompt, detections);

    console.log(`\nOriginal:\n${testPrompt}`);
    console.log(`\nRedacted:\n${redactedText}`);

    // Verify sensitive data is replaced
    expect(redactedText).not.toContain("Rahul Sharma");
    expect(redactedText).not.toContain("rahul@gmail.com");
    expect(redactedText).not.toContain("9876543210");
    expect(redactedText).not.toContain("CUST-92831");

    // Verify placeholders are present
    expect(redactedText).toContain("[NAME]");
    expect(redactedText).toContain("[EMAIL]");
    expect(redactedText).toContain("[PHONE]");
    expect(redactedText).toContain("[CUSTOMER_ID]");
  });
});
