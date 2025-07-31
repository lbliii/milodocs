/**
 * EventBus - Central event management system
 * Provides pub/sub functionality for component communication
 */
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
   * Emit an event
   */
  emit(event, data = null, options = {}) {
    if (!this.events.has(event)) return;
    
    const listeners = Array.from(this.events.get(event));
    const results = [];
    
    for (const listener of listeners) {
      try {
        const result = listener.context 
          ? listener.callback.call(listener.context, data, event)
          : listener.callback(data, event);
        
        results.push(result);
        
        // Remove once listeners
        if (listener.once) {
          this.events.get(event).delete(listener);
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
    
    // Global event logging for debug mode
    if (window.HugoEnvironment?.debug) {
      console.log(`📡 Event: ${event}`, data);
    }
    
    return results;
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
}

// Create global instance
export const eventBus = new EventBus();