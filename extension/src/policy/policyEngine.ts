import { Action, Detection, OrgPolicy, RiskResult } from "../types/index";

export class PolicyEngine {
  getRecommendedAction(
    detections: Detection[],
    risk: RiskResult,
    destination: string = "chatgpt.com",
    orgPolicy?: OrgPolicy
  ): Action {
    if (detections.length === 0) {
      return "ALLOW";
    }

    const policyAction = this.getOrgPolicyAction(detections, orgPolicy);
    if (policyAction) {
      return policyAction;
    }

    // Check for secret or credit card - always block
    for (const detection of detections) {
      if (detection.type === "SECRET" || detection.type === "CREDIT_CARD") {
        return "BLOCK";
      }
    }

    // For other sensitive data, recommend redaction
    for (const detection of detections) {
      if (
        detection.type === "EMAIL" ||
        detection.type === "PHONE" ||
        detection.type === "CUSTOMER_ID" ||
        detection.type === "PERSON"
      ) {
        return "REDACT";
      }
    }

    return "ALLOW";
  }

  getDefaultAction(riskLevel: string): Action {
    switch (riskLevel) {
      case "CRITICAL":
        return "BLOCK";
      case "HIGH":
        return "REDACT";
      case "MEDIUM":
        return "REDACT";
      case "LOW":
      default:
        return "ALLOW";
    }
  }

  private getOrgPolicyAction(detections: Detection[], orgPolicy?: OrgPolicy): Action | null {
    if (!orgPolicy) {
      return null;
    }

    let selectedAction: Action | null = null;

    for (const detection of detections) {
      const action = orgPolicy[detection.type];
      if (!action) continue;

      if (action === "BLOCK") {
        return "BLOCK";
      }

      if (action === "REDACT") {
        selectedAction = "REDACT";
      }
    }

    return selectedAction;
  }
}

export default new PolicyEngine();
