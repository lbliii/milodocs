/**
 * MixinBase - Shared utilities for creating consistent mixins
 * NOT a base class - these are helper functions for mixin creation
 */

import { logger } from '../utils/Logger.js';

/**
 * Mixin creation utilities - shared patterns across all mixins
 */
export const MixinUtilities = {
  
  /**
   * Create a standardized mixin initialization function
   * @param {string} mixinName - Name of the mixin for logging
   * @param {Object} defaultOptions - Default configuration options
   * @param {Function} setupFunction - Function to call after options are set
   * @returns {Function} Standardized init function
   */
  createInitFunction(mixinName, defaultOptions, setupFunction) {
    return function(options = {}) {
      const log = logger.component(mixinName);
      
      // Derive conventional options property name: ExpandableMixin -> expandableOptions
      const baseName = mixinName.endsWith('Mixin') ? mixinName.slice(0, -5) : mixinName;
      const canonical = baseName.charAt(0).toLowerCase() + baseName.slice(1);
      const optionsProperty = `${canonical}Options`;
      
      // Merge options with defaults
      this[optionsProperty] = {
        ...defaultOptions,
        ...options
      };
      
      // Call the setup function with context
      if (typeof setupFunction === 'function') {
        setupFunction.call(this);
      }
      
      log.debug(`${mixinName} initialized for ${this.name || 'component'}`);
    };
  },

  /**
   * Create a standardized element setup function
   * @param {Object} selectors - Map of element names to selectors
   * @returns {Function} Element setup function
   */
  createElementSetup(selectors) {
    return function() {
      if (!this.element) return;
      
      Object.entries(selectors).forEach(([name, selector]) => {
        if (Array.isArray(selector)) {
          // Multiple elements
          this[name] = Array.from(this.element.querySelectorAll(selector[0]));
        } else {
          // Single element
          this[name] = this.element.querySelector(selector);
        }
      });
    };
  },

  /**
   * Create a standardized event setup function with automatic cleanup
   * @param {Object} eventMap - Map of elements to event handlers
   * @returns {Function} Event setup function
   */
  createEventSetup(eventMap) {
    return function() {
      Object.entries(eventMap).forEach(([elementName, events]) => {
        const elements = Array.isArray(this[elementName]) ? this[elementName] : [this[elementName]];
        
        elements.forEach(element => {
          if (!element) return;
          
          Object.entries(events).forEach(([eventType, handler]) => {
            this.addEventListener(element, eventType, handler.bind(this));
          });
        });
      });
    };
  },

  /**
   * Create a standardized health check function
   * @param {Function[]} checks - Array of health check functions
   * @returns {Function} Health check function
   */
  createHealthCheck(checks) {
    return function() {
      return checks.every(check => check.call(this));
    };
  },

  /**
   * Create a standardized cleanup function
   * @param {Function} customCleanup - Optional custom cleanup function
   * @returns {Function} Cleanup function
   */
  createCleanup(customCleanup) {
    return function() {
      // Call custom cleanup if provided
      if (typeof customCleanup === 'function') {
        customCleanup.call(this);
      }
      
      // Standard cleanup patterns can go here
      // (Most cleanup is handled by Component base class)
    };
  }
};

/**
 * Common mixin patterns and templates
 */
export const MixinPatterns = {
  
  /**
   * State management pattern for mixins
   * @param {string} stateName - Name of the state property
   * @param {*} initialValue - Initial state value
   * @returns {Object} State management functions
   */
  createState(stateName, initialValue) {
    const getterName = `get${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
    const setterName = `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
    
    return {
      [getterName]() {
        return this[`_${stateName}`] || initialValue;
      },
      
      [setterName](value) {
        const oldValue = this[`_${stateName}`];
        this[`_${stateName}`] = value;
        
        // Emit state change event if component supports it
        if (this.emit) {
          this.emit(`${stateName}-changed`, { oldValue, newValue: value });
        }
      }
    };
  },

  /**
   * Options validation pattern
   * @param {Object} schema - Options schema for validation
   * @returns {Function} Validation function
   */
  createOptionsValidator(schema) {
    return function(options) {
      const errors = [];
      
      Object.entries(schema).forEach(([key, config]) => {
        const value = options[key];
        
        if (config.required && value === undefined) {
          errors.push(`Required option '${key}' is missing`);
        }
        
        if (value !== undefined && config.type && typeof value !== config.type) {
          errors.push(`Option '${key}' must be of type ${config.type}, got ${typeof value}`);
        }
        
        if (config.validate && !config.validate(value)) {
          errors.push(`Option '${key}' failed validation`);
        }
      });
      
      if (errors.length > 0) {
        throw new Error(`Options validation failed: ${errors.join(', ')}`);
      }
      
      return true;
    };
  },

  /**
   * Event delegation pattern for mixins
   * @param {string} containerSelector - Container element selector
   * @param {Object} delegationMap - Map of selectors to handlers
   * @returns {Object} Delegation setup functions
   */
  createEventDelegation(containerSelector, delegationMap) {
    return {
      setupDelegation() {
        const container = this.element.querySelector(containerSelector) || this.element;
        
        Object.entries(delegationMap).forEach(([selector, handler]) => {
          this.addEventListener(container, 'click', (e) => {
            const target = e.target.closest(selector);
            if (target) {
              handler.call(this, e, target);
            }
          });
        });
      }
    };
  }
};

/**
 * Mixin composition helper - combine multiple mixin utilities
 * @param {Object[]} utilities - Array of utility objects to combine
 * @returns {Object} Combined utility object
 */
export function combineMixinUtilities(...utilities) {
  return Object.assign({}, ...utilities);
}

/**
 * Validate mixin interface - ensure mixin follows conventions
 * @param {Object} mixin - Mixin object to validate
 * @param {Object} requirements - Required properties/methods
 * @returns {boolean} Whether mixin is valid
 */
export function validateMixinInterface(mixin, requirements = {}) {
  const log = logger.component('MixinValidator');
  
  // Check for required methods
  if (requirements.methods) {
    const missing = requirements.methods.filter(method => !(method in mixin));
    if (missing.length > 0) {
      log.error(`Mixin missing required methods: ${missing.join(', ')}`);
      return false;
    }
  }
  
  // Check for init function naming convention
  const initMethods = Object.keys(mixin).filter(key => key.startsWith('init'));
  if (initMethods.length === 0) {
    log.warn('Mixin does not follow init* naming convention');
  }
  
  // Check for health check method
  const healthMethods = Object.keys(mixin).filter(key => key.includes('Health'));
  if (healthMethods.length === 0) {
    log.warn('Mixin does not provide health check method');
  }
  
  return true;
}
