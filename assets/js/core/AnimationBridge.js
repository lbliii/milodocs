/* 🎯 Animation Bridge - JavaScript Integration Layer
 * =================================================
 * 
 * This module bridges our new CSS animation system with JavaScript,
 * providing a unified API for components to use CSS tokens and data attributes.
 */

export class AnimationBridge {
  constructor() {
    this.timingTokens = {
      instant: 'var(--timing-instant)',
      fast: 'var(--timing-fast)', 
      medium: 'var(--timing-medium)',
      slow: 'var(--timing-slow)'
    };
    
    this.easingTokens = {
      standard: 'var(--easing-standard)',
      emphasized: 'var(--easing-emphasized)',
      smooth: 'var(--easing-smooth)'
    };
  }

  /**
   * Get CSS timing value in milliseconds from CSS custom property
   * @param {string} tokenName - Token name (instant, fast, medium, slow)
   * @returns {number} Duration in milliseconds
   */
  getTiming(tokenName = 'medium') {
    const cssVariable = this.timingTokens[tokenName] || this.timingTokens.medium;
    const value = this.getCSSValue(cssVariable);
    return parseFloat(value) * 1000; // Convert seconds to milliseconds
  }

  /**
   * Get CSS easing value from CSS custom property
   * @param {string} tokenName - Token name (standard, emphasized, smooth)
   * @returns {string} CSS easing function
   */
  getEasing(tokenName = 'standard') {
    const cssVariable = this.easingTokens[tokenName] || this.easingTokens.standard;
    return this.getCSSValue(cssVariable);
  }

  /**
   * Get computed CSS custom property value
   * @param {string} cssVar - CSS variable (e.g., 'var(--timing-medium)')
   * @returns {string} Computed value
   */
  getCSSValue(cssVar) {
    const propName = cssVar.match(/var\(([^)]+)\)/)?.[1];
    if (propName) {
      return getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
    }
    return cssVar;
  }

  /**
   * Set collapse state using new data attribute system
   * @param {Element} element - Target element
   * @param {string} state - State: 'collapsed', 'transitioning', 'expanded'
   */
  setCollapseState(element, state) {
    if (!element) return;
    
    element.setAttribute('data-collapse-state', state);
    
    // Backward compatibility: also set old classes for existing CSS
    if (state === 'expanded') {
      element.classList.add('expanded');
      element.classList.remove('collapsed');
    } else if (state === 'collapsed') {
      element.classList.remove('expanded');
      element.classList.add('collapsed');
    }
  }

  /**
   * Get current collapse state
   * @param {Element} element - Target element
   * @returns {string} Current state
   */
  getCollapseState(element) {
    if (!element) return 'collapsed';
    return element.getAttribute('data-collapse-state') || 'collapsed';
  }

  /**
   * Set component state using new data attribute system
   * @param {Element} element - Target element
   * @param {string} state - State: 'loading', 'ready', 'disabled', 'error'
   */
  setComponentState(element, state) {
    if (!element) return;
    element.setAttribute('data-component-state', state);
  }

  /**
   * Expand element with proper animation and state management
   * @param {Element} element - Element to expand
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when animation completes
   */
  async expand(element, options = {}) {
    if (!element) return;

    const {
      timing = 'medium',
      easing = 'standard',
      height = null
    } = options;

    // Set transitioning state
    this.setCollapseState(element, 'transitioning');
    
    // Update ARIA attributes
    const header = element.querySelector('[aria-expanded]');
    if (header) {
      header.setAttribute('aria-expanded', 'true');
    }

    // Get animation duration from CSS
    const duration = this.getTiming(timing);
    
    // Set expanded state (CSS handles the animation)
    setTimeout(() => {
      this.setCollapseState(element, 'expanded');
    }, 10);

    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * Collapse element with proper animation and state management
   * @param {Element} element - Element to collapse
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when animation completes
   */
  async collapse(element, options = {}) {
    if (!element) return;

    const {
      timing = 'medium',
      easing = 'standard'
    } = options;

    // Set transitioning state
    this.setCollapseState(element, 'transitioning');
    
    // Update ARIA attributes
    const header = element.querySelector('[aria-expanded]');
    if (header) {
      header.setAttribute('aria-expanded', 'false');
    }

    // Get animation duration from CSS
    const duration = this.getTiming(timing);
    
    // Set collapsed state (CSS handles the animation)
    setTimeout(() => {
      this.setCollapseState(element, 'collapsed');
    }, 10);

    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * Toggle element between expanded/collapsed states
   * @param {Element} element - Element to toggle
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when animation completes
   */
  async toggle(element, options = {}) {
    if (!element) return;

    const currentState = this.getCollapseState(element);
    const isExpanded = currentState === 'expanded';

    if (isExpanded) {
      return this.collapse(element, options);
    } else {
      return this.expand(element, options);
    }
  }

  /**
   * Apply loading state with CSS tokens
   * @param {Element} element - Element to apply loading state
   * @param {boolean} isLoading - Whether element is loading
   */
  setLoadingState(element, isLoading) {
    if (!element) return;

    if (isLoading) {
      this.setComponentState(element, 'loading');
    } else {
      this.setComponentState(element, 'ready');
    }
  }

  /**
   * Create universal toggle function for use in templates
   * This replaces the old toggleCollapse() function
   * @param {string} elementId - ID of element to toggle
   * @param {Object} options - Animation options
   */
  createToggleFunction() {
    // Create global function for backward compatibility
    window.toggleCollapse = async (elementId, options = {}) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with ID '${elementId}' not found`);
        return;
      }

      return this.toggle(element, options);
    };

    // Enhanced version with more options
    window.animationBridge = this;
  }

  /**
   * Initialize the animation bridge system
   * Call this once when the page loads
   */
  init() {
    // Create global toggle function
    this.createToggleFunction();

    // Set initial states for elements that don't have them
    this.initializeStates();

    console.log('🎯 Animation Bridge initialized with CSS token integration');
  }

  /**
   * Initialize states for existing elements
   */
  initializeStates() {
    // Find all collapse elements and set initial states
    const collapseElements = document.querySelectorAll('.collapse');
    collapseElements.forEach(element => {
      // If no data-collapse-state, infer from classes
      if (!element.hasAttribute('data-collapse-state')) {
        const isExpanded = element.classList.contains('expanded');
        this.setCollapseState(element, isExpanded ? 'expanded' : 'collapsed');
      }

      // Set component state to ready
      if (!element.hasAttribute('data-component-state')) {
        this.setComponentState(element, 'ready');
      }
    });
  }

  /**
   * Migrate existing components to use new system
   * This can be called to update old components
   */
  migrateExistingComponents() {
    // Find elements using old .expanded/.collapsed classes
    const expandedElements = document.querySelectorAll('.expanded');
    expandedElements.forEach(el => {
      if (!el.hasAttribute('data-collapse-state')) {
        this.setCollapseState(el, 'expanded');
      }
    });

    const collapsedElements = document.querySelectorAll('.collapsed');
    collapsedElements.forEach(el => {
      if (!el.hasAttribute('data-collapse-state')) {
        this.setCollapseState(el, 'collapsed');
      }
    });

    console.log('🔄 Migrated existing components to new animation system');
  }
}

// Create global instance
export const animationBridge = new AnimationBridge();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animationBridge.init();
  });
} else {
  animationBridge.init();
}