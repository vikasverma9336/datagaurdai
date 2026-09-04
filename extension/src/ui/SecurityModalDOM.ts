import { Detection, RiskResult, Action } from "../types/index";

/**
 * Vanilla DOM version of SecurityModal (no React dependency)
 * Used in content script to avoid React bundling issues
 */
export class SecurityModalDOM {
  private modalElement: HTMLElement | null = null;
  private onBlock: ((reason: string) => void) | null = null;
  private onRedact: (() => void) | null = null;
  private onAllow: (() => void) | null = null;
  private resolvePromise: ((action: Action) => void) | null = null;

  show(
    detections: Detection[],
    risk: RiskResult,
    destination: string,
    recommendedAction: Action,
    organizationName: string | undefined,
    callbacks: {
      onBlock: (reason: string) => void;
      onRedact: () => void;
      onAllow: () => void;
    }
  ): Promise<Action> {
    this.onBlock = callbacks.onBlock;
    this.onRedact = callbacks.onRedact;
    this.onAllow = callbacks.onAllow;

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.createAndShowModal(detections, risk, destination, recommendedAction, organizationName);
    });
  }

  private createAndShowModal(
    detections: Detection[],
    risk: RiskResult,
    destination: string,
    recommendedAction: Action,
    organizationName?: string
  ): void {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "dg-modal-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal container
    const modal = document.createElement("div");
    modal.id = "dg-security-modal";
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 320px;
      width: 90%;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: dg-slide-in 0.3s ease-out;
    `;

    // Add animation styles (only once)
    if (!document.getElementById("dg-modal-styles")) {
      const style = document.createElement("style");
      style.id = "dg-modal-styles";
      style.textContent = `
        @keyframes dg-slide-in {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes dg-slide-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
        }
        #dg-security-modal {
          animation: dg-slide-in 0.3s ease-out;
        }
        #dg-modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Get risk color
    const riskColors: { [key: string]: string } = {
      LOW: "#10b981",
      MEDIUM: "#f59e0b",
      HIGH: "#ef4444",
      CRITICAL: "#dc2626",
    };
    const riskColor = riskColors[risk.level] || "#6b7280";

    // Build header
    const logoUrl = chrome.runtime.getURL("icons/icon-128.png");
    const header = document.createElement("div");
    header.style.cssText = `
      text-align: center;
      margin-bottom: 14px;
    `;
    header.innerHTML = `
      <img src="${logoUrl}" alt="DataGuard AI" style="display: block; position: static; float: none; width: 40px; height: 40px; margin: 0 auto 8px auto; max-width: 40px; top: auto; left: auto; right: auto; bottom: auto; transform: none;" />
      <h2 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #1f2937;">
        Security Warning
      </h2>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Sensitive data detected in your prompt
      </p>
    `;

    // Build detections list
    const detectionsList = document.createElement("div");
    detectionsList.style.cssText = `
      background: #f9fafb;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 10px;
      font-size: 12px;
    `;

    const entityCounts: { [key: string]: number } = {};
    for (const det of detections) {
      entityCounts[det.type] = (entityCounts[det.type] || 0) + 1;
    }

    const entityLabels: { [key: string]: string } = {
      PERSON: "👤 Name",
      EMAIL: "✉️ Email",
      PHONE: "📱 Phone",
      CUSTOMER_ID: "🔢 Customer ID",
      CREDIT_CARD: "💳 Credit Card",
      SECRET: "🔐 Secret",
    };

    let detectionHTML = "";
    for (const [type, count] of Object.entries(entityCounts)) {
      const label = entityLabels[type] || type;
      detectionHTML += `
        <div style="padding: 3px 0; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #374151;">${label}</span>
          <span style="
            display: inline-block;
            background: ${this.getTypeColor(type)};
            color: white;
            padding: 1px 7px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          ">
            ${count}
          </span>
        </div>
      `;
    }

    detectionsList.innerHTML = detectionHTML;

    // Build risk score section
    const riskSection = document.createElement("div");
    riskSection.style.cssText = `
      background: ${riskColor}20;
      border-left: 4px solid ${riskColor};
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 10px;
    `;
    riskSection.innerHTML = `
      <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 2px;">RISK SCORE</div>
      <div style="font-size: 19px; font-weight: 700; color: ${riskColor};">
        ${risk.score}/100
      </div>
      <div style="font-size: 12px; font-weight: 600; color: ${riskColor}; margin-top: 2px;">
        ${risk.level}
      </div>
    `;

    const orgSection = document.createElement("div");
    orgSection.style.cssText = `
      padding: 7px 10px;
      margin-bottom: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #374151;
      font-size: 12px;
    `;
    orgSection.innerHTML = `
      <div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 2px;">ORGANIZATION POLICY</div>
      <div>${organizationName || "Default Local Policy"}: <strong>${recommendedAction}</strong></div>
    `;

    const actionLabels: { [key: string]: string } = {
      BLOCK: "🛑 BLOCK",
      REDACT: "🔒 REDACT & CONTINUE",
      ALLOW: "✅ ALLOW",
    };

    // Build buttons section
    const buttonsSection = document.createElement("div");
    buttonsSection.style.cssText = `
      display: grid;
      gap: 6px;
    `;

    for (const action of ["BLOCK", "REDACT", "ALLOW"] as const) {
      const btn = document.createElement("button");
      const isRecommended = action === recommendedAction;
      btn.innerHTML = actionLabels[action];
      btn.style.cssText = `
        padding: 8px 14px;
        border: ${isRecommended ? "2px solid" : "1px solid"} #e5e7eb;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        background: ${isRecommended ? riskColor : "white"};
        color: ${isRecommended ? "white" : "#374151"};
        ${isRecommended ? `box-shadow: 0 0 12px ${riskColor}40;` : ""}
      `;

      btn.addEventListener("click", () => {
        this.closeModal();
        if (action === "BLOCK") {
          this.onBlock?.("Blocked due to sensitive data detection");
          this.resolvePromise?.("BLOCK");
        } else if (action === "REDACT") {
          this.onRedact?.();
          this.resolvePromise?.("REDACT");
        } else {
          this.onAllow?.();
          this.resolvePromise?.("ALLOW");
        }
      });

      btn.addEventListener("mouseover", () => {
        if (!isRecommended) {
          btn.style.borderColor = "#d1d5db";
          btn.style.background = "#f3f4f6";
        }
      });

      btn.addEventListener("mouseout", () => {
        if (!isRecommended) {
          btn.style.borderColor = "#e5e7eb";
          btn.style.background = "white";
        }
      });

      buttonsSection.appendChild(btn);
    }

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(detectionsList);
    modal.appendChild(riskSection);
    modal.appendChild(orgSection);
    modal.appendChild(buttonsSection);

    // Add escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Add to page
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    this.modalElement = modal;

    // Focus first button for accessibility
    const buttons = modal.querySelectorAll("button");
    if (buttons.length > 0) {
      (buttons[0] as HTMLButtonElement).focus();
    }
  }

  private closeModal(): void {
    const overlay = document.getElementById("dg-modal-overlay");
    if (overlay) {
      overlay.style.animation = "dg-slide-out 0.3s ease-in";
      setTimeout(() => overlay.remove(), 300);
    }

    if (this.modalElement) {
      this.modalElement.style.animation = "dg-slide-out 0.3s ease-in";
      setTimeout(() => this.modalElement?.remove(), 300);
    }
  }

  private getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      PERSON: "#8b5cf6",
      EMAIL: "#3b82f6",
      PHONE: "#06b6d4",
      CUSTOMER_ID: "#ec4899",
      CREDIT_CARD: "#ef4444",
      SECRET: "#dc2626",
    };
    return colors[type] || "#6b7280";
  }
}
