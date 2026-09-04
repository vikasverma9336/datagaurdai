import { AIWebsiteAdapter } from "../types/index";

export class ChatGPTAdapter implements AIWebsiteAdapter {
  // Selectors for ChatGPT input and submit button
  private readonly INPUT_SELECTORS = [
    "#prompt-textarea",
    "[data-testid='prompt-textarea']",
    ".ProseMirror[contenteditable='true']",
    "textarea[data-id]", // Main input textarea
    "textarea[placeholder*='Message']",
    "textarea[placeholder*='message']",
    "div[role='textbox']",
    "[contenteditable='true'][data-id]",
    "[contenteditable='true'][role='textbox']",
  ];

  private readonly SUBMIT_SELECTORS = [
    "[data-testid='send-button']",
    "button[data-testid='send-button']",
    "button[aria-label='Send prompt']",
    "button[aria-label*='Send']",
    "button[aria-label*='send']",
    "button[type='submit']",
    "button[aria-label='Send message']",
    "button.mb-1[type='button']:not([aria-label*='Attach'])",
  ];

  matches(): boolean {
    // Check if current URL is ChatGPT
    const url = window.location.href;
    return url.includes("chatgpt.com") || url.includes("chat.openai.com");
  }

  getPromptInput(): HTMLElement | null {
    // Try each selector in order
    for (const selector of this.INPUT_SELECTORS) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && this.isVisible(element)) {
        return element;
      }
    }
    return null;
  }

  getSubmitButton(): HTMLElement | null {
    // Try each selector in order
    for (const selector of this.SUBMIT_SELECTORS) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && this.isVisible(element)) {
        return element;
      }
    }
    return null;
  }

  getPromptText(): string {
    const input = this.getPromptInput();
    if (!input) return "";

    // Handle textarea
    if (input instanceof HTMLTextAreaElement) {
      return input.value;
    }

    // Handle contenteditable div
    if (input.contentEditable === "true") {
      return input.innerText || input.textContent || "";
    }

    // Fallback
    return input.innerText || input.textContent || "";
  }

  replacePrompt(text: string): void {
    const input = this.getPromptInput();
    if (!input) return;

    // Handle textarea
    if (input instanceof HTMLTextAreaElement) {
      input.value = text;
      // Trigger input event for React
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // Handle contenteditable div
    if (input.contentEditable === "true") {
      input.textContent = text;
      // Trigger input events
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
  }

  submitPrompt(): void {
    const button = this.getSubmitButton();
    if (button) {
      button.click();
    }
  }

  private isVisible(element: HTMLElement): boolean {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  // Additional helper method to clear input
  clearPrompt(): void {
    const input = this.getPromptInput();
    if (!input) return;

    if (input instanceof HTMLTextAreaElement) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (input.contentEditable === "true") {
      input.innerText = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

export default new ChatGPTAdapter();
