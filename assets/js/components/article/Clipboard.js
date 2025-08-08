/**
 * Article Clipboard Component
 * Handles code copying functionality with modern and fallback implementations
 * Migrated from article-clipboard.js with improvements
 */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { CopyManager, $$ } from '../../utils/index.js';

export class ArticleClipboard extends Component {
  constructor(config = {}) {
    super({
      name: 'article-clipboard',
      selector: config.selector || '.copy-btn, .copy-code',
      ...config
    });
    
    this.buttons = new Map();
    this.options = {
      successDuration: 2000,
      errorDuration: 3000,
      successMessage: '✅ Copied!',
      errorMessage: '❌ Failed',
      ...this.options
    };
  }

  /**
   * Setup elements and find all copy buttons
   */
  setupElements() {
    super.setupElements();
    
    // Find all copy buttons on the page
    this.copyButtons = [...$$('.copy-btn'), ...$$('.copy-code')];
    if (this.copyButtons.length === 0) return;
    
    // Setup each button
    this.copyButtons.forEach(button => this.setupButton(button));
  }

  /**
   * Setup individual copy button
   */
  setupButton(button) {
    // Store original content for reset
    const originalContent = button.innerHTML;
    this.buttons.set(button, { originalContent });
    
    // Add data attribute for tracking
    button.setAttribute('data-clipboard-component', this.id);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Use event delegation for better performance
    this.addEventListener(document, 'click', (e) => {
      const button = e.target.closest('.copy-btn, .copy-code');
      if (button && this.buttons.has(button)) {
        e.preventDefault();
        this.handleCopyClick(button);
      }

      const askButton = e.target.closest('.ask-ai');
      if (askButton) {
        e.preventDefault();
        this.handleAskAIClick(askButton);
      }
    });
  }

  /**
   * Handle copy button click using unified CopyManager
   */
  async handleCopyClick(button) {
    const result = await CopyManager.copyCode(button, {
      successMessage: this.options.successMessage,
      errorMessage: this.options.errorMessage,
      feedbackDuration: this.options.successDuration,
      analytics: {
        component: 'article-clipboard',
        buttonId: button.id || 'unknown'
      },
      onSuccess: (text) => {
        this.trackCopyEvent(button, text.length);
        this.emit('copy-success', { button, text });
      },
      onError: (error) => {
        this.emit('copy-error', { button, error });
      }
    });

    return result;
  }



  /**
   * Track copy events for analytics (component-specific tracking)
   */
  trackCopyEvent(button, textLength) {
    this.emit('copy-tracked', {
      component: 'article-clipboard',
      textLength,
      timestamp: new Date().toISOString(),
      buttonCount: this.buttons.size
    });
  }

  /**
   * Add new copy button dynamically
   */
  addButton(button) {
    if (this.buttons.has(button)) return;
    this.setupButton(button);
  }

  /**
   * Remove copy button
   */
  removeButton(button) {
    if (!this.buttons.has(button)) return;
    button.removeAttribute('data-clipboard-component');
    this.buttons.delete(button);
  }

  /**
   * Get copy statistics
   */
  getStats() {
    return {
      buttonCount: this.buttons.size,
      componentId: this.id
    };
  }

  /**
   * Custom cleanup
   */
  onDestroy() {
    // Clean up button references
    this.buttons.forEach((data, button) => {
      button.removeAttribute('data-clipboard-component');
    });
    this.buttons.clear();
  }

  /**
   * Handle Ask AI button: copy code then send to chat
   */
  async handleAskAIClick(button) {
    try {
      const prompt = button.getAttribute('data-ai-prompt') || 'Explain this code snippet';

      const result = await CopyManager.copyCode(button, {
        button,
        successMessage: 'Sent to chat',
        announceMessage: 'Sent to chat',
        analytics: { component: 'article-clipboard', action: 'ask-ai' },
        onSuccess: async (codeText) => {
          const question = `${prompt}\n\n${codeText}`;
          let chat = ComponentManager.getInstances('article-chat')[0];
          if (!chat) {
            chat = await ComponentManager.load('article-chat');
          }
          if (chat) {
            chat.show();
            chat.focus();
            await chat.handleQuestionSubmit(question);
          }
        }
      });

      return result;
    } catch (error) {
      this.emit('ask-ai-error', { button, error });
      return { success: false, error };
    }
  }
}

// Auto-register component
ComponentManager.register('article-clipboard', ArticleClipboard);