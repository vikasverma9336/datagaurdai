import { AIWebsiteAdapter } from "../types/index";

export type InputObserverCallback = () => void;

export class InputObserver {
  private adapter: AIWebsiteAdapter;
  private lastPromptText = "";
  private isProcessing = false;
  private allowNextSubmit = false;
  private mutationObserver: MutationObserver | null = null;
  private submitCallback: InputObserverCallback | null = null;
  private boundClickHandler = this.handleClickEvent.bind(this);
  private boundKeyHandler = this.handleKeyEvent.bind(this);

  constructor(adapter: AIWebsiteAdapter) {
    this.adapter = adapter;
  }

  start(onSubmitAttempt: InputObserverCallback): void {
    this.submitCallback = onSubmitAttempt;

    // Watch for submit button clicks
    document.addEventListener("click", this.boundClickHandler, true);

    // Watch for Enter key presses in input
    document.addEventListener("keydown", this.boundKeyHandler, true);

    // Watch for mutations (DOM changes)
    this.setupMutationObserver();
  }

  stop(): void {
    document.removeEventListener("click", this.boundClickHandler, true);
    document.removeEventListener("keydown", this.boundKeyHandler, true);
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(() => {
      // Reconnect listeners if DOM changes
      // This is primarily for React re-renders
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }

  private handleClickEvent(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if this is the submit button
    const submitButton = this.adapter.getSubmitButton();
    if (submitButton && (target === submitButton || submitButton.contains(target))) {
      if (this.allowNextSubmit) {
        this.allowNextSubmit = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (!this.isProcessing) {
        this.isProcessing = true;
        this.submitCallback?.();
      }
    }
  }

  private handleKeyEvent(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey) return;

    const input = this.adapter.getPromptInput();
    if (!input || input !== document.activeElement) return;

    if (this.allowNextSubmit) {
      this.allowNextSubmit = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!this.isProcessing) {
      this.isProcessing = true;
      this.submitCallback?.();
    }
  }

  allowNextNativeSubmit(): void {
    this.allowNextSubmit = true;
  }

  submitAllowed(): void {
    this.allowNextNativeSubmit();
    const submitButton = this.adapter.getSubmitButton();
    if (submitButton) {
      submitButton.click();
    } else {
      const input = this.adapter.getPromptInput();
      if (input) {
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
          })
        );
      }
    }
  }

  getPromptText(): string {
    return this.adapter.getPromptText();
  }

  setPromptText(text: string): void {
    this.adapter.replacePrompt(text);
  }

  clearPrompt(): void {
    this.lastPromptText = "";
  }

  pauseSubmit(): void {
    this.isProcessing = true;
  }

  resumeSubmit(): void {
    this.isProcessing = false;
  }

  allowSubmit(): void {
    this.resumeSubmit();
  }
}
