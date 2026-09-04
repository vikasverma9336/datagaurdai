import React, { useEffect, useState } from "react";
import { OrganizationSession } from "../types/index";
import "./styles.css";

type MessageResponse = {
  ok: boolean;
  session?: OrganizationSession | null;
  error?: string;
};

const DEMO_USERS = [
  {
    email: "user1@techcorp.demo",
    organization: "TechCorp",
    role: "Employee",
    behavior: "PII redacts",
  },
  {
    email: "admin@techcorp.demo",
    organization: "TechCorp",
    role: "Admin",
    behavior: "PII redacts",
  },
  {
    email: "user1@financecorp.demo",
    organization: "FinanceCorp",
    role: "Employee",
    behavior: "PII blocks",
  },
  {
    email: "admin@financecorp.demo",
    organization: "FinanceCorp",
    role: "Admin",
    behavior: "PII blocks",
  },
];

export const ExtensionPopup: React.FC = () => {
  const [session, setSession] = useState<OrganizationSession | null>(null);
  const [email, setEmail] = useState("user1@techcorp.demo");
  const [status, setStatus] = useState("Backend: not checked");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    sendMessage({ type: "GET_SESSION" }).then((response) => {
      if (response.ok && response.session) {
        setSession(response.session);
        setEmail(response.session.user.email);
        setStatus("Connected");
      }
    });
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setStatus("Connecting...");

    const response = await sendMessage({ type: "LOGIN", email });
    setIsLoading(false);

    if (response.ok && response.session) {
      setSession(response.session);
      setStatus("Connected");
    } else {
      setStatus(response.error || "Login failed");
    }
  };

  const handleLogout = async () => {
    await sendMessage({ type: "LOGOUT" });
    setSession(null);
    setStatus("Logged out");
  };

  const policyEntries = session ? Object.entries(session.policy) : [];
  const activeOrgName = session?.organization.name || "Local Mode";

  return (
    <div className="dg-popup">
      <div className="dg-popup-header">
        <img className="dg-popup-logo" src="icons/icon-48.png" alt="" />
        <div className="dg-popup-header-text">
          <h1>DataGuard AI</h1>
          <p>SaaS Policy Agent</p>
        </div>
      </div>

      <section className="dg-popup-panel">
        <div className="dg-section-title">
          <h2>Organization Login</h2>
          <span className={`dg-connection-badge ${session ? "connected" : ""}`}>
            {session ? "Connected" : "Offline"}
          </span>
        </div>
        <div className="dg-account-grid">
          {DEMO_USERS.map((user) => (
            <button
              className={`dg-account-card ${email === user.email ? "selected" : ""}`}
              key={user.email}
              onClick={() => setEmail(user.email)}
              type="button"
            >
              <span className="dg-account-main">
                <strong>{user.organization}</strong>
                <span>{user.role}</span>
              </span>
              <span className="dg-account-meta">{user.behavior}</span>
            </button>
          ))}
        </div>
        <div className="dg-popup-actions">
          <button className="dg-popup-button primary" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Connecting" : "Login"}
          </button>
          <button className="dg-popup-button" onClick={handleLogout} disabled={!session}>
            Logout
          </button>
        </div>
        <div className="dg-popup-status">{status}</div>
      </section>

      <section className="dg-popup-panel compact">
        <div className="dg-section-title">
          <h2>Protection</h2>
          <span className="dg-org-pill">{activeOrgName}</span>
        </div>
        <div className="dg-popup-item">
          <div className="dg-status-indicator"></div>
          <span>{session ? "Organization policy active" : "Default local policy active"}</span>
        </div>
      </section>

      <section className="dg-popup-panel compact">
        <div className="dg-section-title">
          <h2>Protected Applications</h2>
        </div>
        <div className="dg-popup-item">
          <span className="dg-app-badge">OK</span>
          <span>ChatGPT</span>
        </div>
      </section>

      <section className="dg-popup-panel">
        <div className="dg-section-title">
          <h2>Org Policy</h2>
        </div>
        {policyEntries.length > 0 ? (
          <div className="dg-policy-list">
            {policyEntries.map(([entityType, action]) => (
              <div className="dg-policy-row" key={entityType}>
                <span className="dg-policy-type">{formatEntityType(entityType)}</span>
                <strong className={`dg-action-badge policy-${action.toLowerCase()}`}>
                  {action}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="dg-popup-muted">Login to sync company policy.</div>
        )}
      </section>

      <div className="dg-popup-description">
        <strong>Privacy</strong>
        <p>Detection stays local. Only event metadata is sent to the demo backend.</p>
      </div>
    </div>
  );
};

function formatEntityType(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sendMessage(message: Record<string, unknown>): Promise<MessageResponse> {
  return new Promise((resolve) => {
    if (!chrome?.runtime?.sendMessage) {
      resolve({ ok: false, error: "Chrome runtime unavailable" });
      return;
    }

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      resolve(response || { ok: false, error: "No response" });
    });
  });
}

export default ExtensionPopup;
