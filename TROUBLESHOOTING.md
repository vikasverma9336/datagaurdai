# 🔧 DataGuard AI - Troubleshooting Guide

## Extension Not Working? Follow This Guide

### Quick Diagnosis (2 minutes)

1. **Open ChatGPT.com** in a fresh tab
2. **Open Developer Console** (F12 or Ctrl+Shift+I)
3. **Go to Console tab**
4. **Paste and run:**
   ```javascript
   window.dgDebug.checkStatus()
   ```

This will show you:
- ✓ Input field location
- ✓ Submit button location
- ✓ Page state
- ✓ What the extension can access

---

## Common Issues & Solutions

### Issue 1: "Extension installed but no warning appears"

**Cause:** Content script might not have loaded.

**Solution:**
```
1. Reload ChatGPT page (Ctrl+R or Cmd+R)
2. Wait 1-2 seconds for extension to initialize
3. Open Console and check:
   console.log(window.dgDebug) // Should show the debug object
```

**What to look for in Console:**
```
[14:30:45] [DataGuard INFO] ✓ DataGuard AI is actively monitoring ChatGPT prompts
```

---

### Issue 2: "Text input field not found"

**Cause:** ChatGPT DOM selectors might have changed.

**Solution:**
1. Run in Console:
   ```javascript
   window.dgDebug.dom.checkInputField()
   ```

2. Check the output for which selector was found
3. Try typing in the textbox - does it appear?

**If no input field is found:**
- ChatGPT might have updated their HTML
- Try a full page reload
- Check if you're on chatgpt.com (not chat.openai.com or another URL)

---

### Issue 3: "Submit button not detected"

**Cause:** Button selectors might not match the current ChatGPT version.

**Solution:**
1. Run in Console:
   ```javascript
   window.dgDebug.dom.checkSubmitButton()
   ```

2. Look for a paper airplane icon button (usually bottom-right of input)
3. The button's selector should be shown in logs

**If button not found:**
- Try clicking the "Send" button manually
- Some ChatGPT versions have different DOM structures
- Full page refresh usually fixes this

---

### Issue 4: "Sensitive data not detected"

**Cause:** Pattern might not match your data format.

**Solution:**
Test detection directly in Console:

```javascript
// Test email detection
const testEmail = "test@example.com";
const result = detector.detect(testEmail);
console.log(result);

// Test phone detection (Indian format)
const testPhone = "9876543210";
const result2 = detector.detect(testPhone);
console.log(result2);
```

**Expected output:**
```javascript
[
  {
    type: "EMAIL",
    start: 0,
    end: 16,
    confidence: 0.99,
    risk: 20
  }
]
```

---

### Issue 5: "Modal appears but doesn't block/redact"

**Cause:** Action handlers might not be working.

**Solution:**
1. When modal appears, check Console for errors
2. Look for messages like:
   ```
   [DataGuard DEBUG] Security check complete
   ```

3. Click a button and check Console for:
   ```
   [DataGuard INFO] Sensitive data detected - showing modal
   ```

---

## Advanced Debugging

### Enable Full Logging

In Console, all logs are shown with timestamps:
```
[14:30:45] [DataGuard DEBUG] Submit attempt detected
[14:30:45] [DataGuard INFO] ✓ Found input field with selector: [data-testid="chat-input-textarea"]
```

**Log Levels:**
- `[DEBUG]` - Detailed information (selectors, DOM checks)
- `[INFO]` - Important events (submit, detection)
- `[WARN]` - Warnings (data not found, issues)
- `[ERROR]` - Errors (exceptions, failures)

### Manual Detection Testing

```javascript
// Get detector instance
const testText = `
  Customer: Rahul Sharma
  Email: rahul@gmail.com
  Phone: 9876543210
  Customer ID: CUST-92831
`;

const detections = detector.detect(testText);
const risk = riskEngine.calculateRisk(detections, "chatgpt.com");
const action = policyEngine.getRecommendedAction(detections, risk, "chatgpt.com");

console.log("Detections:", detections);
console.log("Risk:", risk);
console.log("Recommended Action:", action);
```

---

## Verification Checklist

- [ ] Extension appears in chrome://extensions
- [ ] "DataGuard AI" shows in extension list
- [ ] Extension shows enabled (toggle is ON)
- [ ] Navigate to chatgpt.com
- [ ] Console shows: "[DataGuard INFO] ✓ DataGuard AI is actively monitoring..."
- [ ] window.dgDebug exists (type in Console)
- [ ] Type sensitive text and press Enter to trigger detection

---

## Getting the Extension to Work

### Step 1: Load Extension Properly
```
1. Go to chrome://extensions
2. Enable "Developer Mode" (top-right toggle)
3. Click "Load unpacked"
4. Select: d:\datagaurd ai\extension\dist
5. DataGuard AI should appear in the list
```

### Step 2: Verify It Loads
```
1. Go to chatgpt.com
2. Press F12 to open Console
3. You should see:
   [14:30:45] [DataGuard INFO] ✓ DataGuard AI is actively monitoring...
```

### Step 3: Test with Sample Prompt
```
Paste this into ChatGPT input:

Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

Write a professional response.

Press Enter or click Send button
```

### Step 4: Security Modal Should Appear
- ⚠️ Shield icon with warning
- 95/100 CRITICAL risk badge
- 4 detected entities
- Three action buttons

---

## Still Not Working?

### Check These Things

1. **Browser Compatibility**
   - Chrome 90+ (Manifest V3 support required)
   - Not supported: Firefox, Safari, Edge (without modifications)

2. **URL is Correct**
   - https://chatgpt.com ✓
   - https://chat.openai.com ✓
   - Other URLs ✗

3. **Extension Has Permissions**
   - Go to chrome://extensions/details/[extension-id]
   - Check "Site access" - should have ChatGPT URLs

4. **Clear Cache & Reload**
   - Close ChatGPT tab completely
   - Chrome menu → More Tools → Clear Browsing Data
   - Open ChatGPT again
   - Reload extension

5. **Check for Console Errors**
   - F12 → Console
   - Look for red error messages
   - Red X buttons (exceptions)
   - Share these errors when reporting issues

---

## Debug Information to Collect

When reporting issues, include:

```javascript
// Run in Console and share output:
{
  extension_status: window.dgDebug ? "LOADED" : "NOT_LOADED",
  page_url: window.location.href,
  input_found: !!window.dgDebug?.dom.checkInputField(),
  button_found: !!window.dgDebug?.dom.checkSubmitButton(),
  detector_works: !!detector,
  risk_engine_works: !!riskEngine,
}
```

---

## Performance Tips

- **Extension adds < 5ms latency** to prompt submission
- **All processing is local** (no network calls)
- **Modal appears instantly** (< 100ms)
- **Test only runs on submit** (not on every keystroke)

---

## Still Need Help?

1. Check [START_HERE.md](./START_HERE.md) for quick start
2. Review [README.md](./README.md) for architecture details
3. Look at test cases in `tests/` folder for examples
4. Console shows detailed logs of what's happening

The debug utilities available in `window.dgDebug` should help identify any issues!
