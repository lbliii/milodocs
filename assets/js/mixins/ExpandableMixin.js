/**
 * ExpandableMixin - Mixin for components that need expand/collapse functionality
 * Provides standardized toggle behavior, accessibility, and animation integration
 * Refactored to use MixinBase utilities for consistency
 */

import { animationBridge } from '../core/AnimationBridge.js';
import { MixinUtilities, MixinPatterns } from './MixinBase.js';
import { logger } from '../utils/Logger.js';
const log = logger.component('ExpandableMixin');

/**
 * Mixin that adds expand/collapse functionality to components
 * Usage: Object.assign(YourComponent.prototype, ExpandableMixin);
 */
export const ExpandableMixin = {
  
  /**
   * Initialize expandable functionality using MixinBase utilities
   * Call this from your component's onInit method
   * @param {Object} options - Configuration options
   */
  initExpandable: MixinUtilities.createInitFunction(
    'ExpandableMixin',
    {
      toggleSelector: '.sidebar__toggle',
      contentSelector: '.nested-content',
      animationTiming: 'medium',
      autoExpand: false
    },
    function setupExpandable() {
      this.setupExpandableElements();
      this.setupExpandableEvents();
      this.setupExpandableAccessibility();
    }
  ),

  /**
   * Find and cache expandable elements using standardized setup
   */
  setupExpandableElements() {
    if (!this.element) return;
    
    // Use expandable options set by MixinUtilities.createInitFunction
    const toggleSelector = this.expandableOptions.toggleSelector;
    this.toggles = Array.from(this.element.querySelectorAll(toggleSelector));
    
    // Cache content elements for each toggle
    this.toggleContentMap = new Map();
    
    this.toggles.forEach(toggle => {
      const listItem = toggle.closest('li');
      const content = listItem?.querySelector(this.expandableOptions.contentSelector);
      
      if (content) {
        this.toggleContentMap.set(toggle, content);
      }
    });
  },

  /**
   * Setup event listeners for toggles
   */
  setupExpandableEvents() {
    if (!this.toggles) return;
    
    this.toggles.forEach(toggle => {
      this.addEventListener(toggle, 'click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.handleToggleClick(toggle);
      });
    });
  },

  /**
   * Setup accessibility attributes for toggles
   */
  setupExpandableAccessibility() {
    if (!this.toggles) return;
    
    this.toggles.forEach(toggle => {
      // Set initial ARIA attributes if not already set
      if (!toggle.hasAttribute('aria-expanded')) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      if (!toggle.hasAttribute('role')) {
        toggle.setAttribute('role', 'button');
      }
      if (!toggle.hasAttribute('tabindex')) {
        toggle.setAttribute('tabindex', '0');
      }
    });
  },

  /**
   * Handle toggle button clicks
   * @param {Element} toggle - Toggle button element
   */
  async handleToggleClick(toggle) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    // Emit event before toggle
    this.emit('before-toggle', {
      toggle,
      expanding: newState,
      collapsing: !newState
    });
    
    // Fire-and-forget the animation to avoid serializing rapid interactions
    // await this.setToggleState(toggle, newState);
    const _promise = this.setToggleState(toggle, newState);
    
    // Emit event after toggle
    this.emit('after-toggle', {
      toggle,
      expanded: newState,
      collapsed: !newState
    });
  },

  /**
   * Set the expand/collapse state of a toggle
   * @param {Element} toggle - Toggle button element
   * @param {boolean} expand - Whether to expand (true) or collapse (false)
   */
  async setToggleState(toggle, expand) {
    const content = this.toggleContentMap.get(toggle);
    if (!content) {
      log.warn('No content found for toggle:', toggle);
      return;
    }

    // Update ARIA and visual state immediately for better UX
    toggle.setAttribute('aria-expanded', expand.toString());
    
    // Update visual indicator (chevron rotation)
    const chevron = toggle.querySelector('svg, .chevron, .icon');
    if (chevron) {
      if (expand) {
        chevron.classList.add('rotate-90');
      } else {
        chevron.classList.remove('rotate-90');
      }
    }

    // Perform animation
    if (expand) {
      if (this.isInitialized) {
        await animationBridge.expand(content, { timing: this.expandableOptions.animationTiming });
      } else {
        // Instant expansion during initialization
        animationBridge.setCollapseState(content, 'expanded');
      }
    } else {
      if (this.isInitialized) {
        await animationBridge.collapse(content, { timing: this.expandableOptions.animationTiming });
      } else {
        // Instant collapse during initialization
        animationBridge.setCollapseState(content, 'collapsed');
      }
    }
  },

  /**
   * Expand a specific toggle
   * @param {Element} toggle - Toggle button element
   */
  async expandToggle(toggle) {
    if (toggle.getAttribute('aria-expanded') !== 'true') {
      await this.setToggleState(toggle, true);
    }
  },

  /**
   * Collapse a specific toggle
   * @param {Element} toggle - Toggle button element
   */
  async collapseToggle(toggle) {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      await this.setToggleState(toggle, false);
    }
  },

  /**
   * Expand all toggles
   */
  async expandAll() {
    if (!this.toggles) return;
    
    const expandPromises = this.toggles.map(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'false') {
        return this.setToggleState(toggle, true);
      }
      return Promise.resolve();
    });
    
    await Promise.all(expandPromises);
    this.emit('expanded-all');
  },

  /**
   * Collapse all toggles
   */
  async collapseAll() {
    if (!this.toggles) return;
    
    const collapsePromises = this.toggles.map(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        return this.setToggleState(toggle, false);
      }
      return Promise.resolve();
    });
    
    await Promise.all(collapsePromises);
    this.emit('collapsed-all');
  },

  /**
   * Get expanded toggles
   * @returns {Element[]} Array of expanded toggle elements
   */
  getExpandedToggles() {
    if (!this.toggles) return [];
    return this.toggles.filter(toggle => toggle.getAttribute('aria-expanded') === 'true');
  },

  /**
   * Get collapsed toggles
   * @returns {Element[]} Array of collapsed toggle elements
   */
  getCollapsedToggles() {
    if (!this.toggles) return [];
    return this.toggles.filter(toggle => toggle.getAttribute('aria-expanded') === 'false');
  },

  /**
   * Check if expandable functionality is healthy using standardized checks
   * @returns {boolean} Whether expandable functionality is working
   */
  isExpandableHealthy: MixinUtilities.createHealthCheck([
    function() { return this.toggles && this.toggles.length > 0; },
    function() { return this.expandableOptions !== undefined; },
    function() {
      // Check if toggles have proper initialization
      return this.toggles.every(toggle => toggle.hasAttribute('aria-expanded'));
    },
    function() {
      // Check if toggle has event listener tracking
      return this.toggles.every(toggle => {
        if (!toggle.dataset || !toggle.dataset.componentListeners) return false;
        return toggle.dataset.componentListeners.includes(this.id);
      });
    },
    function() {
      // Check if we have the right number of click listeners
      if (!this.eventListeners) return false;
      const toggleClickListeners = Array.from(this.eventListeners.values())
        .filter(listener => listener.event === 'click' && 
                          this.toggles.includes(listener.element));
      return toggleClickListeners.length === this.toggles.length;
    }
  ])
};

// Validate mixin interface using MixinBase utilities
import { validateMixinInterface } from './MixinBase.js';
validateMixinInterface(ExpandableMixin, {
  methods: ['initExpandable', 'isExpandableHealthy']
});
