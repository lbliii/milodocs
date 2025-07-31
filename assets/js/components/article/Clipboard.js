/**
 * Article Clipboard Component
 * Handles code copying functionality with modern and fallback implementations
 * Migrated from article-clipboard.js with improvements
 */

import { Component } from '../../core/ComponentManager.js';
import { copyToClipboard, $$ } from '../../utils/index.js';

export class ArticleClipboard extends Component {
  constructor(config = {}) {
    super({
      name: 'article-clipboard',
      selector: config.selector || '.copy-btn',
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
    this.copyButtons = $$('.copy-btn');
    
    if (this.copyButtons.length === 0) {
      console.log('No copy buttons found on page');
      return;
    }
    
    console.log(`Found ${this.copyButtons.length} copy buttons`);
    
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
      const button = e.target.closest('.copy-btn');
      if (button && this.buttons.has(button)) {
        e.preventDefault();
        this.handleCopyClick(button);
      }
    });
  }

  /**
   * Handle copy button click
   */
  async handleCopyClick(button) {
    try {
      const codeBlock = this.findCodeBlock(button);
      if (!codeBlock) {
        throw new Error('Code block not found');
      }

      const text = this.extractText(codeBlock);
      const success = await copyToClipboard(text);
      
      if (success) {
        this.showSuccess(button);
        this.trackCopyEvent(button, text.length);
        this.emit('copy-success', { button, text });
      } else {
        throw new Error('Copy operation failed');
      }
      
    } catch (error) {
      console.error('Copy failed:', error);
      this.showError(button);
      this.emit('copy-error', { button, error });
    }
  }

  /**
   * Find the associated code block
   */
  findCodeBlock(button) {
    // Try different strategies to find the code block
    
    // Strategy 1: Direct parent container with code element
    let codeBlock = button.parentElement.querySelector('code');
    if (codeBlock) return codeBlock;
    
    // Strategy 2: Previous sibling
    let sibling = button.previousElementSibling;
    while (sibling) {
      codeBlock = sibling.querySelector('code') || (sibling.tagName === 'CODE' ? sibling : null);
      if (codeBlock) return codeBlock;
      sibling = sibling.previousElementSibling;
    }
    
    // Strategy 3: Look in closest pre element
    const preElement = button.closest('pre') || button.parentElement.querySelector('pre');
    if (preElement) {
      codeBlock = preElement.querySelector('code');
      if (codeBlock) return codeBlock;
    }
    
    // Strategy 4: Use data attribute if available
    const targetSelector = button.getAttribute('data-copy-target');
    if (targetSelector) {
      return document.querySelector(targetSelector);
    }
    
    return null;
  }

  /**
   * Extract text content from code block
   */
  extractText(codeBlock) {
    // Get text content and clean it up
    let text = codeBlock.textContent || codeBlock.innerText;
    
    // Remove any line numbers or prompt characters that might be present
    text = text.replace(/^\d+\s+/gm, ''); // Remove line numbers
    text = text.replace(/^\$\s+/gm, '');   // Remove shell prompts
    text = text.replace(/^>\s+/gm, '');    // Remove quote markers
    
    return text.trim();
  }

  /**
   * Show success feedback
   */
  showSuccess(button) {
    const buttonData = this.buttons.get(button);
    
    // Visual feedback
    button.innerHTML = this.options.successMessage;
    button.classList.add('bg-green-600', 'copy-success');
    button.classList.remove('bg-zinc-600', 'copy-error');
    
    // Announce to screen readers
    this.announceToScreenReader('Code copied to clipboard!');
    
    // Show notification if available
    this.showNotification('Code copied to clipboard!', 'success');
    
    // Reset after delay
    setTimeout(() => {
      button.innerHTML = buttonData.originalContent;
      button.classList.remove('bg-green-600', 'copy-success');
      button.classList.add('bg-zinc-600');
    }, this.options.successDuration);
  }

  /**
   * Show error feedback
   */
  showError(button) {
    const buttonData = this.buttons.get(button);
    
    // Error feedback
    button.innerHTML = this.options.errorMessage;
    button.classList.add('bg-red-600', 'copy-error');
    button.classList.remove('bg-zinc-600', 'copy-success');
    
    // Announce to screen readers
    this.announceToScreenReader('Failed to copy code');
    
    // Show notification if available
    this.showNotification('Failed to copy code', 'error');
    
    // Reset after delay
    setTimeout(() => {
      button.innerHTML = buttonData.originalContent;
      button.classList.remove('bg-red-600', 'copy-error');
      button.classList.add('bg-zinc-600');
    }, this.options.errorDuration);
  }

  /**
   * Show notification using global notification system
   */
  showNotification(message, type) {
    if (window.MiloUX && typeof window.MiloUX.showNotification === 'function') {
      const duration = type === 'error' ? this.options.errorDuration : this.options.successDuration;
      window.MiloUX.showNotification(message, type, duration);
    }
  }

  /**
   * Announce to screen readers
   */
  announceToScreenReader(message) {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  }

  /**
   * Track copy events for analytics
   */
  trackCopyEvent(button, textLength) {
    // Find the programming language if available
    const codeBlock = this.findCodeBlock(button);
    const language = codeBlock?.className.match(/language-(\w+)/)?.[1] || 'unknown';
    
    this.emit('copy-tracked', {
      language,
      textLength,
      timestamp: new Date().toISOString()
    });
    
    // Debug logging
    if (window.MiloDebug) {
      console.log(`📋 Code copied: ${language} (${textLength} chars)`);
    }
  }

  /**
   * Add new copy button dynamically
   */
  addButton(button) {
    if (this.buttons.has(button)) return;
    
    this.setupButton(button);
    console.log('Added new copy button');
  }

  /**
   * Remove copy button
   */
  removeButton(button) {
    if (!this.buttons.has(button)) return;
    
    button.removeAttribute('data-clipboard-component');
    this.buttons.delete(button);
    console.log('Removed copy button');
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
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-clipboard', ArticleClipboard);