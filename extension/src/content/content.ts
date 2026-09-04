import detector from "../detector/detector";
import riskEngine from "../risk/riskEngine";
import policyEngine from "../policy/policyEngine";
import redactor from "../redaction/redactor";
import chatgptAdapter from "./chatgptAdapter";
import { InputObserver } from "./inputObserver";
import { OrganizationSession, SecurityCheckResult } from "../types/index";
import { SecurityModalDOM } from "../ui/SecurityModalDOM";
import { extensionDebugger, logger } from "./debugger";

class PromptInterceptor {
  private inputObserver: InputObserver;
  private modalDOM: SecurityModalDOM;
  private isProcessing = false;
  private lastPromptText = "";
  private session: OrganizationSession | null = null;

  constructor() {
    this.inputObserver = new InputObserver(chatgptAdapter);
    this.modalDOM = new SecurityModalDOM();
    extensionDebugger.init();
    this.initialize();
  }

  private initialize(): void {
    // Wait for page to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start());
    } else {
      this.start();
    }
  }

  private start(): void {
    // Give ChatGPT a moment to render
    setTimeout(() => {
      logger.info("Starting prompt monitoring...");
      this.inputObserver.start(() => this.handleSubmitAttempt());
      logger.info("✓ DataGuard AI is actively monitoring ChatGPT prompts");
    }, 500);
  }

  private async handleSubmitAttempt(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.inputObserver.pauseSubmit();

    try {
      const promptText = this.inputObserver.getPromptText();
      this.lastPromptText = promptText;

      logger.debug("Submit attempt detected", {
        textLength: promptText.length,
        preview: promptText.substring(0, 50) + "...",
      });

      // Run detection
      const result = await this.performSecurityCheck(promptText);

      logger.debug("Security check complete", {
        detections: result.detections.length,
        riskScore: result.risk.score,
        riskLevel: result.risk.level,
      });

      if (result.hasRisk) {
        logger.warn("Sensitive data detected - showing modal");
        // Show security modal
        await this.showSecurityModal(result);
      } else {
        logger.info("No sensitive data detected - allowing submission");
        // No risk, allow submission
        this.inputObserver.allowSubmit();
        this.inputObserver.resumeSubmit();
        setTimeout(() => {
          this.inputObserver.submitAllowed();
          this.isProcessing = false;
          this.logSecurityEvent(result, "ALLOW");
        }, 50);
      }
    } catch (error) {
      logger.error("Error during security check", error);
      // Fail safely - allow submission
      this.inputObserver.resumeSubmit();
      this.isProcessing = false;
    }
  }

  private async performSecurityCheck(promptText: string): Promise<SecurityCheckResult> {
    this.session = await this.getSession();

    // Detect sensitive data
    const detections = detector.detect(promptText);

    // Calculate risk
    const risk = riskEngine.calculateRisk(detections, "chatgpt.com");

    // Get recommended action
    const recommendedAction = policyEngine.getRecommendedAction(
      detections,
      risk,
      "chatgpt.com",
      this.session?.policy
    );

    return {
      hasRisk: riskEngine.hasSensitiveData(detections),
      detections,
      risk,
      recommendedAction,
      destination: "ChatGPT",
      organizationName: this.session?.organization.name,
    };
  }

  private async showSecurityModal(result: SecurityCheckResult): Promise<void> {
    const action = await this.modalDOM.show(
      result.detections,
      result.risk,
      result.destination,
      result.recommendedAction,
      result.organizationName,
      {
        onBlock: () => this.handleBlock(result),
        onRedact: () => this.handleRedact(result),
        onAllow: () => this.handleAllow(result),
      }
    );
  }

  private handleBlock(result?: SecurityCheckResult): void {
    this.showBlockMessage();
    this.inputObserver.resumeSubmit();
    this.isProcessing = false;
    if (result) this.logSecurityEvent(result, "BLOCK");
  }

  private handleRedact(result: SecurityCheckResult): void {
    const redactedText = redactor.redact(this.lastPromptText, result.detections);
    this.inputObserver.setPromptText(redactedText);
    this.inputObserver.resumeSubmit();
    this.isProcessing = false;

    // Submit the redacted prompt
    setTimeout(() => {
      this.inputObserver.submitAllowed();
      this.logSecurityEvent(result, "REDACT");
    }, 100);
  }

  private handleAllow(result?: SecurityCheckResult): void {
    this.inputObserver.resumeSubmit();
    this.isProcessing = false;

    // Submit the original prompt
    setTimeout(() => {
      this.inputObserver.submitAllowed();
      if (result) this.logSecurityEvent(result, "ALLOW");
    }, 50);
  }

  private getSession(): Promise<OrganizationSession | null> {
    return new Promise((resolve) => {
      if (!chrome?.runtime?.sendMessage) {
        resolve(null);
        return;
      }

      chrome.runtime.sendMessage({ type: "REFRESH_POLICY" }, (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          logger.warn("Using default local policy. Backend session not available.");
          resolve(null);
          return;
        }

        resolve(response.session || null);
      });
    });
  }

  private logSecurityEvent(result: SecurityCheckResult, actionTaken: string): void {
    if (!chrome?.runtime?.sendMessage || !this.session) {
      return;
    }

    chrome.runtime.sendMessage({
      type: "LOG_SECURITY_EVENT",
      event: {
        destination: result.destination,
        detectedTypes: [...new Set(result.detections.map((d) => d.type))],
        riskScore: result.risk.score,
        riskLevel: result.risk.level,
        actionTaken,
      },
    });
  }

  private showBlockMessage(): void {
    const messageContainer = document.createElement("div");
    messageContainer.id = "dg-block-message";
    messageContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      z-index: 999999;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    messageContainer.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">🛑</div>
      <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #dc2626;">Request Blocked</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
        DataGuard AI prevented this prompt from being sent to ChatGPT.
      </p>
      <button id="dg-close-block" style="
        margin-top: 16px;
        padding: 10px 24px;
        background-color: #1f2937;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      ">Close</button>
    `;

    document.body.appendChild(messageContainer);

    const closeBtn = document.getElementById("dg-close-block");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        messageContainer.remove();
      });
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.remove();
      }
    }, 5000);
  }
}

// Initialize when script loads
const interceptor = new PromptInterceptor();
