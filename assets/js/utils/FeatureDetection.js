/**
 * Modern Feature Detection & Progressive Enhancement
 * Detects cutting-edge browser APIs and provides safe fallbacks
 */

import { logger } from './Logger.js';

const log = logger.component('FeatureDetection');

/**
 * Comprehensive feature detection for modern vanilla JS APIs
 */
export const modernFeatures = {
  // Observer APIs
  intersectionObserver: 'IntersectionObserver' in window,
  mutationObserver: 'MutationObserver' in window,
  resizeObserver: 'ResizeObserver' in window,
  performanceObserver: 'PerformanceObserver' in window,
  
  // Performance APIs
  requestIdleCallback: 'requestIdleCallback' in window,
  requestAnimationFrame: 'requestAnimationFrame' in window,
  
  // Modern JS APIs
  structuredClone: 'structuredClone' in window,
  
  // CSS Features
  cssHas: (() => {
    try {
      return CSS.supports('selector(:has(p))');
    } catch {
      return false;
    }
  })(),
  
  // Form APIs
  elementInternals: 'ElementInternals' in window,
  customElements: 'customElements' in window,
  
  // Experimental APIs
  navigationAPI: 'navigation' in window,
  
  // Performance Features
  memory: 'memory' in performance,
  
  // Touch/Interaction
  touchEvents: 'ontouchstart' in window,
  pointerEvents: 'PointerEvent' in window,
};

/**
 * Execute modern implementation with automatic fallback
 * @param {string} feature - Feature name from modernFeatures
 * @param {Function} modernImpl - Modern implementation function
 * @param {Function} fallback - Fallback implementation function
 * @returns {*} Result from modern or fallback implementation
 */
export function withFallback(feature, modernImpl, fallback) {
  if (modernFeatures[feature]) {
    try {
      log.trace(`Using modern ${feature} implementation`);
      return modernImpl();
    } catch (error) {
      log.warn(`Modern ${feature} failed, falling back:`, error);
      return fallback();
    }
  } else {
    log.debug(`${feature} not supported, using fallback`);
    return fallback();
  }
}

/**
 * Enhanced requestIdleCallback with timeout and fallback
 * @param {Function} callback - Function to execute during idle time
 * @param {Object} options - Options including timeout
 * @returns {number} Request ID for cancellation
 */
export function requestIdleTime(callback, options = {}) {
  const { timeout = 5000, priority = 'normal' } = options;
  
  return withFallback(
    'requestIdleCallback',
    () => {
      log.trace('Scheduling task for idle time');
      return requestIdleCallback(callback, { timeout });
    },
    () => {
      // Fallback for Safari and older browsers
      const delay = priority === 'high' ? 16 : priority === 'low' ? 100 : 50;
      log.trace(`Fallback: scheduling with ${delay}ms delay`);
      return setTimeout(callback, delay);
    }
  );
}

/**
 * Enhanced structured clone with fallback and DOM element handling
 * @param {*} obj - Object to clone
 * @returns {*} Deep clone of the object
 */
export function deepClone(obj) {
  // Handle primitives and null/undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Explicitly avoid cloning AbortController/AbortSignal which are not cloneable
  if (typeof AbortController !== 'undefined' && obj instanceof AbortController) {
    return obj;
  }
  if (typeof AbortSignal !== 'undefined' && obj instanceof AbortSignal) {
    return obj;
  }

  // Handle DOM elements - don't clone them, just return reference
  if (obj instanceof Element || obj instanceof Node) {
    log.trace('Preserving DOM element reference instead of cloning');
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle RegExp objects
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // Handle objects with potential DOM elements
  if (typeof obj === 'object') {
    // Check if object contains DOM elements
    const hasDOMElements = Object.values(obj).some(value => 
      value instanceof Element || value instanceof Node
    );

    if (hasDOMElements) {
      // Smart clone: clone primitive values, preserve DOM element references
      const cloned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Element || value instanceof Node) {
          cloned[key] = value; // Preserve DOM element reference
        } else {
          cloned[key] = deepClone(value); // Recursively clone other values
        }
      }
      return cloned;
    }

    // Try modern structuredClone for complex objects without DOM elements
      return withFallback(
      'structuredClone',
      () => {
        try {
          return structuredClone(obj);
        } catch (error) {
          log.trace('structuredClone failed, using manual clone:', error.message);
          throw error;
        }
      },
      () => {
        // Manual deep clone fallback
        try {
          // First try JSON (fast but limited)
          return JSON.parse(JSON.stringify(obj));
        } catch {
          // Manual object cloning for complex cases
          const cloned = {};
          for (const [key, value] of Object.entries(obj)) {
            cloned[key] = deepClone(value);
          }
          return cloned;
        }
      }
    );
  }

  return obj;
}

/**
 * Log feature support status - useful for debugging
 */
export function logFeatureSupport() {
  const supported = Object.entries(modernFeatures)
    .filter(([_, isSupported]) => isSupported)
    .map(([feature]) => feature);
    
  const unsupported = Object.entries(modernFeatures)
    .filter(([_, isSupported]) => !isSupported)
    .map(([feature]) => feature);
  
  log.info(`Modern features supported: ${supported.length}/${Object.keys(modernFeatures).length}`);
  log.debug('Supported:', supported);
  
  if (unsupported.length > 0) {
    log.debug('Using fallbacks for:', unsupported);
  }
  
  return { supported, unsupported };
}

/**
 * Initialize feature detection logging
 */
export function initFeatureDetection() {
  // Log on startup in debug mode
  if (window.location.hostname === 'localhost' || 
      new URLSearchParams(window.location.search).has('debug')) {
    logFeatureSupport();
  }
}