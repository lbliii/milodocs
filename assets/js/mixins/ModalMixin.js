/**
 * ModalMixin - Mixin for components that need modal/overlay functionality
 * Provides standardized modal behavior, focus management, and accessibility
 * Refactored to use MixinBase utilities for consistency
 */

import { MixinUtilities, validateMixinInterface } from './MixinBase.js';
import { logger } from '../utils/Logger.js';
const log = logger.component('ModalMixin');

/**
 * Mixin that adds modal/overlay functionality to components
 * Usage: Object.assign(YourComponent.prototype, ModalMixin);
 */
export const ModalMixin = {
  
  /**
   * Initialize modal functionality using MixinBase utilities
   * Call this from your component's onInit method
   * @param {Object} options - Configuration options
   */
  initModal: MixinUtilities.createInitFunction(
    'ModalMixin',
    {
      overlaySelector: '.modal-overlay',
      closeSelector: '.modal-close',
      escapeToClose: true,
      clickOutsideToClose: true,
      trapFocus: true,
      bodyScrollLock: true,
      animationDuration: 300
    },
    function setupModal() {
      this.isModalOpen = false;
      this.previousFocus = null;
      this.focusableElements = [];
      
      this.setupModalElements();
      this.setupModalEvents();
      this.setupModalAccessibility();
    }
  ),

  /**
   * Find and cache modal elements
   */
  setupModalElements() {
    if (!this.element) return;
    
    // Find overlay element
    this.overlay = this.element.querySelector(this.modalOptions.overlaySelector) ||
                   document.querySelector(this.modalOptions.overlaySelector);
    
    // Find close buttons
    this.closeButtons = Array.from(this.element.querySelectorAll(this.modalOptions.closeSelector));
    
    // Cache focusable elements for focus trapping
    this.updateFocusableElements();
  },

  /**
   * Setup event listeners for modal functionality
   */
  setupModalEvents() {
    // Close button events
    this.closeButtons.forEach(button => {
      this.addEventListener(button, 'click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    });
    
    // Overlay click to close
    if (this.overlay && this.modalOptions.clickOutsideToClose) {
      this.addEventListener(this.overlay, 'click', (e) => {
        if (e.target === this.overlay) {
          this.closeModal();
        }
      });
    }
    
    // Escape key to close
    if (this.modalOptions.escapeToClose) {
      this.addEventListener(document, 'keydown', (e) => {
        if (e.key === 'Escape' && this.isModalOpen) {
          e.preventDefault();
          this.closeModal();
        }
      });
    }
    
    // Focus trap
    if (this.modalOptions.trapFocus) {
      this.addEventListener(document, 'keydown', (e) => {
        if (e.key === 'Tab' && this.isModalOpen) {
          this.handleFocusTrap(e);
        }
      });
    }
  },

  /**
   * Setup accessibility attributes
   */
  setupModalAccessibility() {
    if (!this.element) return;
    
    // Set modal role and attributes
    if (!this.element.hasAttribute('role')) {
      this.element.setAttribute('role', 'dialog');
    }
    if (!this.element.hasAttribute('aria-modal')) {
      this.element.setAttribute('aria-modal', 'true');
    }
    if (!this.element.hasAttribute('aria-hidden')) {
      this.element.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * Open the modal
   * @param {Object} config - Optional configuration for this open
   */
  async openModal(config = {}) {
    if (this.isModalOpen) return;
    
    const options = { ...this.modalOptions, ...config };
    
    // Emit before-open event
    this.emit('before-modal-open', { options });
    
    // Store current focus
    this.previousFocus = document.activeElement;
    
    // Lock body scroll if configured
    if (options.bodyScrollLock) {
      document.body.style.overflow = 'hidden';
    }
    
    // Show modal elements
    this.element.setAttribute('aria-hidden', 'false');
    this.element.classList.remove('hidden');
    
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
    }
    
    // Update state
    this.isModalOpen = true;
    this.updateComponentState('modal-open');
    
    // Focus management
    this.updateFocusableElements();
    this.focusFirstElement();
    
    // Wait for animation if configured
    if (options.animationDuration > 0) {
      await new Promise(resolve => setTimeout(resolve, options.animationDuration));
    }
    
    // Emit after-open event
    this.emit('after-modal-open', { options });
    
    log.debug(`${this.name}: Modal opened`);
  },

  /**
   * Close the modal
   * @param {Object} config - Optional configuration for this close
   */
  async closeModal(config = {}) {
    if (!this.isModalOpen) return;
    
    const options = { ...this.modalOptions, ...config };
    
    // Emit before-close event
    this.emit('before-modal-close', { options });
    
    // Hide modal elements
    this.element.setAttribute('aria-hidden', 'true');
    this.element.classList.add('hidden');
    
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
    
    // Update state
    this.isModalOpen = false;
    this.updateComponentState('modal-closed');
    
    // Restore body scroll
    if (options.bodyScrollLock) {
      document.body.style.overflow = '';
    }
    
    // Restore focus
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    }
    
    // Wait for animation if configured
    if (options.animationDuration > 0) {
      await new Promise(resolve => setTimeout(resolve, options.animationDuration));
    }
    
    // Emit after-close event
    this.emit('after-modal-close', { options });
    
    log.debug(`${this.name}: Modal closed`);
  },

  /**
   * Toggle modal state
   */
  toggleModal() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  },

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    if (!this.element) return;
    
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(this.element.querySelectorAll(focusableSelector))
      .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
  },

  /**
   * Focus the first focusable element
   */
  focusFirstElement() {
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  },

  /**
   * Handle focus trapping within modal
   * @param {KeyboardEvent} e - Tab key event
   */
  handleFocusTrap(e) {
    if (this.focusableElements.length === 0) return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  },

  

  /**
   * Check if modal functionality is healthy using standardized checks
   */
  isModalHealthy: MixinUtilities.createHealthCheck([
    function() { return this.element !== null; },
    function() { return this.modalOptions !== undefined; },
    function() {
      // Check if modal has proper ARIA attributes
      return this.element.hasAttribute('role') && this.element.hasAttribute('aria-modal');
    },
    function() {
      // Check if close buttons have event listeners (if any exist)
      if (!this.closeButtons || this.closeButtons.length === 0) return true;
      return this.closeButtons.every(button => {
        return button.dataset && button.dataset.componentListeners &&
               button.dataset.componentListeners.includes(this.id);
      });
    }
  ])
};

// Validate mixin interface
validateMixinInterface(ModalMixin, {
  methods: ['initModal', 'isModalHealthy']
});
