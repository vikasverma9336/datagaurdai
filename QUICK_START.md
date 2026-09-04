# DataGuard AI — Quick Start Guide

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd dataguard-ai
npm install
```

### Step 2: Build the Extension

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Generate `extension/dist/` with all extension files

### Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/dist` directory
5. The extension should now appear in your browser

### Step 4: Test the Extension

1. Go to [ChatGPT](https://chatgpt.com) or [OpenAI Chat](https://chat.openai.com)
2. Try the demo prompts below

## 🧪 Testing

### Run All Tests

```bash
npm run test -- --run
```

Expected output:
```
✓ tests/detector.test.ts (28 tests)
✓ tests/riskEngine.test.ts (14 tests)
✓ tests/policyEngine.test.ts (19 tests)
✓ tests/redactor.test.ts (14 tests)

Test Files  4 passed (4)
Tests  75 passed (75)
```

## 📝 Demo Scenarios

### Scenario 1: Normal Prompt (No Warning)

```
Prompt: Explain the difference between RAG and fine-tuning.
Expected: No warning, prompt submitted normally
```

### Scenario 2: Customer PII (Shows Modal)

```
Prompt:
Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

The customer wants a refund. Write a professional response.

Expected:
- Security modal appears
- Risk Level: CRITICAL (85/100)
- Detected: PERSON, EMAIL, PHONE, CUSTOMER_ID
- Options: BLOCK | REDACT & CONTINUE | ALLOW
```

### Scenario 3: Secret (Shows BLOCK Recommendation)

```
Prompt:
My AWS access key is AKIAIOSFODNN7EXAMPLE. 
Help me debug this configuration.

Expected:
- Security modal appears
- Risk Level: CRITICAL (70/100)
- Detection: SECRET
- Recommended: BLOCK
- Click BLOCK → Request is blocked
```

### Scenario 4: REDACT Example

Same prompt as Scenario 2, but:
1. Click **REDACT & CONTINUE**
2. Prompt is sanitized:
   ```
   Customer: [NAME]
   Email: [EMAIL]
   Phone: [PHONE]
   Customer ID: [CUSTOMER_ID]

   The customer wants a refund. Write a professional response.
   ```
3. Sanitized prompt is sent to ChatGPT

## 📂 Project Structure

```
dataguard-ai/
├── extension/
│   ├── src/
│   │   ├── content/          # Content script & ChatGPT integration
│   │   ├── detector/         # Sensitive data detection
│   │   ├── risk/             # Risk scoring engine
│   │   ├── policy/           # Policy evaluation
│   │   ├── redaction/        # Data redaction
│   │   ├── ui/               # React components
│   │   ├── background/       # Service worker
│   │   └── types/            # TypeScript definitions
│   ├── public/               # Static assets
│   ├── tests/                # Unit tests (Vitest)
│   ├── manifest.json         # Chrome Manifest V3
│   ├── vite.config.ts        # Vite build config
│   └── package.json
├── tests/                    # Additional tests
├── README.md                 # Full documentation
└── package.json
```

## 🔧 Development

### Watch Mode (Auto-rebuild)

```bash
cd extension
npm run dev
```

### Build Production

```bash
npm run build
```

### Run Tests in Watch Mode

```bash
npm run test
```

## 🐛 Troubleshooting

### Extension doesn't load in Chrome

- Check `chrome://extensions/`
- Verify Developer Mode is enabled
- Ensure you selected `extension/dist` directory
- Check browser console for errors (right-click → Inspect)

### ChatGPT integration not working

- Refresh ChatGPT page after loading extension
- Check extension popup (should show "Active ✓")
- Open browser console (F12) and look for "[DataGuard AI]" logs

### Tests failing

- Run `npm run test -- --run` for full output
- Check test file paths
- Ensure TypeScript is configured correctly

## 📋 Build Artifacts

After `npm run build`, the `extension/dist/` directory contains:

```
dist/
├── manifest.json          # Extension manifest
├── popup.html             # Popup UI
├── popup.js               # Popup script (React)
├── content.js             # Content script
├── background.js          # Background service worker
├── style.css              # Styles
├── client.js              # Vite client code
└── icons/                 # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## ✅ Verification Checklist

- [ ] `npm install` completed
- [ ] `npm run build` succeeded
- [ ] All 75 tests pass
- [ ] Extension loads in Chrome (`chrome://extensions`)
- [ ] Extension shows as active
- [ ] ChatGPT page opens without errors
- [ ] Demo scenarios work as expected

## 📖 Documentation

For complete documentation including:
- Architecture details
- Detection rules
- Risk scoring
- Privacy guarantees
- Future roadmap

See [README.md](./README.md)

---

**Ready to protect enterprise users from data exposure!**
