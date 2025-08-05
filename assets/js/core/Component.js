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
    this.eventListeners = new Set();
    this.childComponents = new Map();
    
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
   * Safely add event listener with automatic cleanup
   */
  addEventListenerSafe(element, event, handler, options = {}) {
    if (!element || !event || !handler) return null;
    
    const cleanup = () => {
      element.removeEventListener(event, handler, options);
    };
    
    element.addEventListener(event, handler, options);
    this.eventListeners.add(cleanup);
    
    return cleanup;
  }

  /**
   * Add multiple event listeners to an element
   */
  addEventListeners(element, events, handler, options = {}) {
    if (!element || !events || !handler) return [];
    
    const cleanups = [];
    const eventList = Array.isArray(events) ? events : [events];
    
    eventList.forEach(event => {
      const cleanup = this.addEventListenerSafe(element, event, handler, options);
      if (cleanup) cleanups.push(cleanup);
    });
    
    return cleanups;
  }

  /**
   * Remove event listener
   */
  removeEventListener(cleanup) {
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
      this.eventListeners.delete(cleanup);
    }
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
   * Cleanup component resources
   */
  destroy() {
    if (this.state === 'destroyed') return;
    
    // Cleanup event listeners
    this.eventListeners.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        log.warn(`Failed to cleanup event listener in ${this.name}:`, error);
      }
    });
    this.eventListeners.clear();
    
    // Destroy child components
    this.childComponents.forEach(child => {
      if (child && typeof child.destroy === 'function') {
        child.destroy();
      }
    });
    this.childComponents.clear();
    
    // Remove global event listener
    eventBus.off('component:destroy-all', this.handleDestroy);
    
    // Clean up DOM references
    if (this.element) {
      this.element.removeAttribute('data-component');
      this.element.removeAttribute('data-component-id');
    }
    
    this.state = 'destroyed';
    this.emit('destroyed');
    
    log.debug(`Component ${this.name} destroyed`);
  }
}

export default Component;