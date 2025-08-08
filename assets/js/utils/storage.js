/**
 * Storage utilities - Safe localStorage/sessionStorage access
 * Extracted from layout-theme.js and other files
 */
import { logger } from './Logger.js';

// In-memory fallback storage
let inMemoryStorage = new Map();

/**
 * Check if localStorage is available and writable
 */
function isStorageAvailable(type = 'localStorage') {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safe storage wrapper with fallback
 */
class SafeStorage {
  constructor(type = 'localStorage') {
    this.storageType = type;
    this.isAvailable = isStorageAvailable(type);
    this.storage = this.isAvailable ? window[type] : null;
  }

  get(key, fallback = null) {
    try {
      if (this.isAvailable) {
        const value = this.storage.getItem(key);
        if (value === null) return fallback;
        
        // Try to parse JSON, return string if parsing fails
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } else {
        return inMemoryStorage.has(key) ? inMemoryStorage.get(key) : fallback;
      }
    } catch (error) {
      logger.warn('Storage', `Storage get error for key "${key}":`, error);
      return fallback;
    }
  }

  set(key, value) {
    try {
      if (this.isAvailable) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        this.storage.setItem(key, serialized);
        return true;
      } else {
        inMemoryStorage.set(key, value);
        return true;
      }
    } catch (error) {
      logger.warn('Storage', `Storage set error for key "${key}":`, error);
      return false;
    }
  }

  remove(key) {
    try {
      if (this.isAvailable) {
        this.storage.removeItem(key);
      } else {
        inMemoryStorage.delete(key);
      }
      return true;
    } catch (error) {
      logger.warn('Storage', `Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  clear() {
    try {
      if (this.isAvailable) {
        this.storage.clear();
      } else {
        inMemoryStorage.clear();
      }
      return true;
    } catch (error) {
      logger.warn('Storage', 'Storage clear error:', error);
      return false;
    }
  }

  keys() {
    try {
      if (this.isAvailable) {
        return Object.keys(this.storage);
      } else {
        return Array.from(inMemoryStorage.keys());
      }
    } catch (error) {
      logger.warn('Storage', 'Storage keys error:', error);
      return [];
    }
  }

  has(key) {
    if (this.isAvailable) {
      return this.storage.getItem(key) !== null;
    } else {
      return inMemoryStorage.has(key);
    }
  }
}

// Export storage instances
export const localStorage = new SafeStorage('localStorage');
export const sessionStorage = new SafeStorage('sessionStorage');



// Utility functions
export function createNamespacedStorage(namespace) {
  return {
    get(key, fallback) {
      return localStorage.get(`${namespace}.${key}`, fallback);
    },
    set(key, value) {
      return localStorage.set(`${namespace}.${key}`, value);
    },
    remove(key) {
      return localStorage.remove(`${namespace}.${key}`);
    },
    clear() {
      const keys = localStorage.keys().filter(k => k.startsWith(`${namespace}.`));
      keys.forEach(key => localStorage.remove(key));
    }
  };
}