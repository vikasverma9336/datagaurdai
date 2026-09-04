import { Detection, RiskResult } from "../types/index";

export class RiskEngine {
  private readonly MAX_SCORE = 100;
  private readonly DESTINATION_RISK: Record<string, number> = {
    "chatgpt.com": 20,
    "chat.openai.com": 20,
  };

  calculateRisk(detections: Detection[], destination: string = "chatgpt.com"): RiskResult {
    let score = 0;

    // Add risk from each detection
    for (const detection of detections) {
      score += detection.risk;
    }

    // Add destination risk
    const destRisk = this.getDestinationRisk(destination);
    score += destRisk;

    // Cap at maximum
    score = Math.min(score, this.MAX_SCORE);

    const level = this.scoreToLevel(score);

    return {
      score,
      level,
    };
  }

  private getDestinationRisk(destination: string): number {
    for (const [host, risk] of Object.entries(this.DESTINATION_RISK)) {
      if (destination.includes(host)) {
        return risk;
      }
    }
    return 0;
  }

  private scoreToLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score <= 30) return "LOW";
    if (score <= 60) return "MEDIUM";
    if (score <= 80) return "HIGH";
    return "CRITICAL";
  }

  hasSensitiveData(detections: Detection[]): boolean {
    return detections.length > 0;
  }
}

export default new RiskEngine();
