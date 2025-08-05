/**
 * ComponentManager - Component lifecycle and registry management
 * Handles component registration, instantiation, and discovery
 */

import { Component } from './Component.js';
import { eventBus } from './EventBus.js';
import { $ } from '../utils/dom.js';
import { logger } from '../utils/Logger.js';
import { modernFeatures, requestIdleTime } from '../utils/FeatureDetection.js';
import { waitForDOM, waitForElement, isElementVisible, scrollToElement } from './utils/DOMUtils.js';

const log = logger.component('ComponentManager');

/**
 * ComponentManager - Singleton for managing component lifecycle
 */
class ComponentManager {
  static components = new Map();
  static instances = new Map();
  static autoDiscovery = true;
  static reactiveObserver = null;
  static isReactiveEnabled = false;
  static lastActivity = Date.now();

  /**
   * Register a component class
   */
  static register(name, ComponentClass, options = {}) {
    if (this.components.has(name)) {
      log.warn(`Component "${name}" is already registered. Overwriting...`);
    }

    this.components.set(name, {
      ComponentClass,
      options: {
        autoInit: true,
        lazy: false,
        ...options
      }
    });

    log.debug(`Registered component: ${name}`);
    
    // Don't trigger auto-discovery immediately to prevent infinite loops
    // Auto-discovery will run from the main initialization process
  }

  /**
   * Create and initialize a component instance
   */
  static async create(name, config = {}) {
    const componentData = this.components.get(name);
    if (!componentData) {
      log.error(`Component "${name}" not registered`);
      return null;
    }

    try {
      const { ComponentClass } = componentData;
      
      // Create temporary instance to get selector info
      const tempInstance = new ComponentClass({
        name,
        ...componentData.options,
        ...config
      });
      
      // Check for duplicate instances targeting the same DOM element
      if (tempInstance.selector) {
        const existingInstance = this.findInstanceBySelector(name, tempInstance.selector);
        if (existingInstance) {
          log.warn(`Component "${name}" instance already exists for selector "${tempInstance.selector}". Returning existing instance.`);
          return existingInstance;
        }
      }
      
      // Use the temp instance as our actual instance
      const instance = tempInstance;

      // Store instance reference
      this.instances.set(instance.id, instance);

      // Initialize the component
      const result = await instance.init();
      
      if (result) {
        log.debug(`Component ${name} initialized`);
        eventBus.emit('component:created', { name, instance });
        this.lastActivity = Date.now();
      }

      return result;
    } catch (error) {
      log.error(`Failed to create instance for: ${name}`, error);
      
      return null;
    }
  }

  /**
   * Load a component (register if needed, then create instance)
   */
  static async load(name, config = {}) {
    // Check if already registered
    if (!this.components.has(name)) {
      log.warn(`Component "${name}" not registered`);
      return null;
    }

    return this.create(name, config);
  }

  /**
   * Get component instance by ID
   */
  static getInstance(id) {
    return this.instances.get(id);
  }

  /**
   * Get all instances of a component by name
   */
  static getInstancesByName(name) {
    return Array.from(this.instances.values()).filter(instance => instance.name === name);
  }

  /**
   * Find an existing instance by component name and selector
   */
  static findInstanceBySelector(name, selector) {
    return Array.from(this.instances.values()).find(instance => 
      instance.name === name && 
      instance.selector === selector &&
      instance.state !== 'failed'
    );
  }

  /**
   * Destroy a component instance
   */
  static destroy(id) {
    const instance = this.instances.get(id);
    if (instance) {
      instance.destroy();
      this.instances.delete(id);
      log.debug(`Destroyed component instance: ${id}`);
    }
  }

  /**
   * Destroy all instances of a component
   */
  static destroyByName(name) {
    const instances = this.getInstancesByName(name);
    instances.forEach(instance => this.destroy(instance.id));
  }

  /**
   * Destroy all component instances
   */
  static destroyAll() {
    log.info('Destroying all component instances');
    eventBus.emit('component:destroy-all');
    
    this.instances.forEach((instance, id) => {
      try {
        instance.destroy();
      } catch (error) {
        log.warn(`Error destroying component ${id}:`, error);
      }
    });
    
    this.instances.clear();
  }

  /**
   * Auto-discover components in the DOM
   */
  static autoDiscover() {
    if (!this.autoDiscovery) return;

    // Use requestIdleCallback to avoid blocking the main thread
    requestIdleTime(() => {
      this.discoverAndLoadComponents();
    }, { priority: 'low' });
  }

  /**
   * Discover and load components from DOM
   */
  static discoverAndLoadComponents() {
    const elementsWithComponents = document.querySelectorAll('[data-component]');
    const discoveredComponents = new Set();

    elementsWithComponents.forEach(element => {
      const componentName = element.getAttribute('data-component');
      if (componentName && this.components.has(componentName)) {
        discoveredComponents.add(componentName);
      }
    });

    if (discoveredComponents.size > 0) {
      log.info(`Discovered ${discoveredComponents.size} components: [${Array.from(discoveredComponents).join(', ')}]`);
    }

    // Load discovered components
    Array.from(discoveredComponents).forEach(componentName => {
      this.load(componentName);
    });

    log.info(`Auto-discovered and loaded ${discoveredComponents.size} components`);
  }

  /**
   * Enable reactive DOM discovery
   */
  static enableReactiveDiscovery() {
    if (!window.MutationObserver) {
      log.warn('MutationObserver not supported, reactive discovery disabled');
      return false;
    }

    if (this.isReactiveEnabled) {
      log.debug('Reactive discovery already enabled');
      return true;
    }

    log.info('🚀 Enabling reactive DOM discovery...');

    this.reactiveObserver = new MutationObserver((mutations) => {
      // Use requestIdleCallback to avoid blocking the main thread
      requestIdleTime(() => {
        this.handleDOMMutations(mutations);
      }, { priority: 'low' });
    });

    // Observe all DOM changes
    this.reactiveObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-component', 'data-component-id']
    });

    this.isReactiveEnabled = true;
    
    // Emit event for other components
    eventBus.emit('component-manager:reactive-enabled');
    
    log.info('✅ Reactive DOM discovery enabled');
    return true;
  }

  /**
   * Handle DOM mutations for reactive enhancement
   */
  static handleDOMMutations(mutations) {
    const enhancedElements = new Set();
    let newComponentCount = 0;

    // Throttle mutation handling to prevent infinite loops
    const now = Date.now();
    if (now - this.lastActivity < 500) {
      return; // Skip if too recent - increased to 500ms
    }

    mutations.forEach(mutation => {
      // Handle added nodes
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if the node itself has a component
            const componentName = node.getAttribute?.('data-component');
            if (componentName && this.components.has(componentName) && 
                !node.hasAttribute('data-component-id') && 
                !node.hasAttribute('data-component-processing')) {
              enhancedElements.add(node);
              newComponentCount++;
            }

            // Check descendants for components
            const descendants = node.querySelectorAll?.('[data-component]:not([data-component-id]):not([data-component-processing])');
            descendants?.forEach(descendant => {
              const descendantComponent = descendant.getAttribute('data-component');
              if (descendantComponent && this.components.has(descendantComponent)) {
                enhancedElements.add(descendant);
                newComponentCount++;
              }
            });
          }
        });
      }

      // Handle attribute changes
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-component') {
        const element = mutation.target;
        const componentName = element.getAttribute('data-component');
        
        if (componentName && this.components.has(componentName) && 
            !element.hasAttribute('data-component-id') && 
            !element.hasAttribute('data-component-processing')) {
          enhancedElements.add(element);
          newComponentCount++;
        }
      }
    });

    if (newComponentCount > 0) {
      log.info(`Reactively enhanced ${newComponentCount} new components`);
      
      // Load new components
      enhancedElements.forEach(element => {
        const componentName = element.getAttribute('data-component');
        // Mark as processing immediately to prevent re-processing
        element.setAttribute('data-component-processing', 'true');
        this.load(componentName, { element }).then(() => {
          element.removeAttribute('data-component-processing');
        });
      });

      this.lastActivity = Date.now();
    }

    return true;
  }

  /**
   * Disable reactive discovery and cleanup
   */
  static disableReactiveDiscovery() {
    if (this.reactiveObserver) {
      this.reactiveObserver.disconnect();
      this.reactiveObserver = null;
    }
    
    this.isReactiveEnabled = false;
    eventBus.emit('component-manager:reactive-disabled');
    log.info('Reactive DOM discovery disabled');
  }

  /**
   * Get component statistics for debugging
   */
  static getStats() {
    return {
      registered: this.components.size,
      instances: this.instances.size,
      reactive: this.isReactiveEnabled,
      lastActivity: this.lastActivity
    };
  }

  /**
   * Enable/disable auto-discovery
   */
  static setAutoDiscovery(enabled) {
    this.autoDiscovery = enabled;
    log.info(`Auto-discovery ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled) {
      this.autoDiscover();
    }
  }

  /**
   * Check if a component is registered
   */
  static isRegistered(name) {
    return this.components.has(name);
  }

  /**
   * Get list of registered component names
   */
  static getRegisteredNames() {
    return Array.from(this.components.keys());
  }

  /**
   * Get component instances by name
   */
  static getInstances(componentName) {
    if (!this.instances.has(componentName)) {
      return [];
    }
    return this.instances.get(componentName);
  }

  /**
   * Utility methods re-exported for convenience
   */
  static waitForDOM = waitForDOM;
  static waitForElement = waitForElement;
  static isElementVisible = isElementVisible;
  static scrollToElement = scrollToElement;
}


export { Component, ComponentManager };
export default ComponentManager;