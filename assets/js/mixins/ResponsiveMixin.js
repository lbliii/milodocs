/**
 * ResponsiveMixin - Mixin for components that need responsive mobile/desktop behavior
 * Provides standardized responsive state management and event handling
 * Refactored to use MixinBase utilities for consistency
 */

import { MixinUtilities, validateMixinInterface } from './MixinBase.js';
import { logger } from '../utils/Logger.js';
const log = logger.component('ResponsiveMixin');

/**
 * Mixin that adds responsive behavior to components
 * Usage: Object.assign(YourComponent.prototype, ResponsiveMixin);
 */
export const ResponsiveMixin = {
  
  /**
   * Initialize responsive functionality using MixinBase utilities
   * Call this from your component's onInit method
   * @param {Object} options - Configuration options
   */
  initResponsive: MixinUtilities.createInitFunction(
    'ResponsiveMixin',
    {
      mobileBreakpoint: 768,
      overlaySelector: '#mobileNavOverlay',
      overlayToggleClass: 'hidden',
      debounceDelay: 150
    },
    function setupResponsive() {
      this.isOpen = false; // Track mobile state
      this.resizeTimeout = null; // For debouncing resize events
      
      this.initializeMobileState();
      this.setupResponsiveHandling();
    }
  ),

  /**
   * Initialize mobile sidebar state without interfering with desktop CSS
   */
  initializeMobileState() {
    const isMobile = this.isMobileViewport();
    
    if (isMobile) {
      // On mobile, check if component is currently open
      this.isOpen = this.element?.classList.contains('translate-x-0') && 
                    !this.element?.classList.contains('-translate-x-full');
    } else {
      // On desktop, component visibility is handled by CSS, just track mobile overlay state
      this.isOpen = false; // No mobile overlay should be active on desktop
    }
  },

  /**
   * Setup responsive handling without forcing initial state
   */
  setupResponsiveHandling() {
    // Listen for window resize to handle responsive behavior
    // But don't force any initial state - let CSS handle it
    this.addEventListener(window, 'resize', () => {
      // Debounce resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResponsiveChange();
      }, this.responsiveOptions.debounceDelay);
    });
  },

  /**
   * Handle responsive changes without forcing initial desktop state
   */
  handleResponsiveChange() {
    const isMobile = this.isMobileViewport();
    
    if (isMobile) {
      // On mobile: ensure any open overlay is closed
      this.closeOverlayIfOpen();
      log.debug(`${this.name}: Responsive change to mobile`);
    } else {
      // On desktop: just ensure overlays are hidden, but don't touch component visibility
      this.closeOverlayIfOpen();
    }
    
    // Emit responsive change event
    this.emit('responsive-change', {
      isMobile,
      breakpoint: this.responsiveOptions.mobileBreakpoint
    });
  },

  /**
   * Check if current viewport is mobile
   * @returns {boolean} Whether viewport is mobile size
   */
  isMobileViewport() {
    return window.innerWidth < this.responsiveOptions.mobileBreakpoint;
  },

  /**
   * Close overlay and clean up mobile-specific state without touching component visibility
   */
  closeOverlayIfOpen() {
    // Hide overlay if it exists
    const overlay = document.querySelector(this.responsiveOptions.overlaySelector);
    if (overlay && !overlay.classList.contains(this.responsiveOptions.overlayToggleClass)) {
      overlay.classList.add(this.responsiveOptions.overlayToggleClass);
    }
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    // Reset mobile open state
    this.isOpen = false;
  },

  /**
   * Open mobile component
   */
  openMobile() {
    if (this.isOpen || !this.isMobileViewport()) return;
    
    // Update component state
    this.updateComponentState('opening');
    
    if (this.element) {
      this.element.classList.remove('-translate-x-full');
      this.element.classList.add('translate-x-0');
    }
    
    this.isOpen = true;
    
    // Show overlay if configured
    const overlay = document.querySelector(this.responsiveOptions.overlaySelector);
    if (overlay) {
      overlay.classList.remove(this.responsiveOptions.overlayToggleClass);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Set final state after animation
    setTimeout(() => {
      this.updateComponentState('open');
    }, 300);
    
    this.emit('mobile-opened');
    log.debug(`${this.name}: Mobile component opened`);
  },

  /**
   * Close mobile component
   */
  closeMobile() {
    if (!this.isOpen) return;
    
    // Update component state
    this.updateComponentState('closing');
    
    if (this.element) {
      this.element.classList.add('-translate-x-full');
      this.element.classList.remove('translate-x-0');
    }
    
    this.isOpen = false;
    
    // Hide overlay
    this.closeOverlayIfOpen();
    
    // Set final state after animation
    setTimeout(() => {
      this.updateComponentState('closed');
    }, 300);
    
    this.emit('mobile-closed');
  },

  /**
   * Toggle mobile component
   */
  toggleMobile() {
    if (this.isOpen) {
      this.closeMobile();
    } else {
      this.openMobile();
    }
  },

  /**
   * Force close mobile component (useful for cleanup)
   */
  forceCloseMobile() {
    if (this.element) {
      this.element.classList.add('-translate-x-full');
      this.element.classList.remove('translate-x-0');
    }
    
    this.isOpen = false;
    this.closeOverlayIfOpen();
    
    this.emit('mobile-closed');
    log.debug(`${this.name}: Mobile component force closed`);
  },

  /**
   * Reset component to initial responsive state (useful for debugging)
   */
  resetResponsiveState() {
    this.forceCloseMobile();
    
    // Reset any responsive-specific classes
    if (this.element) {
      this.element.classList.remove('translate-x-0');
    }
    
    log.debug(`${this.name}: Reset to initial responsive state`);
    this.emit('responsive-reset');
  },

  /**
   * Get current responsive state
   * @returns {Object} Current responsive state information
   */
  getResponsiveState() {
    return {
      isMobile: this.isMobileViewport(),
      isOpen: this.isOpen,
      breakpoint: this.responsiveOptions.mobileBreakpoint,
      viewportWidth: window.innerWidth
    };
  },

  /**
   * Check if responsive functionality is healthy using standardized checks
   */
  isResponsiveHealthy: MixinUtilities.createHealthCheck([
    function() { return this.responsiveOptions !== undefined; },
    function() { return typeof this.isMobileViewport === 'function'; },
    function() { return typeof this.responsiveOptions.mobileBreakpoint === 'number'; }
  ])
};

// Validate mixin interface
validateMixinInterface(ResponsiveMixin, {
  methods: ['initResponsive', 'isResponsiveHealthy']
});
