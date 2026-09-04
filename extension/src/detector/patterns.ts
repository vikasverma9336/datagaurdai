// Email pattern
export const EMAIL_PATTERN = /([a-zA-Z0-9._%-]+\\?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

// Phone patterns - support Indian and international formats
export const PHONE_PATTERNS = [
  // Indian format: 10 digits
  /\b([0-9]{10})\b/g,
  // Indian format with country code: +91 9876543210
  /\+91\s?([0-9]{10})/g,
  // Indian format with country code: +91-9876543210
  /\+91[-]?([0-9]{10})/g,
  // International format with spaces: 98765-43210
  /\b([0-9]{5}[-]?[0-9]{5})\b/g,
  // International format: +1 234 567 8900
  /\+1\s?([0-9]{3})\s?([0-9]{3})\s?([0-9]{4})/g,
];

// Customer ID patterns
export const CUSTOMER_ID_PATTERNS = [
  /CUST-([A-Z0-9]+)/gi,
  /CUSTOMER-([A-Z0-9]+)/gi,
  /customer[_ \t]id[: \t=]*([A-Z0-9-]+)/gi,
  /CUSTOMER_ID[: \t=]*([A-Z0-9-]+)/gi,
];

// Secret patterns
export const SECRET_PATTERNS = [
  // AWS Access Key
  /AKIA[0-9A-Z]{16}/g,
  // GitHub token
  /ghp_[a-zA-Z0-9_]{36,255}/g,
  // OpenAI API key
  /sk-[a-zA-Z0-9]{20,}/g,
  // Bearer token
  /Bearer\s+([a-zA-Z0-9._\-=]+)/gi,
  // JWT token
  /eyJ[a-zA-Z0-9._-]+/g,
  // Generic API key patterns
  /[Aa][Pp][Ii][-_]?[Kk][Ee][Yy]\s*[=:]\s*[a-zA-Z0-9_\-\.]{20,}/g,
  // Generic secret patterns
  /[Ss][Ee][Cc][Rr][Ee][Tt]\s*[=:]\s*[a-zA-Z0-9_\-\.]{20,}/g,
  /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]\s*[=:]\s*[a-zA-Z0-9_\-\.]{8,}/g,
  /[Aa][Cc][Cc][Ee][Ss][Ss][-_]?[Tt][Oo][Kk][Ee][Nn]\s*[=:]\s*[a-zA-Z0-9_\-\.]{20,}/g,
  // Private key patterns
  /-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP)\s+PRIVATE\s+KEY/g,
];

// Credit card patterns
export const CREDIT_CARD_PATTERNS = [
  // Visa, Mastercard, Amex, Discover (with spaces or dashes)
  /\b([0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4})\b/g,
  // 16 digit number without spaces
  /\b([0-9]{16})\b/g,
];

// Person name patterns - contextual heuristic
export const PERSON_PATTERNS = [
  /(?:Customer|Name|Employee|Person|User)[ \t]*[:=]?[ \t]*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g,
  /(?:customer[ \t]+name|employee[ \t]+name)[ \t]*[:=]?[ \t]*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/gi,
  /From[ \t]*[:=]?[ \t]*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g,
  /To[ \t]*[:=]?[ \t]*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g,
];
