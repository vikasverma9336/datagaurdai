import { OrganizationSession } from "../types/index";

const API_BASE_URL = "http://localhost:8000";
const SESSION_KEY = "dataguardSession";

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[DataGuard AI] Extension installed");
  } else if (details.reason === "update") {
    console.log("[DataGuard AI] Extension updated");
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_EXTENSION_STATUS") {
    sendResponse({
      enabled: true,
      version: chrome.runtime.getManifest().version,
    });
    return;
  }

  if (request.type === "LOGIN") {
    login(request.email)
      .then((session) => sendResponse({ ok: true, session }))
      .catch((error) => sendResponse({ ok: false, error: getErrorMessage(error) }));
    return true;
  }

  if (request.type === "LOGOUT") {
    chrome.storage.local.remove(SESSION_KEY, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (request.type === "GET_SESSION") {
    getStoredSession()
      .then((session) => sendResponse({ ok: true, session }))
      .catch((error) => sendResponse({ ok: false, error: getErrorMessage(error) }));
    return true;
  }

  if (request.type === "REFRESH_POLICY") {
    refreshPolicy()
      .then((session) => sendResponse({ ok: true, session }))
      .catch((error) => sendResponse({ ok: false, error: getErrorMessage(error) }));
    return true;
  }

  if (request.type === "LOG_SECURITY_EVENT") {
    logSecurityEvent(request.event)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: getErrorMessage(error) }));
    return true;
  }
});

async function login(email: string): Promise<OrganizationSession> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Login failed. Start backend and use a demo user.");
  }

  const session = (await response.json()) as OrganizationSession;
  await storeSession(session);
  return session;
}

async function refreshPolicy(): Promise<OrganizationSession | null> {
  const session = await getStoredSession();
  if (!session) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/policy?token=${encodeURIComponent(session.token)}`);
  if (!response.ok) {
    throw new Error("Could not refresh policy");
  }

  const refreshedSession = (await response.json()) as OrganizationSession;
  await storeSession(refreshedSession);
  return refreshedSession;
}

async function logSecurityEvent(event: Record<string, unknown>): Promise<void> {
  const session = await getStoredSession();
  if (!session) {
    return;
  }

  await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(event),
  });
}

function getStoredSession(): Promise<OrganizationSession | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(SESSION_KEY, (result) => {
      resolve((result[SESSION_KEY] as OrganizationSession) || null);
    });
  });
}

function storeSession(session: OrganizationSession): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SESSION_KEY]: session }, resolve);
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
