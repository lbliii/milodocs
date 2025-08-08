/**
 * CopyPage Component - Share page functionality with LLM integration
 * Provides copy URL and quick sharing with popular AI assistants
 */

import { Component } from '../../core/Component.js';
import { copyToClipboard } from '../../utils/dom.js';
import { announceToScreenReader } from '../../utils/accessibility.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('CopyPage');

export class CopyPage extends Component {
  constructor(config = {}) {
    super({
      name: 'copy-page',
      selector: '[data-component="copy-page"]',
      ...config
    });

    this.options = {
      copySuccessDuration: 2000,
      animationDuration: 150,
      ...this.options
    };

    // Component state
    this.isOpen = false;
    this.currentUrl = '';
    this.pageContent = null;
    this.jsonUrl = '';
    this.txtUrl = '';
    this.pageText = '';
  }

    /**
   * Setup DOM elements
   */
setupElements() {
    super.setupElements();

    this.toggle = this.element.querySelector('[data-copy-page-toggle]');
    this.dropdown = this.element.querySelector('[data-copy-page-dropdown]');
    this.dropdownArrow = this.element.querySelector('[data-dropdown-arrow]');
    this.copyUrlButton = this.element.querySelector('[data-copy-url]');
    this.copyContentButton = this.element.querySelector('[data-copy-content]');

    // Get the current page URL from the copy button
    if (this.copyUrlButton) {
      this.currentUrl = this.copyUrlButton.getAttribute('data-copy-url');
      const base = this.currentUrl.replace(/\/$/, '');
      this.jsonUrl = base + '/index.json';
      this.txtUrl = base + '/index.txt';
    }

    if (!this.toggle || !this.dropdown) {
      log.warn('Required elements not found');
      return;
    }

    // Pre-fetch page content for AI sharing
    this.fetchPageContent();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle dropdown
    this.addEventListener(this.toggle, 'click', this.handleToggle.bind(this));

    // Copy URL button
    if (this.copyUrlButton) {
      this.addEventListener(this.copyUrlButton, 'click', this.handleCopyUrl.bind(this));
    }

    // Copy content button
    if (this.copyContentButton) {
      this.addEventListener(this.copyContentButton, 'click', this.handleCopyContent.bind(this));
    }

    // Close on outside click
    this.addEventListener(document, 'click', this.handleOutsideClick.bind(this));

    // Close on escape key
    this.addEventListener(document, 'keydown', this.handleKeydown.bind(this));

    // Prevent dropdown from closing when clicking inside
    this.addEventListener(this.dropdown, 'click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Handle toggle button click
   */
  handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Handle copy URL button click
   */
  async handleCopyUrl(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const success = await copyToClipboard(this.currentUrl);
      
      if (success) {
        this.showCopySuccess('Page URL copied to clipboard', this.copyUrlButton);
        this.closeDropdown();
      } else {
        this.showCopyError('Failed to copy URL', this.copyUrlButton);
      }
    } catch (error) {
      log.error('Copy failed:', error);
      this.showCopyError('Failed to copy URL', this.copyUrlButton);
    }
  }

  /**
   * Handle copy content button click
   */
  async handleCopyContent(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.pageContent) {
      this.showCopyError('Content not yet loaded', this.copyContentButton);
      return;
    }

    try {
      const contentText = this.createAIPrompt();
      const success = await copyToClipboard(contentText);
      
      if (success) {
        this.showCopySuccess('Page content copied to clipboard', this.copyContentButton);
        this.closeDropdown();
      } else {
        this.showCopyError('Failed to copy content', this.copyContentButton);
      }
    } catch (error) {
      log.error('Copy content failed:', error);
      this.showCopyError('Failed to copy content', this.copyContentButton);
    }
  }

  /**
   * Handle outside click to close dropdown
   */
  handleOutsideClick(e) {
    if (this.isOpen && !this.element.contains(e.target)) {
      this.closeDropdown();
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.closeDropdown();
      this.toggle.focus();
    }
  }

  /**
   * Open dropdown menu
   */
  openDropdown() {
    this.isOpen = true;
    this.dropdown.setAttribute('data-state', 'visible');
    this.toggle.setAttribute('aria-expanded', 'true');
    
    // Focus first item in dropdown
    const firstItem = this.dropdown.querySelector('button, a');
    if (firstItem) {
      firstItem.focus();
    }

    // Animate in
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
      this.dropdown.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
      this.dropdown.style.opacity = '1';
      this.dropdown.style.transform = 'translateY(0)';
    });

    log.debug('Dropdown opened');
  }

  /**
   * Close dropdown menu
   */
  closeDropdown() {
    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');

    // Animate out
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      this.dropdown.setAttribute('data-state', 'hidden');
      this.dropdown.style.transition = '';
      this.dropdown.style.opacity = '';
      this.dropdown.style.transform = '';
    }, this.options.animationDuration);

    log.debug('Dropdown closed');
  }

  /**
   * Show copy success feedback
   */
  showCopySuccess(message, button = this.copyUrlButton) {
    if (!button) return;

    // Update button text temporarily
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    button.classList.add('success');

    // Announce to screen readers
    announceToScreenReader(message);

    // Reset after delay
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('success');
    }, this.options.copySuccessDuration);

    log.debug('Copy success feedback shown');
  }

  /**
   * Show copy error feedback
   */
  showCopyError(message, button = this.copyUrlButton) {
    if (!button) return;

    // Update button text temporarily
    const originalText = button.textContent;
    button.textContent = '✗ Failed';
    button.classList.add('error');

    // Announce to screen readers
    announceToScreenReader(message);

    // Reset after delay
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('error');
    }, this.options.copySuccessDuration);

    log.error('Copy error feedback shown');
  }

  /**
   * Fetch page content from index.txt (preferred) and index.json for AI sharing
   */
  async fetchPageContent() {
    const requests = [];
    if (this.txtUrl) {
      requests.push(
        fetch(this.txtUrl)
          .then(r => (r.ok ? r.text() : ''))
          .then(text => { this.pageText = (text || '').trim(); })
          .catch(() => {})
      );
    }
    if (this.jsonUrl) {
      requests.push(
        fetch(this.jsonUrl)
          .then(r => (r.ok ? r.json() : null))
          .then(json => { this.pageContent = json; })
          .catch(() => {})
      );
    }

    try {
      await Promise.allSettled(requests);
      this.updateAILinks();
      log.debug('Page content fetched (txt/json) for AI sharing');
    } catch (error) {
      log.warn('Error fetching AI share content:', error);
    }
  }

  /**
   * Update AI sharing links with page content
   */
  updateAILinks() {
    if (!this.pageContent) return;

    const aiLinks = this.dropdown.querySelectorAll('a[href*="claude.ai"], a[href*="chat.openai.com"], a[href*="copilot.microsoft.com"]');
    
    aiLinks.forEach(link => {
      const prompt = this.createAIPrompt();
      const encodedPrompt = encodeURIComponent(prompt);
      
      if (link.href.includes('claude.ai')) {
        link.href = `https://claude.ai/chat?q=${encodedPrompt}`;
      } else if (link.href.includes('chat.openai.com')) {
        link.href = `https://chat.openai.com/?q=${encodedPrompt}`;
      } else if (link.href.includes('copilot.microsoft.com')) {
        link.href = `https://copilot.microsoft.com/?q=${encodedPrompt}`;
      }
    });
  }

  /**
   * Create AI prompt with page content
   */
  createAIPrompt() {
    // Prefer purpose-built txt output when available
    const maxContentLength = 4000;

    if (this.pageText && this.pageText.length > 0) {
      let text = this.pageText;
      if (text.length > maxContentLength) {
        text = text.substring(0, maxContentLength) + '\n\n[Content truncated - see full content at URL]';
      }
      return [
        'Please help me understand this documentation:',
        '',
        `**URL**: ${this.currentUrl}`,
        '',
        '**Content (LLM-optimized)**:',
        text,
        '',
        'Please explain the key concepts and help me understand how to use this information.'
      ].join('\n');
    }

    // Fallback to JSON fields if txt is not available
    if (this.pageContent) {
      const {
        title,
        linkTitle,
        description,
        body,
        contentWithoutSummary,
        section,
        parent
      } = this.pageContent;

      let content = contentWithoutSummary || body || '';
      if (content.length > maxContentLength) {
        content = content.substring(0, maxContentLength) + '...\n\n[Content truncated - see full content at URL]';
      }

      let prompt = `Please help me understand this documentation:\n\n# ${title || linkTitle || 'Documentation Page'}`;
      if (description) {
        prompt += `\n\n${description}`;
      }
      if (section && parent && section !== parent) {
        prompt += `\n\n*From: ${parent} > ${section}*`;
      }
      prompt += `\n\n**URL**: ${this.currentUrl}`;
      if (content) {
        prompt += `\n\n**Content**:\n${content}`;
      }
      prompt += `\n\nPlease explain the key concepts and help me understand how to use this information.`;
      return prompt;
    }

    // Last resort: just the URL
    return `Please help me understand this documentation: ${this.currentUrl}`;
  }

  /**
   * Clean up when component is destroyed
   */
  onDestroy() {
    if (this.isOpen) {
      this.closeDropdown();
    }
  }
}

// Auto-register the component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('copy-page', CopyPage);