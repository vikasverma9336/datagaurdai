// Debug console logger with timestamps and prefixes
export const logger = {
  debug: (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [DataGuard DEBUG] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.info(`[${timestamp}] [DataGuard INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`[${timestamp}] [DataGuard WARN] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] [DataGuard ERROR] ${message}`, error || '');
  },
};

export const domDebugger = {
  checkInputField: () => {
    const selectors = [
      '[data-testid="chat-input-textarea"]',
      'textarea[placeholder*="Say something"]',
      '.ProseMirror',
      'textarea',
      '[contenteditable="true"]',
      '[role="textbox"]',
    ];

    logger.debug('Checking for input field with selectors:', selectors);

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        logger.info(`✓ Found input field with selector: ${selector}`, element);
        return element;
      }
    }

    logger.warn('⚠ No input field found with any selector');
    return null;
  },

  checkSubmitButton: () => {
    const selectors = [
      '[data-testid="send-button"]',
      'button[aria-label*="Send"]',
      'button svg[viewBox*="paper"]',
      'button[type="submit"]',
      'button:has(svg)',
    ];

    logger.debug('Checking for submit button with selectors:', selectors);

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        logger.info(`✓ Found submit button with selector: ${selector}`, element);
        return element;
      }
    }

    logger.warn('⚠ No submit button found with any selector');
    return null;
  },

  logPageState: function() {
    logger.debug('=== ChatGPT Page State ===');
    logger.debug('URL:', window.location.href);
    logger.debug('Document Ready State:', document.readyState);
    logger.debug('Body HTML Length:', document.body?.innerHTML?.length || 0);

    // Check for chat container
    const chatContainer = document.querySelector('[role="presentation"]') ||
                         document.querySelector('.react-scroll-to-bottom') ||
                         document.querySelector('[class*="chat"]');
    logger.debug('Chat Container Found:', !!chatContainer);

    // Check for conversation input
    const inputField = domDebugger.checkInputField();
    logger.debug('Input Field:', inputField ? 'Found' : 'Not Found');

    // Check for submit button
    const submitButton = domDebugger.checkSubmitButton();
    logger.debug('Submit Button:', submitButton ? 'Found' : 'Not Found');

    logger.debug('=== End Page State ===');
  },
};

export const extensionDebugger = {
  init: () => {
    // Make debuggers available in console
    const dgDebug = {
      log: logger,
      dom: domDebugger,
      checkStatus: () => {
        logger.info('Extension Status Check');
        if (domDebugger && domDebugger.logPageState) {
          domDebugger.logPageState();
        }
      },
    };

    try {
      (window as any).dgDebug = dgDebug;
      logger.info('DataGuard AI Debug utilities available in window.dgDebug');
      logger.info('Usage: window.dgDebug.checkStatus() to diagnose issues');
    } catch (e) {
      logger.error('Failed to initialize debugger', e);
    }
  },
};
