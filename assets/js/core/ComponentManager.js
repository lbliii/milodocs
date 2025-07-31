/**
 * ComponentManager - Base component system for MiloDocs
 * Provides standardized component lifecycle and management
 */

import { eventBus } from './EventBus.js';
import { $ } from '../utils/dom.js';

/**
 * Base Component class that all components should extend
 */
export class Component {
  constructor(config = {}) {
    this.name = config.name || this.constructor.name.toLowerCase();
    this.selector = config.selector;
    this.element = config.element || (config.selector ? $(config.selector) : null);
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
      console.warn(`Component ${this.name} already initialized`);
      return this;
    }

    try {
      this.state = 'initializing';
      
      // Check if element exists (for DOM-dependent components)
      if (this.selector && !this.element) {
        console.warn(`Element not found for selector: ${this.selector}`);
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
      
      console.log(`✅ Component ${this.name} initialized`);
      return this;
      
    } catch (error) {
      console.error(`❌ Component ${this.name} initialization failed:`, error);
      this.state = 'failed';
      return null;
    }
  }

  /**
   * Load component dependencies
   */
  async loadDependencies() {
    if (!this.dependencies.length) return;
    
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
   * Bind event listeners - override in subclasses
   */
  bindEvents() {
    // Default implementation - can be overridden
  }

  /**
   * Custom initialization hook - override in subclasses
   */
  async onInit() {
    // Override in subclasses for custom initialization
  }

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    const cleanup = () => element.removeEventListener(event, handler, options);
    this.eventListeners.add(cleanup);
    
    return cleanup;
  }

  /**
   * Remove specific event listener
   */
  removeEventListener(cleanup) {
    if (this.eventListeners.has(cleanup)) {
      cleanup();
      this.eventListeners.delete(cleanup);
    }
  }

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

  /**
   * Update component options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.emit('options-updated', { options: this.options });
  }

  /**
   * Get current state
   */
  getState() {
    return {
      name: this.name,
      id: this.id,
      state: this.state,
      hasElement: !!this.element,
      childCount: this.childComponents.size
    };
  }

  /**
   * Destroy component and cleanup
   */
  destroy() {
    if (this.state === 'destroyed') return;
    
    this.state = 'destroying';
    
    // Cleanup event listeners
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners.clear();
    
    // Destroy child components
    this.childComponents.forEach(child => {
      if (typeof child.destroy === 'function') {
        child.destroy();
      }
    });
    this.childComponents.clear();
    
    // Call custom cleanup
    this.onDestroy();
    
    // Remove from DOM if needed
    if (this.element && this.element.parentNode) {
      this.element.removeAttribute('data-component');
      this.element.removeAttribute('data-component-id');
    }
    
    // Cleanup global listeners
    eventBus.off('component:destroy-all', this.handleDestroy);
    
    this.state = 'destroyed';
    this.emit('destroyed');
    
    console.log(`🗑️ Component ${this.name} destroyed`);
  }

  /**
   * Custom destruction hook - override in subclasses
   */
  onDestroy() {
    // Override in subclasses for custom cleanup
  }

  /**
   * Handle global destroy event
   */
  handleDestroy() {
    this.destroy();
  }
}

/**
 * ComponentManager - Manages component registration and lifecycle
 */
export class ComponentManager {
  static components = new Map();
  static instances = new Map();
  static autoDiscovery = true;

  /**
   * Register a component class
   */
  static register(name, ComponentClass, options = {}) {
    this.components.set(name, { ComponentClass, options });
    console.log(`📝 Registered component: ${name}`);
  }

  /**
   * Create component instance
   */
  static create(name, config = {}) {
    const registration = this.components.get(name);
    if (!registration) {
      console.error(`Component "${name}" not registered`);
      return null;
    }

    const { ComponentClass, options } = registration;
    const mergedConfig = { ...options, ...config, name };
    
    try {
      const instance = new ComponentClass(mergedConfig);
      this.instances.set(instance.id, instance);
      return instance;
    } catch (error) {
      console.error(`Failed to create component "${name}":`, error);
      return null;
    }
  }

  /**
   * Load and initialize component
   */
  static async load(name, config = {}) {
    const instance = this.create(name, config);
    if (!instance) return null;
    
    return await instance.init();
  }

  /**
   * Auto-discover and load components on page
   */
  static async autoDiscover() {
    if (!this.autoDiscovery) return;
    
    const discoveredComponents = [];
    
    // Look for data-component attributes
    document.querySelectorAll('[data-component]').forEach(element => {
      const componentName = element.getAttribute('data-component');
      const componentId = element.getAttribute('data-component-id');
      
      // Skip if already initialized
      if (componentId && this.getInstance(componentId)) {
        return;
      }
      
      if (this.components.has(componentName)) {
        discoveredComponents.push({
          name: componentName,
          element,
          selector: null
        });
      }
    });
    
    // Load discovered components
    const loadPromises = discoveredComponents.map(({ name, element }) => {
      return this.load(name, { element });
    });
    
    const results = await Promise.allSettled(loadPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
    
    console.log(`🔍 Auto-discovered and loaded ${successful.length} components`);
    return successful;
  }

  /**
   * Get component instance by ID
   */
  static getInstance(id) {
    return this.instances.get(id);
  }

  /**
   * Get all instances of a component type
   */
  static getInstances(name) {
    return Array.from(this.instances.values()).filter(instance => instance.name === name);
  }

  /**
   * Get all active instances
   */
  static getAllInstances() {
    return Array.from(this.instances.values());
  }

  /**
   * Destroy component instance
   */
  static destroy(id) {
    const instance = this.instances.get(id);
    if (instance) {
      instance.destroy();
      this.instances.delete(id);
    }
  }

  /**
   * Destroy all instances
   */
  static destroyAll() {
    eventBus.emit('component:destroy-all');
    this.instances.clear();
  }

  /**
   * Get registered components
   */
  static getRegistered() {
    return Array.from(this.components.keys());
  }

  /**
   * Enable/disable auto-discovery
   */
  static setAutoDiscovery(enabled) {
    this.autoDiscovery = enabled;
  }
}