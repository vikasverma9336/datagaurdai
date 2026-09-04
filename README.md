# DataGuard AI — Secure Enterprise AI Usage

A Chrome Extension POC that protects enterprise users from accidentally sending sensitive information to external AI applications.

## 🛡 Problem

Employees can accidentally paste sensitive information into external AI applications like ChatGPT:

- **Customer PII** (names, emails, phone numbers, IDs)
- **API Keys** and access tokens
- **Passwords** and secrets
- **Credit card numbers**
- **Confidential business information**

Once shared, this data is stored by the AI service provider and becomes a security liability.

## ✅ Solution

**DataGuard AI** adds a local security layer between the employee and external AI applications.

The extension:

1. **Detects** sensitive information in real-time before submission (fully local)
2. **Assesses Risk** using a deterministic scoring model
3. **Applies Org Policy** — the signed-in organization's rules can override the default action per entity type
4. **Blocks** highly sensitive data (secrets, credit cards)
5. **Redacts** personal information (emails, phones, names, customer IDs)
6. **Allows** safe prompts without intervention

```
User Prompt
    ↓
DataGuard AI (Local Detection + Org Policy)
    ↓
No Risk? → Submit Normally
Has Risk? → Show Security Modal
    ↓
User Decision: BLOCK | REDACT | ALLOW
```

## 🏗 Architecture

```
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │ Chrome Browser  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ DataGuard AI    │
                  │ Chrome          │
                  │ Extension       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Prompt          │
                  │ Interceptor     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Local Sensitive │
                  │ Data Detector   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Risk Engine     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐        ┌──────────────────┐
                  │ Policy Engine   │◄───────│ Backend (local)  │
                  │ (org overrides) │        │ login / policy /  │
                  └────────┬────────┘        │ event log         │
                           │                  └──────────────────┘
                           ▼
              ┌────────────┴────────────┐
              │                         │
          No Risk                  Sensitive Data
              │                         │
              ▼                         ▼
       Submit Normally          Security Modal
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                      BLOCK        REDACT         ALLOW
                                    │
                                    ▼
                             Sanitized Prompt
                                    │
                                    ▼
                                  ChatGPT
```

## 🚀 Technology Stack

- **Frontend**: TypeScript, React 18
- **Build Tool**: Vite
- **Extension**: Chrome Manifest V3
- **Testing**: Vitest
- **Detection**: Regex patterns + deterministic rules
- **Validation**: Luhn algorithm (credit cards)
- **Backend (local demo)**: Python `http.server` + SQLite — handles login, org policy sync, and security-event logging only

**Detection and redaction always happen locally in the browser** — raw prompt text is never sent anywhere. The local backend is only used to authenticate a demo user, fetch their organization's policy, and record event *metadata* (risk score, detected types, action taken — never the prompt content).

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Python 3 (for the local demo backend)
- Google Chrome or Chromium-based browser

### Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm run test

# Start the local demo backend (login, org policy, event log)
npm run backend
# → runs at http://localhost:8000, seeds dataguard.db on first launch
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/dist` directory
5. With the backend running, click the extension icon and log in as a demo user (see [Organizations & Policies](#-organizations--policies))
6. Open ChatGPT (https://chatgpt.com or https://chat.openai.com)
7. Test with demo prompts below

> The extension works without the backend too — if login is skipped or the backend is unreachable, it falls back to the default local policy (see [Policy Engine](#-policy-engine)).

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

Tests cover:

- ✅ Email detection (basic, with dots, multiple)
- ✅ Phone detection (Indian 10-digit, international formats, country codes)
- ✅ Customer ID detection (CUST-, CUSTOMER-, contextual patterns)
- ✅ Person name detection (contextual heuristics)
- ✅ Credit card detection (with Luhn validation)
- ✅ Secret detection (AWS keys, GitHub tokens, API keys, Bearer tokens, JWT, passwords)
- ✅ Risk scoring (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Policy enforcement (BLOCK, REDACT, ALLOW)
- ✅ Redaction accuracy (multiple entities, overlaps, edge cases)

### Test Coverage

- **20+ meaningful unit tests** across all modules
- Full coverage of detection rules
- Risk calculation scenarios
- Policy evaluation paths

## 📋 Demo Scenarios

### Scenario 1 — Normal AI Usage

```
Prompt: Explain the difference between RAG and fine-tuning.

Expected: No warning, prompt submitted normally
```

### Scenario 2 — Customer PII

```
Prompt:
Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

The customer wants a refund. Write a professional response.

Expected:
- Risk Level: CRITICAL (85/100)
- Detections: PERSON, EMAIL, PHONE, CUSTOMER_ID
- Recommended: REDACT
- Options: BLOCK | REDACT & CONTINUE | ALLOW
```

### Scenario 3 — Secret Detected

```
Prompt:
My AWS access key is AKIAIOSFODNN7EXAMPLE. 
Help me debug this configuration.

Expected:
- Risk Level: CRITICAL (70/100)
- Detection: SECRET
- Recommended: BLOCK
- Message: "Request Blocked - DataGuard AI prevented submission"
```

### Scenario 4 — Multiple Sensitive Entities

```
Prompt:
Employee: Amit Kumar
Email: amit@example.com
Phone: +91 9876543210
Customer ID: CUST-12345

Expected:
- Multiple detections shown
- HIGH or CRITICAL risk
- Clear visualization of what was found
```

## 🔒 Privacy & Security

### Privacy Guarantees

✅ **Detection and redaction happen entirely locally** in the browser
✅ **No external (third-party) APIs** are called
✅ **No raw prompt text ever leaves the browser** — the local backend only receives login email, and event metadata (types/scores, not content)
✅ **No sensitive data storage** (no localStorage, no cookies for prompt content)
✅ **No raw prompt logging** to browser console
✅ **No third-party integrations**

### Sensitive Data Handling

- Secrets are **never logged**
- Credit cards are **never displayed**
- API keys are **never stored**
- Passwords are **never stored**
- Raw prompts are **not retained** after processing
- Only the session (token, user, org, policy) is persisted, in `chrome.storage.local`

### What Happens

1. User types/pastes prompt
2. Extension detects sensitive patterns **locally**
3. Risk score calculated **in-memory**, org policy applied if logged in
4. User makes decision (BLOCK/REDACT/ALLOW)
5. Event metadata (not prompt content) is optionally sent to the local backend for the audit log
6. Prompt data is cleared — nothing about its content persists

## 🎯 Supported Applications

### Currently Supported

- ✅ https://chatgpt.com/*
- ✅ https://chat.openai.com/*

### Architecture Supports Future Additions

- Claude (Anthropic)
- Gemini (Google)
- Microsoft Copilot
- Other AI platforms

The adapter pattern allows easy addition of new platforms without modifying core detection logic.

## 📊 Detection Rules

### Email

**Pattern**: RFC 5322 compliant regex
**Confidence**: 0.99
**Risk**: 20

Detects:
- `user@example.com`
- `john.doe@company.co.uk`
- `firstname.lastname@domain.org`

### Phone

**Pattern**: Multiple formats for international support
**Confidence**: 0.85
**Risk**: 20

Detects:
- `9876543210` (Indian 10-digit)
- `+91 9876543210`
- `+91-9876543210`
- `+1 555 123 4567` (US format)

Avoids false positives:
- Short numbers: `2026`, `100`
- All same digits: `1111111111`

### Customer ID

**Pattern**: Contextual + explicit format matching
**Confidence**: 0.90
**Risk**: 25

Detects:
- `CUST-92831`
- `CUSTOMER-12345`
- `customer_id=CUST-92831`
- `CUSTOMER_ID: CUST-92831`

### Person Name

**Pattern**: Contextual heuristic (lightweight NER)
**Confidence**: 0.75
**Risk**: 10

Detects:
- `Customer: Rahul Sharma`
- `Name: John Smith`
- `Employee: Amit Kumar`
- `From: Priya Verma`

Does NOT detect:
- Single words: `Hello`
- Non-capitalized text: `the quick brown fox`

### Credit Card

**Pattern**: Visa, Mastercard, Amex, Discover
**Validation**: Luhn algorithm
**Confidence**: 0.95
**Risk**: 40

Detects:
- `4111 1111 1111 1111` (Visa with spaces)
- `4111-1111-1111-1111` (with dashes)
- `4111111111111111` (no separators)

Uses Luhn validation to reduce false positives.

### Secret

**Pattern**: Multiple patterns for various secret types
**Confidence**: 0.98
**Risk**: 50 (HIGHEST)

Detects:
- **AWS Access Keys**: `AKIA[A-Z0-9]{16}`
- **GitHub Tokens**: `ghp_[a-zA-Z0-9]{36,255}`
- **OpenAI Keys**: `sk-[a-zA-Z0-9]{20,}`
- **Bearer Tokens**: `Bearer [token]`
- **JWT Tokens**: `eyJ[...]`
- **API Keys**: `API_KEY=...`, `api_key=...`
- **Passwords**: `PASSWORD=...`, `password=...`
- **Access Tokens**: `ACCESS_TOKEN=...`
- **Private Keys**: `-----BEGIN RSA PRIVATE KEY`

## 📈 Risk Scoring

### Entity Risk Weights

| Entity | Risk | Priority |
| --- | --- | --- |
| PERSON | 10 | Low |
| EMAIL | 20 | Medium |
| PHONE | 20 | Medium |
| CUSTOMER_ID | 25 | Medium-High |
| CREDIT_CARD | 40 | High |
| SECRET | 50 | Critical |
| ChatGPT Destination | +20 | Addition |

### Risk Levels

| Score | Level | Recommended Action |
| --- | --- | --- |
| 0-30 | 🟢 LOW | ALLOW |
| 31-60 | 🟡 MEDIUM | REDACT |
| 61-80 | 🟠 HIGH | REDACT |
| 81-100 | 🔴 CRITICAL | BLOCK |

### Example Calculation

```
Detections:
- EMAIL:       +20
- PHONE:       +20
- CUSTOMER_ID: +25
- ChatGPT:     +20
─────────────────
TOTAL:         85

Level: CRITICAL ⚠️
```

## 🏢 Organizations & Policies

Logging in (via the extension popup) ties the extension to an organization whose policy is fetched from the local backend and re-checked before every submission (`REFRESH_POLICY`). If no one is logged in, or the backend is unreachable, the extension falls back to the hardcoded default policy below.

### Demo Organizations

| Organization | Demo Users | Policy |
| --- | --- | --- |
| **TechCorp** | `admin@techcorp.demo`, `user1@techcorp.demo` | PERSON/EMAIL/PHONE/CUSTOMER_ID → REDACT; CREDIT_CARD/SECRET → BLOCK |
| **FinanceCorp** | `admin@financecorp.demo`, `user1@financecorp.demo` | Every entity type → BLOCK |

Each user has a `role` (`admin` or `employee`), but the current policy engine applies the same org-wide policy to every role — role is not yet used to vary behavior (see [Limitations](#️-limitations)).

Every security decision made while logged in is sent to the backend as an event (organization, detected entity types, risk score/level, action taken — never the prompt text itself) and stored in `dataguard.db`.

## 🚫 Policy Engine

### Default Actions by Entity Type

Used when no organization is logged in, or as a fallback when the org policy has no rule for a detected type:

| Entity Type | Default Action | Rationale |
| --- | --- | --- |
| SECRET | BLOCK | Never expose secrets |
| CREDIT_CARD | BLOCK | Payment card data is critical |
| EMAIL | REDACT | Can be anonymized |
| PHONE | REDACT | Can be anonymized |
| CUSTOMER_ID | REDACT | Can be anonymized |
| PERSON | REDACT | Names can be anonymized |

### Organization Policy Override

When a user is logged in, each detected entity type is checked against the organization's policy first:

1. If **any** detected entity has an org rule of `BLOCK`, the recommended action is `BLOCK`.
2. Else if any detected entity has an org rule of `REDACT`, the recommended action is `REDACT`.
3. Entity types with no matching org rule fall through to the default table above.

User can still **override** the recommended action by selecting BLOCK, REDACT, or ALLOW in the modal.

## 🔧 Redaction Engine

### Redaction Strategy

When user selects **REDACT & CONTINUE**:

1. Original prompt text is preserved in memory
2. Sensitive entities are replaced with placeholders
3. Redacted prompt replaces input field
4. User can review before submission
5. Sanitized prompt is sent to ChatGPT

### Placeholder Format

```
PERSON        → [NAME]
EMAIL         → [EMAIL]
PHONE         → [PHONE]
CUSTOMER_ID   → [CUSTOMER_ID]
CREDIT_CARD   → [CREDIT_CARD]
SECRET        → [SECRET]
```

### Example Redaction

**Original:**

```
Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

The customer wants a refund.
Write a professional response.
```

**Redacted:**

```
Customer: [NAME]
Email: [EMAIL]
Phone: [PHONE]
Customer ID: [CUSTOMER_ID]

The customer wants a refund.
Write a professional response.
```

## 🎨 UI/UX

### Security Modal

Modern enterprise security design with:

- Clear branding (🛡 DataGuard AI)
- Risk visualization (score / level)
- Entity breakdown (what was detected)
- Destination clarity (which service)
- Three action buttons (BLOCK | REDACT | ALLOW)
- Keyboard accessible
- Responsive design

### Extension Popup

Login and status dashboard showing:

- Organization login (pick one of the 4 demo users, connect/disconnect)
- Connection status (Connected / Offline)
- Active organization and whether org or default local policy is in effect
- Protected applications (ChatGPT)
- The signed-in org's policy per entity type
- Privacy guarantee

## 🔄 How It Works

### Step 1: Monitoring

Content script watches for:
- Submit button clicks
- Enter key presses (Ctrl/Cmd+Enter)
- Message input changes

### Step 2: Interception

When submission is detected:

1. Content script captures prompt text
2. Submission is paused
3. Security check begins

### Step 3: Detection

Local detector runs against prompt:

1. Regex patterns scan for known sensitive types
2. Validation rules filter false positives
3. Overlap detection removes duplicates
4. Detections sorted by risk

### Step 4: Risk Assessment

Risk engine calculates:

1. Sum of individual entity risks
2. Add destination risk
3. Cap at maximum (100)
4. Map to risk level (LOW/MEDIUM/HIGH/CRITICAL)

### Step 5: Policy Evaluation

Policy engine recommends action:

1. If a user is logged in, check the organization's policy for each detected type first (BLOCK > REDACT)
2. Otherwise (or for types with no org rule), check for blocking entities (SECRET, CREDIT_CARD)
3. Check for redactable entities (EMAIL, PHONE, etc.)
4. Return recommended action

### Step 6: User Decision

Modal displays:

- Detected entity types with visual indicators
- Risk score and level
- Recommended action highlighted
- Three explicit choices

User selects: **BLOCK** | **REDACT & CONTINUE** | **ALLOW**

### Step 7: Action Execution

**If BLOCK:**
- Modal shows blocked message
- Submission is prevented
- User can edit and try again

**If REDACT:**
- Sensitive data replaced with placeholders
- Prompt text updated in input field
- Submission proceeds with sanitized text

**If ALLOW:**
- Original prompt submitted unchanged
- No redaction performed

## 🛠 Project Structure

```
dataguard-ai/
│
├── extension/
│   ├── src/
│   │   ├── content/
│   │   │   ├── content.ts              # Main content script
│   │   │   ├── chatgptAdapter.ts       # ChatGPT DOM adapter
│   │   │   └── inputObserver.ts        # Input interception
│   │   │
│   │   ├── detector/
│   │   │   ├── detector.ts             # Main detection logic
│   │   │   ├── patterns.ts             # Regex patterns
│   │   │   └── entities.ts             # Entity utilities
│   │   │
│   │   ├── risk/
│   │   │   └── riskEngine.ts           # Risk scoring
│   │   │
│   │   ├── policy/
│   │   │   └── policyEngine.ts         # Action recommendations
│   │   │
│   │   ├── redaction/
│   │   │   └── redactor.ts             # Text redaction
│   │   │
│   │   ├── ui/
│   │   │   ├── SecurityModal.tsx       # React modal component
│   │   │   ├── ExtensionPopup.tsx      # React popup component
│   │   │   ├── popup.tsx               # Popup entry point
│   │   │   └── styles.css              # All styles
│   │   │
│   │   ├── background/
│   │   │   └── background.ts           # Service worker
│   │   │
│   │   └── types/
│   │       └── index.ts                # TypeScript definitions
│   │
│   ├── public/
│   │   └── popup.html                  # Popup HTML
│   │
│   ├── manifest.json                   # Chrome manifest V3
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── backend/
│   ├── server.py                       # Login, org policy, event log (SQLite)
│   └── dataguard.db                    # Auto-created on first run
│
├── tests/
│   ├── detector.test.ts                # Detector tests
│   ├── riskEngine.test.ts              # Risk engine tests
│   ├── redactor.test.ts                # Redactor tests
│   └── policyEngine.test.ts            # Policy tests
│
├── package.json
├── README.md                           # This file
└── .gitignore
```

## 🚦 Error Handling

The extension is designed to **fail safely**:

- ✅ ChatGPT DOM element not found → allow submission
- ✅ Detector error → allow submission
- ✅ MutationObserver error → graceful recovery
- ✅ Modal render error → allow submission
- ✅ Empty prompt → allow submission
- ✅ Unsupported page → no interference

If detection cannot be reliably performed, the extension does not silently claim the prompt was scanned.

## 📋 Manifest V3 Permissions

Minimal permissions requested:

```json
{
  "permissions": ["scripting", "storage"],
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*",
    "http://localhost:8000/*"
  ]
}
```

- `scripting` / host permissions on ChatGPT — inject the content script that intercepts prompts
- `storage` — persist the logged-in session (token, user, org, policy) via `chrome.storage.local`
- `localhost:8000` host permission — talk to the local demo backend for login/policy/events

**NOT requested** (and not needed):
- ❌ tabs
- ❌ history
- ❌ cookies
- ❌ webRequest
- ❌ management
- ❌ activeTab

## 🔮 Future Enterprise Architecture

The local demo backend already proves out multi-organization login, centralized policy, and basic event logging (see [Organizations & Policies](#-organizations--policies)). A production enterprise version would still need to add:

```
                    DataGuard AI SaaS
                           │
                     Organization
                           │
                         Admin
                           │
                  Hosted Backend (multi-tenant)
                    ┌──────┴──────┐
                    │             │
             Policy Console   Audit Dashboards
                    │             │
                    └──────┬──────┘
                           │
                 Chrome Extensions
                    /      |      \
                 User 1  User 2  User 3
```

### Potential Enterprise Features

- ✨ Real authentication (SSO, not the demo email-only login)
- ✨ RBAC — currently `role` is stored per user but not enforced by the policy engine
- ✨ Admin console for editing policies (currently seeded directly in SQLite)
- ✨ Hosted, multi-tenant backend (currently `localhost` only)
- ✨ Audit log dashboards / SIEM export (currently raw rows in SQLite)
- ✨ Support for Claude, Gemini, Copilot
- ✨ Slack / GitHub integration

**Already implemented in this POC**: local detection, risk scoring, multi-organization policies, login-gated policy sync, and event logging to a local backend.

## 🧪 Testing Checklist

```
□ npm install          # Dependencies installed
□ npm run build        # Build succeeds without errors
□ npm run test         # All tests pass
□ npm run backend      # Backend starts at localhost:8000
□ Extension loads      # chrome://extensions load unpacked works
□ Login works          # Popup login succeeds for a demo user, policy shown
□ ChatGPT intercepts   # Prompt submission paused
□ Modal displays       # Security modal appears when needed
□ Org policy applies   # FinanceCorp user gets BLOCK, TechCorp user gets REDACT
□ BLOCK works          # Request blocked, prevented submission
□ REDACT works         # Sensitive data replaced, sanitized prompt sent
□ ALLOW works          # Original prompt submitted unchanged
□ Event logged         # Backend records the event without prompt content
□ No logging           # Browser console has no raw sensitive data
```

## ⚖️ Limitations

This POC:

- Supports ChatGPT only (easily extended to other AI platforms)
- Uses rule-based detection (not ML)
- Org policies are seeded directly in SQLite — no admin UI to edit them
- `role` (admin/employee) is stored per user but not enforced — everyone in an org gets the same policy
- Login is email-only with a trivially-derived token (`userId:orgSlug`) — a demo mechanism, not real authentication
- Backend is a single local SQLite instance, not multi-tenant or hosted
- No audit dashboard — events are raw rows in `dataguard.db`
- Does not have SSO

These can be added in a future enterprise version.

## 📝 License

MIT License

## 🤝 Contributing

This is a POC demonstrating core security capabilities.

---

## Quick Start

```bash
# Clone or download
cd dataguard-ai

# Install
npm install

# Build
npm run build

# Test
npm run test

# Start the local backend (separate terminal)
npm run backend

# Load in Chrome
# 1. chrome://extensions
# 2. Load unpacked
# 3. Select extension/dist/
# 4. Click the extension icon, log in as a demo user
# 5. Open chatgpt.com
# 6. Test with demo prompts
```

---

**DataGuard AI — Protecting Enterprise Users from Accidental Data Exposure**
#   d a t a g a u r d a i  
 #   d a t a g a u r d a i  
 #   d a t a g a u r d a i  
 #   d a t a g a u r d a i  
 #   d a t a g a u r d a i  
 