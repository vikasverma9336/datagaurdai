import React, { useState } from "react";
import { Detection, RiskResult, Action } from "../types/index";
import "./styles.css";

interface SecurityModalProps {
  detections: Detection[];
  risk: RiskResult;
  destination: string;
  recommendedAction: Action;
  onBlock: () => void;
  onRedact: () => void;
  onAllow: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  detections,
  risk,
  destination,
  recommendedAction,
  onBlock,
  onRedact,
  onAllow,
}) => {
  const [selectedAction, setSelectedAction] = useState<Action>(recommendedAction);

  const uniqueTypes = [...new Set(detections.map((d) => d.type))];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "#dc2626"; // Red
      case "HIGH":
        return "#ea580c"; // Orange
      case "MEDIUM":
        return "#f59e0b"; // Amber
      case "LOW":
        return "#10b981"; // Green
      default:
        return "#6b7280"; // Gray
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "#fee2e2";
      case "HIGH":
        return "#fed7aa";
      case "MEDIUM":
        return "#fef3c7";
      case "LOW":
        return "#d1fae5";
      default:
        return "#f3f4f6";
    }
  };

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
  };

  const handleConfirm = () => {
    switch (selectedAction) {
      case "BLOCK":
        onBlock();
        break;
      case "REDACT":
        onRedact();
        break;
      case "ALLOW":
        onAllow();
        break;
    }
  };

  return (
    <div className="dg-modal-overlay">
      <div className="dg-modal">
        <div className="dg-modal-header">
          <div className="dg-modal-title">
            <span className="dg-shield-icon">🛡</span>
            <div>
              <h2>DataGuard AI</h2>
              <p>Secure Enterprise AI Usage</p>
            </div>
          </div>
        </div>

        <div className="dg-modal-content">
          <div className="dg-warning">
            <span className="dg-warning-icon">⚠</span>
            <span>Sensitive information detected</span>
          </div>

          <div
            className="dg-risk-score"
            style={{
              backgroundColor: getRiskBgColor(risk.level),
              borderColor: getRiskColor(risk.level),
            }}
          >
            <div className="dg-risk-number" style={{ color: getRiskColor(risk.level) }}>
              {risk.score} / 100
            </div>
            <div className="dg-risk-level" style={{ color: getRiskColor(risk.level) }}>
              {risk.level}
            </div>
          </div>

          <div className="dg-section">
            <h3>Detected</h3>
            <div className="dg-entity-list">
              {uniqueTypes.map((type) => (
                <div key={type} className="dg-entity-item">
                  <span className="dg-entity-badge">🔴</span>
                  <span className="dg-entity-type">{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dg-section">
            <h3>Destination</h3>
            <p className="dg-destination">{destination}</p>
          </div>
        </div>

        <div className="dg-modal-actions">
          <div className="dg-action-buttons">
            <button
              className={`dg-btn dg-btn-block ${selectedAction === "BLOCK" ? "selected" : ""}`}
              onClick={() => handleActionClick("BLOCK")}
              title="Block this request entirely"
            >
              BLOCK
            </button>
            <button
              className={`dg-btn dg-btn-redact ${selectedAction === "REDACT" ? "selected" : ""}`}
              onClick={() => handleActionClick("REDACT")}
              title="Remove sensitive information and continue"
            >
              REDACT & CONTINUE
            </button>
          </div>
          <button
            className={`dg-btn dg-btn-allow ${selectedAction === "ALLOW" ? "selected" : ""}`}
            onClick={() => handleActionClick("ALLOW")}
            title="Send the original prompt without changes"
          >
            ALLOW
          </button>
        </div>

        <div className="dg-modal-footer">
          <button className="dg-btn-confirm" onClick={handleConfirm}>
            {selectedAction === "BLOCK" ? "Block Request" : 
             selectedAction === "REDACT" ? "Redact & Continue" : 
             "Allow"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
