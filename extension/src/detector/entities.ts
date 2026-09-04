import { Detection, EntityType } from "../types/index";

// Luhn algorithm for credit card validation
export function validateCreditCardLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Risk scores for each entity type
export const ENTITY_RISK_SCORES: Record<EntityType, number> = {
  PERSON: 10,
  EMAIL: 20,
  PHONE: 20,
  CUSTOMER_ID: 25,
  CREDIT_CARD: 40,
  SECRET: 50,
};

// Confidence scores for each entity type
export const ENTITY_CONFIDENCE: Record<EntityType, number> = {
  PERSON: 0.75,
  EMAIL: 0.99,
  PHONE: 0.85,
  CUSTOMER_ID: 0.90,
  CREDIT_CARD: 0.95,
  SECRET: 0.98,
};

export function createDetection(
  type: EntityType,
  start: number,
  end: number
): Detection {
  return {
    type,
    start,
    end,
    confidence: ENTITY_CONFIDENCE[type],
    risk: ENTITY_RISK_SCORES[type],
  };
}

// Check if a phone number is likely a valid phone (not just any number)
export function isValidPhoneNumber(phoneStr: string): boolean {
  const digitsOnly = phoneStr.replace(/\D/g, "");
  
  // Must be at least 10 digits (to avoid matching short numbers like years)
  if (digitsOnly.length < 10) return false;
  
  // Avoid matching very short sequences
  if (digitsOnly.length > 15) return false;
  
  // Avoid sequences that are all the same digit
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  return true;
}

// Check if text looks like a name (basic heuristic)
export function couldBeName(text: string): boolean {
  const words = text.trim().split(/\s+/);
  
  // Must have at least 2 words
  if (words.length < 2) return false;
  
  // Each word should start with capital letter
  for (const word of words) {
    if (!/^[A-Z]/.test(word)) return false;
  }
  
  // Words should be reasonable length (not just initials or too long)
  for (const word of words) {
    if (word.length < 2 || word.length > 20) return false;
  }
  
  return true;
}
