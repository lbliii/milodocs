/**
 * NotebookLaunch Component - Notebook platform launcher dropdown
 * Provides quick access to launch notebooks in external platforms like Colab, Binder, etc.
 */

import { Component } from '../../core/ComponentManager.js';
import { announceToScreenReader } from '../../utils/accessibility.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('NotebookLaunch');

export class NotebookLaunch extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-launch',
      selector: '[data-component="notebook-launch"]',
      ...config
    });

    this.options = {
      animationDuration: 150,
      ...this.options
    };

    // Component state
    this.isOpen = false;
  }

  /**
   * Setup DOM elements
   */
  setupElements() {
    super.setupElements();

    this.toggle = this.element.querySelector('[data-launch-toggle]');
    this.dropdown = this.element.querySelector('[data-launch-dropdown]');
    this.dropdownArrow = this.element.querySelector('[data-dropdown-arrow]');

    if (!this.toggle || !this.dropdown) {
      log.warn('Required elements not found');
      return;
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle dropdown
    this.addEventListener(this.toggle, 'click', this.handleToggle.bind(this));

    // Close on outside click
    this.addEventListener(document, 'click', this.handleOutsideClick.bind(this));

    // Close on escape key
    this.addEventListener(document, 'keydown', this.handleKeydown.bind(this));

    // Prevent dropdown from closing when clicking inside
    this.addEventListener(this.dropdown, 'click', (e) => {
      e.stopPropagation();
    });

    // Track clicks on platform links for analytics
    const platformLinks = this.dropdown.querySelectorAll('a[href*="colab"], a[href*="binder"], a[href*="nbviewer"]');
    platformLinks.forEach(link => {
      this.addEventListener(link, 'click', (e) => {
        const platform = this.getPlatformFromUrl(link.href);
        this.trackPlatformLaunch(platform);
        this.closeDropdown();
      });
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
    this.dropdown.classList.remove('hidden');
    this.toggle.setAttribute('aria-expanded', 'true');
    
    // Rotate arrow
    if (this.dropdownArrow) {
      this.dropdownArrow.style.transform = 'rotate(180deg)';
    }

    // Focus first item in dropdown
    const firstItem = this.dropdown.querySelector('a, button');
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

    // Announce to screen readers
    announceToScreenReader('Notebook launch options opened');
    
    log.debug('Launch dropdown opened');
  }

  /**
   * Close dropdown menu
   */
  closeDropdown() {
    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    
    // Rotate arrow back
    if (this.dropdownArrow) {
      this.dropdownArrow.style.transform = 'rotate(0deg)';
    }

    // Animate out
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      this.dropdown.classList.add('hidden');
      this.dropdown.style.transition = '';
      this.dropdown.style.opacity = '';
      this.dropdown.style.transform = '';
    }, this.options.animationDuration);

    log.debug('Launch dropdown closed');
  }

  /**
   * Extract platform name from URL for analytics
   */
  getPlatformFromUrl(url) {
    if (url.includes('colab.research.google.com')) return 'colab';
    if (url.includes('mybinder.org')) return 'binder';
    if (url.includes('nbviewer.jupyter.org')) return 'nbviewer';
    if (url.includes('github.dev')) return 'github-dev';
    if (url.includes('github.com')) return 'github';
    return 'unknown';
  }

  /**
   * Track platform launch for analytics (can be enhanced)
   */
  trackPlatformLaunch(platform) {
    // Emit event for potential analytics integration
    this.emit('notebook:platform-launch', { 
      platform,
      notebookPath: this.element.dataset.notebookPath,
      timestamp: new Date().toISOString()
    });

    // Optional: Console logging for development
    log.debug(`Notebook launched on platform: ${platform}`);
  }

  /**
   * Get launch statistics
   */
  getStats() {
    return {
      isOpen: this.isOpen,
      platformCount: this.dropdown.querySelectorAll('a[target="_blank"]').length,
      hasNotebook: !!this.element.dataset.notebookPath
    };
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
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('notebook-launch', NotebookLaunch);