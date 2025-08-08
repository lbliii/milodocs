/**
 * MixinManager - Utility for safely applying mixins without conflicts
 * Provides conflict detection and resolution for component mixins
 */

import { logger } from '../utils/Logger.js';

const log = logger.component('MixinManager');

/**
 * Safely apply mixins to a component class with conflict detection
 */
export class MixinManager {
  
  /**
   * Apply mixins to a component class with conflict detection
   * @param {Function} ComponentClass - The component class to extend
   * @param {Object[]} mixins - Array of mixin objects to apply
   * @param {Object} options - Configuration options
   * @returns {Function} The extended component class
   */
  static applyMixins(ComponentClass, mixins, options = {}) {
    const config = {
      prefix: '', // Prefix for mixin methods to avoid conflicts
      allowOverride: false, // Whether to allow mixins to override existing methods
      detectConflicts: true, // Whether to detect and warn about conflicts
      skipConflicts: false, // Whether to skip conflicting methods
      ...options
    };
    
    const conflicts = [];
    const applied = [];
    
    mixins.forEach(mixin => {
      const mixinName = mixin.constructor?.name || 'UnnamedMixin';
      
      Object.getOwnPropertyNames(mixin).forEach(prop => {
        if (prop === 'constructor') return;
        
        const descriptor = Object.getOwnPropertyDescriptor(mixin, prop);
        if (!descriptor) return;
        
        const targetProp = config.prefix ? `${config.prefix}${prop}` : prop;
        const existingDescriptor = Object.getOwnPropertyDescriptor(ComponentClass.prototype, targetProp);
        
        if (existingDescriptor && config.detectConflicts) {
          const conflict = {
            property: prop,
            targetProperty: targetProp,
            mixin: mixinName,
            existing: true
          };
          
          conflicts.push(conflict);
          
          if (config.skipConflicts) {
            log.warn(`Skipping conflicting method ${targetProp} from ${mixinName}`);
            return;
          }
          
          if (!config.allowOverride) {
            log.warn(`Method conflict detected: ${targetProp} (${mixinName} vs existing)`);
          }
        }
        
        // Apply the property
        Object.defineProperty(ComponentClass.prototype, targetProp, descriptor);
        applied.push({ property: targetProp, mixin: mixinName });
      });
    });
    
    if (conflicts.length > 0) {
      log.info(`Applied ${applied.length} methods with ${conflicts.length} conflicts detected`);
    } else {
      log.debug(`Applied ${applied.length} methods from ${mixins.length} mixins without conflicts`);
    }
    
    return ComponentClass;
  }
  
  /**
   * Create a safe mixin application function for a specific set of mixins
   * @param {Object[]} mixins - Mixins to create applicator for
   * @param {Object} defaultOptions - Default options for mixin application
   * @returns {Function} Mixin application function
   */
  static createApplicator(mixins, defaultOptions = {}) {
    return (ComponentClass, options = {}) => {
      return this.applyMixins(ComponentClass, mixins, { ...defaultOptions, ...options });
    };
  }
  
  /**
   * Check for potential conflicts between a component and mixins
   * @param {Function} ComponentClass - Component class to check
   * @param {Object[]} mixins - Mixins to check against
   * @returns {Object[]} Array of potential conflicts
   */
  static checkConflicts(ComponentClass, mixins) {
    const conflicts = [];
    const existingMethods = Object.getOwnPropertyNames(ComponentClass.prototype);
    
    mixins.forEach(mixin => {
      const mixinName = mixin.constructor?.name || 'UnnamedMixin';
      const mixinMethods = Object.getOwnPropertyNames(mixin);
      
      mixinMethods.forEach(method => {
        if (method === 'constructor') return;
        
        if (existingMethods.includes(method)) {
          conflicts.push({
            method,
            mixin: mixinName,
            component: ComponentClass.name
          });
        }
      });
    });
    
    return conflicts;
  }
}

/**
 * Convenient mixin application functions for common combinations
 */
export const MixinApplicators = {
  
  /**
   * Apply navigation-related mixins (expandable + responsive + current page detection)
   */
  navigation: async (ComponentClass, options = {}) => {
    const { ExpandableMixin, ResponsiveMixin } = await import('../components/index.js');
    return MixinManager.applyMixins(ComponentClass, [ExpandableMixin, ResponsiveMixin], {
      detectConflicts: true,
      skipConflicts: false,
      ...options
    });
  },
  
  /**
   * Apply sidebar-related mixins (all navigation mixins)
   */
  sidebar: (ComponentClass, options = {}) => {
    return MixinApplicators.navigation(ComponentClass, options);
  },
  
  /**
   * Apply content-related mixins (expandable + scroll tracking)
   */
  content: async (ComponentClass, options = {}) => {
    const { ExpandableMixin, ScrollTrackingMixin } = await import('../components/index.js');
    return MixinManager.applyMixins(ComponentClass, [ExpandableMixin, ScrollTrackingMixin], {
      detectConflicts: true,
      skipConflicts: false,
      ...options
    });
  },
  
  /**
   * Apply modal-related mixins (modal + responsive)
   */
  modal: async (ComponentClass, options = {}) => {
    const { ModalMixin, ResponsiveMixin } = await import('../components/index.js');
    return MixinManager.applyMixins(ComponentClass, [ModalMixin, ResponsiveMixin], {
      detectConflicts: true,
      skipConflicts: false,
      ...options
    });
  }
};

/**
 * Decorator function for easy mixin application
 * @param {string|Object[]} mixins - Mixin names or array of mixin objects
 * @param {Object} options - Configuration options
 */
export function withMixins(mixins, options = {}) {
  return function(ComponentClass) {
    if (typeof mixins === 'string' && MixinApplicators[mixins]) {
      return MixinApplicators[mixins](ComponentClass, options);
    }
    
    if (Array.isArray(mixins)) {
      return MixinManager.applyMixins(ComponentClass, mixins, options);
    }
    
    throw new Error(`Invalid mixins specification: ${mixins}`);
  };
}
