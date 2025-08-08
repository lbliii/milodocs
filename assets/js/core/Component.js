/**
 * Base Component Class
 * Provides standardized component lifecycle and common utilities
 * All theme components should extend this base class
 */

import { eventBus } from './EventBus.js';
import { logger } from '../utils/Logger.js';

const log = logger.component('Component');

/**
 * Base Component class that all components should extend
 */
export class Component {
  constructor(config = {}) {
    this.name = config.name || this.constructor.name.toLowerCase();
    this.selector = config.selector;
    this.element = config.element || (config.selector ? document.querySelector(config.selector) : null);
    this.dependencies = config.dependencies || [];
    this.options = config.options || {};
    this.state = 'uninitialized';
    this.childComponents = new Map();
    
    // Modern event management with AbortController
    this.abortController = new AbortController();
    this.signal = this.abortController.signal;
    
    // Singleton behavior metadata
    this.isSingleton = config.isSingleton !== undefined ? config.isSingleton : this.detectSingletonBehavior();
    this.allowMultipleInstances = config.allowMultipleInstances || false;
    
    // Auto-generate unique instance ID
    this.id = `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Bind context for event handlers
    this.handleDestroy = this.handleDestroy.bind(this);
    
    // Listen for global destruction events
    eventBus.on('component:destroy-all', this.handleDestroy);
  }

  /**
   * Initialize the component
   */
  async init() {
    if (this.state !== 'uninitialized') {
      log.warn(`Component ${this.name} already initialized`);
      return this;
    }

    try {
      this.state = 'initializing';
      
      // Check if element exists (for DOM-dependent components)
      if (this.selector && !this.element) {
        log.trace(`${this.name}: No elements found for selector "${this.selector}" - component will remain inactive`);
        this.state = 'failed';
        return null;
      }

      // Load dependencies first
      await this.loadDependencies();
      
      // Setup DOM elements and state
      this.setupElements();
      
      // Bind events
      this.bindEvents();
      
      // Call custom initialization
      await this.onInit();
      
      this.state = 'ready';
      
      // Emit ready event
      eventBus.emit(`component:${this.name}:ready`, this);
      eventBus.emit('component:ready', { component: this });
      
      log.debug(`Component ${this.name} initialized`);
      return this;
      
    } catch (error) {
      log.error(`Component ${this.name} initialization failed:`, error);
      this.state = 'failed';
      return null;
    }
  }

  /**
   * Detect if this component should behave as a singleton
   */
  detectSingletonBehavior() {
    // ID selectors typically indicate singleton behavior
    if (this.selector && this.selector.startsWith('#')) {
      return true;
    }
    
    // Specific component patterns that should be singleton
    const singletonPatterns = [
      'theme-toggle',
      'navigation-sidebar-left',
      'navigation-mobile-toggle',
      'chat-toc-toggle',
      'performance-optimizer',
      'search'
    ];
    
    return singletonPatterns.includes(this.name);
  }

  /**
   * Load component dependencies
   */
  async loadDependencies() {
    if (!this.dependencies.length) return;
    
    // Import ComponentManager here to avoid circular dependency
    const { ComponentManager } = await import('./ComponentManager.js');
    
    const loadPromises = this.dependencies.map(async dep => {
      if (typeof dep === 'string') {
        // Load by component name
        return ComponentManager.load(dep);
      } else if (typeof dep === 'function') {
        // Load by async function
        return await dep();
      }
      return dep;
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * Setup DOM elements - override in subclasses
   */
  setupElements() {
    // Default implementation - can be overridden
    if (this.element) {
      this.element.setAttribute('data-component', this.name);
      this.element.setAttribute('data-component-id', this.id);
    }
  }

  /**
   * Bind component events - override in subclasses
   */
  bindEvents() {
    // Default implementation - can be overridden
  }

  /**
   * Custom initialization hook - override in subclasses
   */
  async onInit() {
    // Default implementation - can be overridden
  }

  // ============================================================================
  // DOM UTILITIES
  // ============================================================================

  /**
   * Find multiple elements matching the component's selector
   * Useful for components that need to work with multiple DOM elements
   */
  findElements(customSelector = null) {
    const selector = customSelector || this.selector;
    if (!selector) return [];
    
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Find elements within a specific container
   */
  findElementsIn(container, selector) {
    if (!container || !selector) return [];
    return Array.from(container.querySelectorAll(selector));
  }

  /**
   * Find the closest parent element matching a selector
   */
  findParent(element, selector) {
    if (!element || !selector) return null;
    return element.closest(selector);
  }

  /**
   * Check if an element matches the component's selector
   */
  matchesSelector(element, customSelector = null) {
    if (!element) return false;
    const selector = customSelector || this.selector;
    return selector ? element.matches(selector) : false;
  }

  /**
   * Find a child element within the component's element
   */
  findChild(selector) {
    if (!this.element) return null;
    return this.element.querySelector(selector);
  }

  /**
   * Find multiple child elements within the component's element
   */
  findChildren(selector) {
    if (!this.element) return [];
    return Array.from(this.element.querySelectorAll(selector));
  }

  /**
   * Validate required elements exist
   */
  validateElements(elements = {}) {
    const missing = [];
    
    Object.entries(elements).forEach(([name, selector]) => {
      const element = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;
        
      if (!element) {
        missing.push(name);
      }
    });
    
    if (missing.length > 0) {
      log.warn(`${this.name}: Missing required elements:`, missing);
      return false;
    }
    
    return true;
  }

  // ============================================================================
  // EVENT UTILITIES
  // ============================================================================



  /**
   * 🚀 Enhanced event listener with robust cleanup for navigation scenarios
   * 
   * Benefits:
   * - Defensive cleanup (explicit + AbortController)
   * - Navigation-safe event binding
   * - Better memory management with explicit tracking
   * - Handles edge cases in static deployments
   * 
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options (passive, once, etc.)
   * @returns {Object} - Object with remove() method for manual cleanup
   */
  addEventListener(element, event, handler, options = {}) {
    if (!element || !event || !handler) return null;
    
    // Track listeners for defensive cleanup
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }
    
    // Create unique key for this listener
    const listenerKey = `${element.tagName}-${element.id || element.className}-${event}-${Date.now()}`;
    
    // Store listener info for explicit cleanup
    const listenerInfo = {
      element,
      event,
      handler,
      options: { ...options },
      signal: this.signal
    };
    
    // 🔧 DEFENSIVE CLEANUP: Remove any existing listeners on this element/event combo first
    this.removeExistingListeners(element, event);
    
    // Add the new listener with AbortController
    const passiveEvents = new Set(['scroll', 'wheel', 'mousewheel', 'touchstart', 'touchmove', 'touchend']);
    const finalOptions = {
      ...options,
      ...(options.passive === undefined && passiveEvents.has(event) ? { passive: true } : {}),
      signal: this.signal
    };
    element.addEventListener(event, handler, finalOptions);
    
    // Track for explicit cleanup if needed
    this.eventListeners.set(listenerKey, listenerInfo);
    
    // Mark element as having listeners from this component (only for DOM elements)
    if (element && element.dataset) {
      if (!element.dataset.componentListeners) {
        element.dataset.componentListeners = this.id;
      } else if (!element.dataset.componentListeners.includes(this.id)) {
        element.dataset.componentListeners += `,${this.id}`;
      }
    }
    
    return {
      remove: () => {
        this.removeSpecificListener(listenerKey);
      }
    };
  }

  /**
   * Remove existing listeners on element to prevent conflicts
   */
  removeExistingListeners(element, event) {
    if (!this.eventListeners) return;
    
    // Find and remove conflicting listeners
    for (const [key, listenerInfo] of this.eventListeners.entries()) {
      if (listenerInfo.element === element && listenerInfo.event === event) {
        this.removeSpecificListener(key);
      }
    }
  }

  /**
   * Remove a specific listener by key
   */
  removeSpecificListener(listenerKey) {
    if (!this.eventListeners || !this.eventListeners.has(listenerKey)) return;
    
    const listenerInfo = this.eventListeners.get(listenerKey);
    
    try {
      // Explicit removal (works even if AbortController was called)
      listenerInfo.element.removeEventListener(
        listenerInfo.event, 
        listenerInfo.handler, 
        listenerInfo.options
      );
    } catch (error) {
      log.trace(`Non-critical cleanup error for ${this.name}:`, error);
    }
    
    this.eventListeners.delete(listenerKey);
  }

  /**
   * Add multiple modern event listeners
   */
  addMultipleEventListeners(element, events, handler, options = {}) {
    if (!element || !events || !handler) return [];
    
    const eventList = Array.isArray(events) ? events : [events];
    return eventList.map(event => this.addEventListener(element, event, handler, options));
  }

  // ============================================================================
  // PERFORMANCE UTILITIES
  // ============================================================================

  /**
   * Throttle a function call
   */
  throttle(func, delay = 250) {
    let timeoutId;
    let lastExecTime = 0;
    
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Debounce a function call
   */
  debounce(func, delay = 250) {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ============================================================================
  // COMPONENT MANAGEMENT
  // ============================================================================

  /**
   * Register child component
   */
  addChild(name, component) {
    this.childComponents.set(name, component);
    return component;
  }

  /**
   * Get child component
   */
  getChild(name) {
    return this.childComponents.get(name);
  }

  /**
   * Update component options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.emit('options-updated', { options: this.options });
  }

  // ============================================================================
  // CSS INTEGRATION (PURE VANILLA JS)
  // ============================================================================

  /**
   * Set CSS custom property on the component element
   * Enables dynamic styling from JavaScript
   */
  setCSSProperty(property, value) {
    if (!this.element) return;
    
    const cssProperty = property.startsWith('--') ? property : `--component-${property}`;
    this.element.style.setProperty(cssProperty, value);
  }

  /**
   * Get CSS custom property value
   */
  getCSSProperty(property) {
    if (!this.element) return null;
    
    const cssProperty = property.startsWith('--') ? property : `--component-${property}`;
    return getComputedStyle(this.element).getPropertyValue(cssProperty).trim();
  }

  /**
   * Update component state for CSS :has() patterns
   * Leverages your existing :has() CSS automatically
   */
  updateComponentState(state) {
    if (!this.element) return;
    
    this.element.dataset.componentState = state;
    this.setCSSProperty('state', state);
    this.emit('state-changed', { state });
  }

  /**
   * Set component loading state with CSS
   */
  setLoadingState(isLoading) {
    this.updateComponentState(isLoading ? 'loading' : 'ready');
  }

  /**
   * Enable/disable component with CSS feedback
   */
  setEnabled(isEnabled) {
    this.updateComponentState(isEnabled ? 'ready' : 'disabled');
    if (this.element) {
      this.element.setAttribute('aria-disabled', (!isEnabled).toString());
    }
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Emit component-specific event
   */
  emit(event, data = null) {
    const eventName = `component:${this.name}:${event}`;
    return eventBus.emit(eventName, { ...data, component: this });
  }

  /**
   * Listen to component events
   */
  on(event, handler, context = null) {
    const eventName = event.includes(':') ? event : `component:${this.name}:${event}`;
    return eventBus.on(eventName, handler, { context });
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Set collapse state using the unified state system
   */
  setCollapseState(state) {
    const validStates = ['collapsed', 'expanded', 'transitioning'];
    if (!validStates.includes(state)) {
      log.warn(`Invalid collapse state "${state}" for component ${this.name}`);
      return this;
    }

    // Update data attribute for CSS
    if (this.element) {
      this.element.setAttribute('data-collapse-state', state);
      
      // Also update aria-expanded for accessibility
      if (state === 'expanded') {
        this.element.setAttribute('aria-expanded', 'true');
      } else if (state === 'collapsed') {
        this.element.setAttribute('aria-expanded', 'false');
      }
    }

    // Emit state change event
    this.emit('collapse-state-changed', { 
      previous: this.element?.getAttribute('data-collapse-state'),
      current: state 
    });

    return this;
  }

  /**
   * Set visibility state using the unified state system
   */
  setVisibilityState(state) {
    const validStates = ['hidden', 'visible', 'partial'];
    if (!validStates.includes(state)) {
      log.warn(`Invalid visibility state "${state}" for component ${this.name}`);
      return this;
    }

    if (this.element) {
      this.element.setAttribute('data-visibility-state', state);
    }

    this.emit('visibility-state-changed', { 
      previous: this.element?.getAttribute('data-visibility-state'),
      current: state 
    });

    return this;
  }

  /**
   * Expand a collapsible element with proper state management
   */
  async expand(options = {}) {
    const {
      showFirst = false,
      duration = 300
    } = options;

    this.setCollapseState('transitioning');

    if (showFirst) {
      this.setVisibilityState('visible');
      this.element?.offsetHeight;
    }

    return new Promise(resolve => {
      setTimeout(() => {
        this.setCollapseState('expanded');
        if (!showFirst) {
          this.setVisibilityState('visible');
        }
        resolve();
      }, 10);
    });
  }

  /**
   * Collapse a collapsible element with proper state management
   */
  async collapse(options = {}) {
    const {
      hideAfter = false,
      duration = null
    } = options;

    this.setCollapseState('transitioning');

    const animationDuration = duration || parseFloat(this.getCSSProperty('--collapse-timing') || '0.3') * 1000;

    return new Promise(resolve => {
      setTimeout(() => {
        this.setCollapseState('collapsed');
        if (hideAfter) {
          this.setVisibilityState('hidden');
        }
        resolve();
      }, animationDuration);
    });
  }

  /**
   * Toggle collapse state
   */
  async toggle(options = {}) {
    const isExpanded = this.element?.getAttribute('data-collapse-state') === 'expanded';
    
    if (isExpanded) {
      return this.collapse(options);
    } else {
      return this.expand(options);
    }
  }

  /**
   * Configure collapse behavior by setting CSS custom properties
   * This allows components to customize how component-states.css handles them
   */
  configureCollapseBehavior(config = {}) {
    const {
      heightCollapsed = '0',
      heightExpanded = 'none',
      opacityCollapsed = '1',
      opacityExpanded = '1',
      overflowCollapsed = 'hidden',
      overflowExpanded = 'visible',
      paddingCollapsed = '0',
      paddingExpanded = 'initial',
      timing = '0.3s',
      easing = 'ease',
      display = 'block'
    } = config;

    // Set CSS custom properties that component-states.css will use
    const properties = {
      '--collapse-height-collapsed': heightCollapsed,
      '--collapse-height-expanded': heightExpanded,
      '--collapse-opacity-collapsed': opacityCollapsed,
      '--collapse-opacity-expanded': opacityExpanded,
      '--collapse-overflow-collapsed': overflowCollapsed,
      '--collapse-overflow-expanded': overflowExpanded,
      '--collapse-padding-collapsed': paddingCollapsed,
      '--collapse-padding-expanded': paddingExpanded,
      '--collapse-timing': timing,
      '--collapse-easing': easing,
      '--component-display': display
    };

    Object.entries(properties).forEach(([property, value]) => {
      this.setCSSProperty(property, value);
    });

    return this;
  }

  /**
   * Check if component is ready
   */
  isReady() {
    return this.state === 'ready';
  }

  /**
   * Check if component has failed
   */
  hasFailed() {
    return this.state === 'failed';
  }

  /**
   * Enhanced health check for navigation scenarios
   * Override this method in subclasses to provide component-specific health checks
   */
  isHealthy() {
    // Basic health check
    if (this.state !== 'ready') return false;
    if (!this.element || !document.contains(this.element)) return false;
    
    // Check if event listeners are properly tracked
    if (this.eventListeners && this.eventListeners.size === 0) {
      log.debug(`Component ${this.id} has no tracked event listeners`);
      return false;
    }
    
    // Check if element still has listener tracking for this component
    if (this.element && this.element.dataset && this.element.dataset.componentListeners) {
      const componentIds = this.element.dataset.componentListeners.split(',');
      if (!componentIds.includes(this.id)) {
        log.debug(`Component ${this.id} not tracked on its DOM element`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      name: this.name,
      id: this.id,
      state: this.state,
      element: !!this.element,
      dependencies: this.dependencies.length,
      children: this.childComponents.size,
      options: this.options
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Handle destroy event
   */
  handleDestroy() {
    this.destroy();
  }

  /**
   * Cleanup component resources with enhanced navigation safety
   */
  destroy() {
    if (this.state === 'destroyed') return;
    
    log.debug(`Destroying component ${this.name} (${this.id})`);
    
    // 🔧 ENHANCED: Explicit cleanup of tracked listeners first
    this.cleanupExplicitListeners();
    
    // Cleanup event listeners (AbortController) - secondary safety net
    try {
      this.abortController.abort();
      log.trace(`Aborted all event listeners for ${this.name}`);
    } catch (error) {
      log.warn(`Failed to abort event listeners in ${this.name}:`, error);
    }
    
    // Destroy child components
    this.childComponents.forEach(child => {
      if (child && typeof child.destroy === 'function') {
        child.destroy();
      }
    });
    this.childComponents.clear();
    
    // Remove global event listener
    eventBus.off('component:destroy-all', this.handleDestroy);
    
    // Clean up DOM references and component tracking
    if (this.element) {
      this.element.removeAttribute('data-component');
      this.element.removeAttribute('data-component-id');
      
      // Clean up listener tracking
      if (this.element.dataset && this.element.dataset.componentListeners) {
        const listeners = this.element.dataset.componentListeners.split(',');
        const filteredListeners = listeners.filter(id => id !== this.id);
        if (filteredListeners.length > 0) {
          this.element.dataset.componentListeners = filteredListeners.join(',');
        } else {
          delete this.element.dataset.componentListeners;
        }
      }
    }
    
    this.state = 'destroyed';
    this.emit('destroyed');
    
    log.debug(`Component ${this.name} destroyed successfully`);
  }

  /**
   * Explicitly cleanup tracked event listeners
   */
  cleanupExplicitListeners() {
    if (!this.eventListeners) return;
    
    log.trace(`Cleaning up ${this.eventListeners.size} tracked listeners for ${this.name}`);
    
    for (const [key, listenerInfo] of this.eventListeners.entries()) {
      try {
        listenerInfo.element.removeEventListener(
          listenerInfo.event, 
          listenerInfo.handler, 
          listenerInfo.options
        );
      } catch (error) {
        log.trace(`Non-critical cleanup error for listener ${key}:`, error);
      }
    }
    
    this.eventListeners.clear();
  }
}

export default Component;