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
      
      // Enhanced duplicate detection with singleton awareness
      if (tempInstance.selector) {
        const existingInstance = this.findInstanceBySelector(name, tempInstance.selector);
        if (existingInstance) {
          const isSingleton = tempInstance.isSingleton || this.isSingletonSelector(tempInstance.selector);
          // Duplicate creations for singleton targets are expected during auto/re-active discovery.
          // Reduce noise by logging at debug for singletons; warn for true multi-instance conflicts only.
          const logLevel = isSingleton ? 'debug' : 'warn';
          
          log[logLevel](`Component "${name}" instance already exists for selector "${tempInstance.selector}". Returning existing instance.`);
          return existingInstance;
        }
        
        // Check for DOM element conflicts (regardless of component name)
        const elementConflict = this.findInstanceByElement(tempInstance.selector);
        if (elementConflict && (tempInstance.isSingleton || this.isSingletonSelector(tempInstance.selector))) {
          log.warn(`Singleton element "${tempInstance.selector}" already managed by component "${elementConflict.name}". Returning existing instance.`);
          return elementConflict;
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
    // If not registered yet, try lazy-importing via the component loader
    if (!this.components.has(name)) {
      try {
        const componentsIndex = await import('../components/index.js');
        if (typeof componentsIndex.loadComponent === 'function') {
          return componentsIndex.loadComponent(name, config);
        }
      } catch (e) {
        // Reduce noise when components simply aren't present on the page
        log.debug(`Deferred load failed or component not present for: ${name}`);
        return null;
      }
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
   * Find an existing instance by DOM element selector (regardless of component name)
   */
  static findInstanceByElement(selector) {
    return Array.from(this.instances.values()).find(instance => 
      instance.selector === selector &&
      instance.state !== 'failed'
    );
  }

  /**
   * Determine if a selector should be treated as singleton (one instance per DOM element)
   */
  static isSingletonSelector(selector) {
    if (!selector) return false;
    
    // ID selectors are always singleton
    if (selector.startsWith('#')) return true;
    
    // Specific singleton selectors for this app
    const singletonSelectors = [
      'body',
      'html',
      'head',
      '[data-component="navigation-topbar"]',
      '[data-component="navigation-sidebar-left"]',
      '[data-component="performance-optimizer"]'
    ];
    
    return singletonSelectors.includes(selector);
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
   * Re-initialize components after page restoration from cache
   * This method specifically handles the case where the page was restored
   * from browser cache and components may not be working properly
   */
  static reinitializeAfterCacheRestore() {
    log.info('Reinitializing components after cache restoration...');
    
    // Find all failed or broken component instances
    const brokenInstances = Array.from(this.instances.values()).filter(instance => {
      // Check if the component's DOM element still exists and is functional
      if (!instance.element || !document.contains(instance.element)) {
        log.debug(`Component ${instance.id} element no longer exists`);
        return true; // Element doesn't exist anymore
      }
      
      // Check if component is in a failed state
      if (instance.state === 'failed' || instance.state === 'destroyed') {
        log.debug(`Component ${instance.id} is in failed/destroyed state`);
        return true;
      }
      
      // Enhanced detection for specific component types
      if (instance.name === 'navigation-sidebar-left') {
        // Check if sidebar functionality is working
        if (this.isSidebarBroken(instance)) {
          log.debug(`Sidebar component ${instance.id} appears broken`);
          return true;
        }
      }
      
      // Generic check for any component that might have lost its event listeners
      if (this.hasLostEventListeners(instance)) {
        log.debug(`Component ${instance.id} appears to have lost event listeners`);
        return true;
      }
      
      return false;
    });
    
    // Also look for DOM elements that should have components but don't
    const missingComponents = this.findMissingComponents();
    
    // Destroy broken instances
    brokenInstances.forEach(instance => {
      log.debug(`Destroying broken component instance: ${instance.id}`);
      this.destroy(instance.id);
    });
    
    // Re-discover and load components
    this.discoverAndLoadComponents();
    
    const totalFixed = brokenInstances.length + missingComponents;
    log.info(`Reinitialized ${brokenInstances.length} broken components, found ${missingComponents} missing components`);
    
    return totalFixed;
  }

  /**
   * Check if sidebar component is broken
   */
  static isSidebarBroken(instance) {
    try {
      const toggles = instance.element.querySelectorAll('.sidebar-item__toggle');
      if (toggles.length === 0) return false;
      
      // Test if click handler exists
      const firstToggle = toggles[0];
      
      // Check if the toggle has the expected event listeners
      // Note: We can't directly check addEventListener, but we can test if the component has its toggles array
      if (instance.toggles && instance.toggles.length === 0) {
        return true;
      }
      
      // Check if the element has proper aria attributes that would indicate it's initialized
      if (!firstToggle.hasAttribute('aria-expanded')) {
        return true;
      }
      
      return false;
    } catch (error) {
      log.warn(`Error checking sidebar component ${instance.id}:`, error);
      return true;
    }
  }

  /**
   * Check if component has lost its event listeners (enhanced detection)
   */
  static hasLostEventListeners(instance) {
    try {
      // If the component has specific methods to check its state, use them
      if (typeof instance.isHealthy === 'function') {
        return !instance.isHealthy();
      }
      
      // 🔧 ENHANCED: Check for tracked event listeners
      if (instance.eventListeners && instance.eventListeners.size === 0) {
        log.debug(`Component ${instance.id} has no tracked event listeners`);
        return true;
      }
      
      // 🔧 ENHANCED: For sidebar components, verify critical functionality
      if (instance.name === 'navigation-sidebar-left') {
        return this.isSidebarListenersBroken(instance);
      }
      
      // 🔧 ENHANCED: Check DOM element listener tracking
      if (instance.element && instance.element.dataset.componentListeners) {
        const componentIds = instance.element.dataset.componentListeners.split(',');
        if (!componentIds.includes(instance.id)) {
          log.debug(`Component ${instance.id} not tracked on its DOM element`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      log.debug(`Error checking event listeners for ${instance.id}:`, error);
      return true;
    }
  }

  /**
   * Enhanced sidebar listener health check
   */
  static isSidebarListenersBroken(instance) {
    try {
      if (!instance.element || !instance.toggles) {
        return true;
      }
      
      // Check if toggles have proper event listener tracking
      for (const toggle of instance.toggles) {
        if (!toggle.dataset.componentListeners || 
            !toggle.dataset.componentListeners.includes(instance.id)) {
          log.debug(`Sidebar toggle missing listener tracking from ${instance.id}`);
          return true;
        }
      }
      
      // Check if eventListeners map has entries for toggles
      if (instance.eventListeners) {
        const toggleClickListeners = Array.from(instance.eventListeners.values())
          .filter(listener => listener.event === 'click' && 
                            instance.toggles.includes(listener.element));
        
        if (toggleClickListeners.length !== instance.toggles.length) {
          log.debug(`Sidebar has ${toggleClickListeners.length} click listeners but ${instance.toggles.length} toggles`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      log.debug(`Error checking sidebar listeners for ${instance.id}:`, error);
      return true;
    }
  }

  /**
   * Find DOM elements that should have components but don't
   */
  static findMissingComponents() {
    const elementsWithComponents = document.querySelectorAll('[data-component]');
    let missingCount = 0;
    
    elementsWithComponents.forEach(element => {
      const componentName = element.getAttribute('data-component');
      if (componentName && this.components.has(componentName)) {
        // Check if this element has a component instance
        const hasInstance = Array.from(this.instances.values()).some(instance => 
          instance.element === element && instance.name === componentName
        );
        
        if (!hasInstance) {
          missingCount++;
          log.debug(`Found element without component instance: ${componentName}`);
        }
      }
    });
    
    return missingCount;
  }

  /**
   * Discover and load components from DOM with enhanced cleanup
   */
  static discoverAndLoadComponents() {
    this.cleanupOrphanedListeners();
    
    const elementsWithComponents = document.querySelectorAll('[data-component]');
    const discoveredComponents = new Set();

    elementsWithComponents.forEach(element => {
      const componentName = element.getAttribute('data-component');
      if (!componentName) return;
      discoveredComponents.add(componentName);
    });

    if (discoveredComponents.size > 0) {
      log.info(`Discovered ${discoveredComponents.size} components: [${Array.from(discoveredComponents).join(', ')}]`);
    }

    // Load discovered components lazily (will import on demand)
    Array.from(discoveredComponents).forEach(componentName => {
      this.load(componentName);
    });

    log.info(`Auto-discovered and loaded ${discoveredComponents.size} components`);
  }

  /**
   * Clean up orphaned event listener tracking from destroyed components
   */
  static cleanupOrphanedListeners() {
    const elementsWithListeners = document.querySelectorAll('[data-component-listeners]');
    let cleanedCount = 0;
    
    elementsWithListeners.forEach(element => {
      const listenerIds = element.dataset.componentListeners.split(',');
      const validIds = listenerIds.filter(componentId => {
        const instance = this.instances.get(componentId);
        return instance && instance.state !== 'destroyed';
      });
      
      if (validIds.length !== listenerIds.length) {
        cleanedCount++;
        if (validIds.length > 0) {
          element.dataset.componentListeners = validIds.join(',');
        } else {
          delete element.dataset.componentListeners;
        }
      }
    });
    
    if (cleanedCount > 0) {
      log.info(`Cleaned up orphaned listeners from ${cleanedCount} elements`);
    }
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
            if (componentName && 
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
        
        if (componentName && 
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
    // Use a filtered list from the instances map values
    return Array.from(this.instances.values()).filter(instance => instance.name === componentName);
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