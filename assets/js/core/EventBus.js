/**
 * EventBus - Central event management system
 * Provides pub/sub functionality for component communication
 * Enhanced with modern structuredClone for safe data handling
 */
import { logger } from '../utils/Logger.js';
import { deepClone } from '../utils/FeatureDetection.js';

export class EventBus {
  constructor() {
    this.events = new Map();
    this.globalListeners = new Set();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} options - Event options
   */
  on(event, callback, options = {}) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    const listener = {
      callback,
      once: options.once || false,
      context: options.context || null
    };
    
    this.events.get(event).add(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event once
   */
  once(event, callback, context = null) {
    return this.on(event, callback, { once: true, context });
  }

  /**
   * Unsubscribe from an event
   */
  off(event, listenerOrCallback) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    
    if (typeof listenerOrCallback === 'function') {
      // Find listener by callback
      for (const listener of listeners) {
        if (listener.callback === listenerOrCallback) {
          listeners.delete(listener);
          break;
        }
      }
    } else {
      // Direct listener object
      listeners.delete(listenerOrCallback);
    }
    
    if (listeners.size === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event with enhanced data safety
   * 🚀 Uses structuredClone to prevent accidental data mutations
   */
  emit(event, data = null, options = {}) {
    if (!this.events.has(event)) return;
    
    const { 
      clone = true,        // Whether to clone data for safety
      async = false,       // Whether to emit asynchronously  
      maxListeners = 100   // Safety limit for listeners
    } = options;
    
    const listeners = Array.from(this.events.get(event));
    
    // Safety check for runaway event listeners
    if (listeners.length > maxListeners) {
      logger.warn('EventBus', `Event "${event}" has ${listeners.length} listeners (max: ${maxListeners})`);
    }
    
    // 🚀 Clone data to prevent mutations between listeners
    // Skip cloning if data contains DOM elements (they should be passed by reference)
    const shouldClone = clone && data && typeof data === 'object' && !this.containsDOMElements(data);
    const safeData = shouldClone ? deepClone(data) : data;
    
    const executeListeners = () => {
      const results = [];
      
      for (const listener of listeners) {
        try {
          // Give each listener independent data copy if cloning enabled
          // Only clone if we successfully cloned the initial data
          const listenerData = shouldClone ? deepClone(safeData) : safeData;
          
          const result = listener.context 
            ? listener.callback.call(listener.context, listenerData, event)
            : listener.callback(listenerData, event);
          
          results.push(result);
          
          // Remove once listeners
          if (listener.once) {
            this.events.get(event).delete(listener);
          }
        } catch (error) {
          logger.error('EventBus', `Error in event listener for "${event}":`, error);
        }
      }
      
      return results;
    };
    
    // Global event logging for trace mode only
    if (clone && !shouldClone) {
      logger.event(event, 'data (DOM elements preserved, not cloned)');
    } else {
      logger.event(event, shouldClone ? 'data (cloned)' : data);
    }
    
    // Execute synchronously or asynchronously
    if (async) {
      // Use microtask for async emission
      return Promise.resolve().then(executeListeners);
    } else {
      return executeListeners();
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  clear(event = null) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get list of all events
   */
  getEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }

  /**
   * 🚀 Emit event without cloning (for performance-critical cases)
   */
  emitFast(event, data = null) {
    return this.emit(event, data, { clone: false });
  }

  /**
   * 🚀 Emit event asynchronously (non-blocking)
   */
  emitAsync(event, data = null, options = {}) {
    return this.emit(event, data, { ...options, async: true });
  }

  /**
   * 🚀 Emit event with large data safely (optimized for large objects)
   */
  emitSafe(event, data = null, options = {}) {
    return this.emit(event, data, { ...options, clone: true });
  }

  /**
   * Check if data contains DOM elements that shouldn't be cloned
   */
  containsDOMElements(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Direct DOM element
    if (data instanceof Element || data instanceof Node) return true;
    
    // Check object properties for DOM elements
    return Object.values(data).some(value => {
      if (value instanceof Element || value instanceof Node) return true;
      if (typeof value === 'object' && value !== null) {
        return this.containsDOMElements(value); // Recursive check
      }
      return false;
    });
  }

  /**
   * Performance statistics for debugging
   */
  getStats() {
    const stats = {
      totalEvents: this.events.size,
      totalListeners: 0,
      eventBreakdown: {}
    };

    for (const [event, listeners] of this.events) {
      const count = listeners.size;
      stats.totalListeners += count;
      stats.eventBreakdown[event] = count;
    }

    return stats;
  }
}

// Create global instance
export const eventBus = new EventBus();