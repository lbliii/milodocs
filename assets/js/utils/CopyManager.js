/**
 * CopyManager - Unified copy functionality for all components
 * Consolidates copy patterns, visual feedback, and error handling
 */

import { copyToClipboard } from './dom.js';
import { announceToScreenReader } from './accessibility.js';

/**
 * @typedef {Object} CopyOptions
 * @property {HTMLElement} [button] - Button element for visual feedback
 * @property {string} [successMessage] - Success feedback text
 * @property {string} [errorMessage] - Error feedback text
 * @property {number} [feedbackDuration] - Duration for visual feedback (ms)
 * @property {boolean} [announce] - Whether to announce to screen readers
 * @property {string} [announceMessage] - Custom screen reader message
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 * @property {Function} [preprocessText] - Text preprocessing function
 * @property {Object} [analytics] - Analytics data to track
 */

/**
 * @typedef {Object} CopyResult
 * @property {boolean} success - Whether copy was successful
 * @property {string} text - The text that was copied
 * @property {Error} [error] - Error if copy failed
 */

export class CopyManager {
  static defaultOptions = {
    successMessage: '✅ Copied!',
    errorMessage: '❌ Failed',
    feedbackDuration: 2000,
    announce: true,
    announceMessage: 'Copied to clipboard'
  };

  /**
   * Copy text with unified feedback and error handling
   * @param {string|HTMLElement} source - Text or element to copy from
   * @param {CopyOptions} options - Copy configuration
   * @returns {Promise<CopyResult>}
   */
  static async copy(source, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      // Extract text from source
      const text = await this.extractText(source, config);
      
      if (!text) {
        throw new Error('No text found to copy');
      }

      // Perform the copy operation
      const success = await copyToClipboard(text);
      
      if (!success) {
        throw new Error('Copy operation failed');
      }

      // Handle success feedback
      await this.handleSuccess(text, config);
      
      return {
        success: true,
        text
      };

    } catch (error) {
      // Handle error feedback
      await this.handleError(error, config);
      
      return {
        success: false,
        text: '',
        error
      };
    }
  }

  /**
   * Extract text content from various source types
   * @param {string|HTMLElement} source - Source to extract from
   * @param {CopyOptions} options - Configuration options
   * @returns {Promise<string>}
   */
  static async extractText(source, options) {
    // If source is already a string
    if (typeof source === 'string') {
      return options.preprocessText ? options.preprocessText(source) : source;
    }

    // If source is an element
    if (source instanceof HTMLElement) {
      return this.extractFromElement(source, options);
    }

    // Try to find element by selector
    if (typeof source === 'string' && source.startsWith('.') || source.startsWith('#')) {
      const element = document.querySelector(source);
      if (element) {
        return this.extractFromElement(element, options);
      }
    }

    throw new Error('Invalid copy source');
  }

  /**
   * Extract text from HTML elements with smart detection
   * @param {HTMLElement} element - Element to extract from
   * @param {CopyOptions} options - Configuration options
   * @returns {string}
   */
  static extractFromElement(element, options) {
    let text = '';

    // Strategy 1: Check for data-copy-text attribute
    if (element.hasAttribute('data-copy-text')) {
      text = element.getAttribute('data-copy-text');
    }
    // Strategy 2: Check for data-copy-target attribute
    else if (element.hasAttribute('data-copy-target')) {
      const targetSelector = element.getAttribute('data-copy-target');
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        text = this.getElementText(targetElement);
      }
    }
    // Strategy 3: Extract from element itself or find code block
    else {
      text = this.getElementText(element) || this.findCodeBlock(element);
    }

    // Clean and preprocess text
    text = this.cleanText(text);
    
    return options.preprocessText ? options.preprocessText(text) : text;
  }

  /**
   * Get clean text content from element
   * @param {HTMLElement} element - Element to get text from
   * @returns {string}
   */
  static getElementText(element) {
    if (!element) return '';
    
    // For code elements, preserve formatting
    if (element.tagName === 'CODE' || element.tagName === 'PRE') {
      return element.textContent || element.innerText || '';
    }
    
    // For other elements, get clean text
    return element.textContent || element.innerText || '';
  }

  /**
   * Find associated code block for copy buttons
   * @param {HTMLElement} button - Button element
   * @returns {string}
   */
  static findCodeBlock(button) {
    // Strategy 1: Look in parent container
    let codeElement = button.parentElement?.querySelector('code');
    if (codeElement) {
      return this.getElementText(codeElement);
    }

    // Strategy 2: Check previous siblings
    let sibling = button.previousElementSibling;
    while (sibling) {
      codeElement = sibling.querySelector('code') || (sibling.tagName === 'CODE' ? sibling : null);
      if (codeElement) {
        return this.getElementText(codeElement);
      }
      sibling = sibling.previousElementSibling;
    }

    // Strategy 3: Look in closest pre element
    const preElement = button.closest('pre') || button.parentElement?.querySelector('pre');
    if (preElement) {
      codeElement = preElement.querySelector('code');
      if (codeElement) {
        return this.getElementText(codeElement);
      }
    }

    return '';
  }

  /**
   * Clean text content (remove line numbers, prompts, etc.)
   * @param {string} text - Raw text
   * @returns {string}
   */
  static cleanText(text) {
    if (!text) return '';

    return text
      .replace(/^\d+\s+/gm, '')  // Remove line numbers
      .replace(/^\$\s+/gm, '')   // Remove shell prompts
      .replace(/^>\s+/gm, '')    // Remove quote markers
      .replace(/^#\s+/gm, '')    // Remove comment markers
      .trim();
  }

  /**
   * Handle successful copy with visual and audio feedback
   * @param {string} text - The copied text
   * @param {CopyOptions} options - Configuration options
   */
  static async handleSuccess(text, options) {
    // Visual feedback on button
    if (options.button) {
      await this.showButtonSuccess(options.button, options);
    }

    // Screen reader announcement
    if (options.announce) {
      const message = options.announceMessage || `${this.defaultOptions.announceMessage}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`;
      announceToScreenReader(message);
    }

    // Show notification if available
    if (window.toast) {
      window.toast(options.successMessage, 'success', options.feedbackDuration);
    }

    // Analytics tracking
    if (options.analytics) {
      this.trackCopyEvent('success', text, options.analytics);
    }

    // Success callback
    if (options.onSuccess) {
      options.onSuccess(text);
    }
  }

  /**
   * Handle copy error with appropriate feedback
   * @param {Error} error - The error that occurred
   * @param {CopyOptions} options - Configuration options
   */
  static async handleError(error, options) {
    console.error('Copy failed:', error);

    // Visual feedback on button
    if (options.button) {
      await this.showButtonError(options.button, options);
    }

    // Screen reader announcement
    if (options.announce) {
      announceToScreenReader('Failed to copy to clipboard');
    }

    // Show error notification if available
    if (window.toast) {
      window.toast(options.errorMessage, 'error', options.feedbackDuration);
    }

    // Analytics tracking
    if (options.analytics) {
      this.trackCopyEvent('error', '', { ...options.analytics, error: error.message });
    }

    // Error callback
    if (options.onError) {
      options.onError(error);
    }
  }

  /**
   * Show success feedback on button
   * @param {HTMLElement} button - Button element
   * @param {CopyOptions} options - Configuration options
   */
  static async showButtonSuccess(button, options) {
    const originalContent = button.innerHTML;
    const originalClasses = button.className;

    // Update button appearance
    button.innerHTML = options.successMessage;
    button.classList.add('copy-button--success', 'bg-green-600');
    button.classList.remove('copy-button--error', 'bg-red-600', 'bg-zinc-600');

    // Reset after duration
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.className = originalClasses;
    }, options.feedbackDuration);
  }

  /**
   * Show error feedback on button
   * @param {HTMLElement} button - Button element
   * @param {CopyOptions} options - Configuration options
   */
  static async showButtonError(button, options) {
    const originalContent = button.innerHTML;
    const originalClasses = button.className;

    // Update button appearance
    button.innerHTML = options.errorMessage;
    button.classList.add('copy-button--error', 'bg-red-600');
    button.classList.remove('copy-button--success', 'bg-green-600', 'bg-zinc-600');

    // Reset after duration
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.className = originalClasses;
    }, options.feedbackDuration);
  }

  /**
   * Track copy events for analytics
   * @param {string} status - 'success' or 'error'
   * @param {string} text - Copied text
   * @param {Object} analytics - Analytics data
   */
  static trackCopyEvent(status, text, analytics) {
    const event = {
      type: 'copy',
      status,
      textLength: text.length,
      timestamp: new Date().toISOString(),
      ...analytics
    };

    // Emit for component tracking
    if (window.eventBus) {
      window.eventBus.emit('copy:tracked', event);
    }

    // Console logging for debug
    if (window.MiloDebug) {
      console.log(`📋 Copy ${status}:`, event);
    }
  }

  /**
   * Copy from code blocks with enhanced detection
   * @param {HTMLElement} button - Copy button
   * @param {CopyOptions} options - Configuration options
   * @returns {Promise<CopyResult>}
   */
  static async copyCode(button, options = {}) {
    const codeOptions = {
      ...options,
      preprocessText: (text) => this.cleanCodeText(text),
      analytics: {
        type: 'code',
        language: this.detectLanguage(button),
        ...options.analytics
      }
    };

    return this.copy(button, codeOptions);
  }

  /**
   * Enhanced code text cleaning
   * @param {string} text - Raw code text
   * @returns {string}
   */
  static cleanCodeText(text) {
    return this.cleanText(text)
      .replace(/^\/\/.*$/gm, '')     // Remove comment lines (optional)
      .replace(/^\s*[\r\n]/gm, '')   // Remove empty lines
      .trim();
  }

  /**
   * Detect programming language from context
   * @param {HTMLElement} element - Element context
   * @returns {string}
   */
  static detectLanguage(element) {
    // Look for language class in code block
    const codeBlock = element.closest('pre')?.querySelector('code') || 
                     element.parentElement?.querySelector('code');
    
    if (codeBlock) {
      const className = codeBlock.className;
      const langMatch = className.match(/language-(\w+)/);
      if (langMatch) {
        return langMatch[1];
      }
    }

    return 'unknown';
  }

  /**
   * Bulk copy setup for multiple elements
   * @param {string} selector - CSS selector for copy buttons
   * @param {CopyOptions} options - Default options for all buttons
   */
  static setupCopyButtons(selector = '[data-copy], .copy-btn, .copy-code', options = {}) {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
      // Skip if already setup
      if (button.hasAttribute('data-copy-manager')) {
        return;
      }

      button.setAttribute('data-copy-manager', 'true');
      
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const buttonOptions = {
          ...options,
          button,
          // Extract button-specific options from data attributes
          successMessage: button.getAttribute('data-success-message') || options.successMessage,
          errorMessage: button.getAttribute('data-error-message') || options.errorMessage,
          announceMessage: button.getAttribute('data-announce-message') || options.announceMessage
        };

        await this.copyCode(button, buttonOptions);
      });
    });

    console.log(`📋 CopyManager: Setup ${buttons.length} copy buttons`);
    return buttons.length;
  }
}


export const copyText = (text, options) => CopyManager.copy(text, options);
export const copyFromElement = (element, options) => CopyManager.copy(element, options);
export const setupCopyButtons = (selector, options) => CopyManager.setupCopyButtons(selector, options);