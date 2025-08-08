/**
 * Article Header Component
 * Manages collapsible metadata panel with progressive disclosure and animations
 */

import { Component } from '../../core/Component.js';
import { animationBridge } from '../../core/AnimationBridge.js';
import { localStorage } from '../../utils/storage.js';

export class ArticleHeader extends Component {
  constructor(config = {}) {
    super({
      name: 'article-header',
      selector: config.selector || '[data-component="article-header"]',
      ...config
    });
    
    this.toggleBtn = null;
    this.metadataPanel = null;
    this.isExpanded = false;
    this.isAnimating = false;
    this.animationDuration = config.animationDuration || 400;
    this.maxHeight = config.maxHeight || 200;
  }

  async onInit() {
    if (!this.element) {
      console.warn('ArticleHeader: No article header found');
      return;
    }

    // Cache DOM references
    this.cacheElements();
    
    if (!this.toggleBtn || !this.metadataPanel) {
      console.warn('ArticleHeader: Missing required elements (toggle button or metadata panel)');
      return;
    }

    this.setupEventListeners();
    this.initializeState();
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.toggleBtn = this.element.querySelector('[data-metadata-toggle]');
    this.metadataPanel = this.element.querySelector('[data-metadata-panel]');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Primary toggle interaction
    this.addEventListener(this.toggleBtn, 'click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Keyboard support
    this.addEventListener(this.toggleBtn, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Close on escape key when expanded
    this.addEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded && !this.isAnimating) {
        this.collapse();
      }
    });

    // Handle window resize
    this.addEventListener(window, 'resize', () => {
      if (this.isExpanded) {
        this.adjustPanelHeight();
      }
    });
  }

  /**
   * Initialize component state from localStorage
   */
  initializeState() {
    // Check if there's a stored preference
    const stored = localStorage.get('article-metadata-expanded');
    const shouldExpand = stored === 'true';
    
    if (shouldExpand) {
      // Expand without animation on page load
      this.expand(false);
    } else {
      // Ensure collapsed state
      this.collapse(false);
    }
  }

  /**
   * Toggle the metadata panel
   */
  toggle() {
    if (this.isAnimating) {
      return;
    }

    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * Expand the metadata panel
   */
  expand(animate = true) {
    if (this.isExpanded || this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.isExpanded = true;

    // Update ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.metadataPanel.setAttribute('aria-hidden', 'false');

    // Update button text for screen readers
    this.updateButtonText('Hide Article Info');

    if (animate) {
      // Add animation class
      this.element.classList.add('expanding');
      
      // Allow panel to expand
      this.metadataPanel.style.maxHeight = this.metadataPanel.scrollHeight + 'px';
      
      // Clean up after animation
      setTimeout(() => {
        this.element.classList.remove('expanding');
        this.metadataPanel.style.maxHeight = this.maxHeight + 'px';
        this.isAnimating = false;
        this.emit('header:metadataExpanded');
      }, this.animationDuration);
    } else {
      // Immediate expand
      this.metadataPanel.style.maxHeight = this.maxHeight + 'px';
      this.isAnimating = false;
      this.emit('header:metadataExpanded');
    }

    // Store preference
          localStorage.set('article-metadata-expanded', true);
  }

  /**
   * Collapse the metadata panel
   */
  collapse(animate = true) {
    if (!this.isExpanded || this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.isExpanded = false;

    // Update ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.metadataPanel.setAttribute('aria-hidden', 'true');

    // Update button text for screen readers
    this.updateButtonText('Article Info');

    if (animate) {
      // Add animation class
      this.element.classList.add('collapsing');
      
      // Get current height and then collapse
      const currentHeight = this.metadataPanel.scrollHeight;
      this.metadataPanel.style.maxHeight = currentHeight + 'px';
      
      // Force reflow
      this.metadataPanel.offsetHeight;
      
      // Collapse to 0
      this.metadataPanel.style.maxHeight = '0';
      
      // ✅ UPDATED: Use CSS timing tokens instead of hardcoded duration
      const duration = animationBridge.getTiming('medium');
      setTimeout(() => {
        this.element.classList.remove('collapsing');
        this.isAnimating = false;
        this.emit('header:metadataCollapsed');
      }, duration);
    } else {
      // Immediate collapse
      this.metadataPanel.style.maxHeight = '0';
      this.isAnimating = false;
      this.emit('header:metadataCollapsed');
    }

    // Store preference
          localStorage.set('article-metadata-expanded', false);
  }

  /**
   * Update button text for accessibility
   */
  updateButtonText(text) {
    const buttonText = this.toggleBtn.querySelector('.article-header__toggle-text');
    if (buttonText) {
      buttonText.textContent = text;
    }
  }

  /**
   * Adjust panel height on window resize
   */
  adjustPanelHeight() {
    if (this.isExpanded && !this.isAnimating) {
      this.metadataPanel.style.maxHeight = 'none';
      const newHeight = this.metadataPanel.scrollHeight;
      this.metadataPanel.style.maxHeight = Math.min(newHeight, this.maxHeight) + 'px';
    }
  }

  /**
   * Get current component state
   */
  getState() {
    return {
      isExpanded: this.isExpanded,
      isAnimating: this.isAnimating,
      hasMetadata: !!this.metadataPanel,
      hasToggle: !!this.toggleBtn
    };
  }

  /**
   * Programmatically expand the panel
   */
  show() {
    if (!this.isExpanded) {
      this.expand();
    }
  }

  /**
   * Programmatically collapse the panel
   */
  hide() {
    if (this.isExpanded) {
      this.collapse();
    }
  }

  /**
   * Reset to default state
   */
  reset() {
    this.collapse(false);
    localStorage.remove('article-metadata-expanded');
    this.emit('header:reset');
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.animationDuration !== undefined) {
      this.animationDuration = config.animationDuration;
    }
    if (config.maxHeight !== undefined) {
      this.maxHeight = config.maxHeight;
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // Reset animations if in progress
    if (this.isAnimating) {
      this.element.classList.remove('expanding', 'collapsing');
      this.isAnimating = false;
    }
    
    // Reset state
    this.isExpanded = false;
    
    // no-op
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-header', ArticleHeader);