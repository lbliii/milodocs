/**
 * FilterPersistence Component
 * Handles saving and loading filter state to/from localStorage
 */

import { Component } from '../../../core/Component.js';
import { localStorage } from '../../../utils/index.js';

export class FilterPersistence extends Component {
  constructor(config = {}) {
    super({
      name: 'filter-persistence',
      selector: config.selector || '.endpoint-filter',
      ...config
    });
  }

  /**
   * Save current filters to storage
   */
  static saveFilters(currentFilters, namespace = 'endpoint-filter') {
    try {
      localStorage.set(`${namespace}.filters`, {
        filters: currentFilters,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to save endpoint filters:', error);
    }
  }

  /**
   * Load saved filters from storage
   */
  static loadSavedFilters(namespace = 'endpoint-filter') {
    try {
      const stored = localStorage.get(`${namespace}.filters`);
      if (stored) {
        return stored.filters;
      }
    } catch (error) {
      console.warn('Failed to load endpoint filters:', error);
    }
    return null;
  }

  /**
   * Apply loaded filters with callbacks
   */
  static applySavedFilters(savedFilters, callbacks, searchInput) {
    if (!savedFilters) return;

    // Apply filters with a slight delay to ensure UI is ready
    setTimeout(() => {
      if (savedFilters.tag !== 'all') {
        callbacks.onTagFilter(savedFilters.tag);
      }
      if (savedFilters.method !== 'all') {
        callbacks.onMethodFilter(savedFilters.method);
      }
      if (savedFilters.search) {
        if (searchInput) {
          searchInput.value = savedFilters.search;
        }
        callbacks.onSearch(savedFilters.search);
      }
      if (savedFilters.status !== 'all') {
        callbacks.onStatusFilter(savedFilters.status);
      }
    }, 100);
  }

  /**
   * Clear saved filters
   */
  static clearSavedFilters(namespace = 'endpoint-filter') {
    try {
      localStorage.remove(`${namespace}.filters`);
    } catch (error) {
      console.warn('Failed to clear saved filters:', error);
    }
  }

  /**
   * Save filter history for undo/redo functionality
   */
  static saveFilterHistory(currentFilters, namespace = 'endpoint-filter', maxHistory = 10) {
    try {
      const history = FilterPersistence.getFilterHistory(namespace);
      
      // Add current filters to history
      history.push({
        filters: { ...currentFilters },
        timestamp: Date.now()
      });

      // Keep only the last N entries
      if (history.length > maxHistory) {
        history.splice(0, history.length - maxHistory);
      }

      localStorage.set(`${namespace}.history`, history);
    } catch (error) {
      console.warn('Failed to save filter history:', error);
    }
  }

  /**
   * Get filter history
   */
  static getFilterHistory(namespace = 'endpoint-filter') {
    try {
      return localStorage.get(`${namespace}.history`) || [];
    } catch (error) {
      console.warn('Failed to get filter history:', error);
      return [];
    }
  }

  /**
   * Get previous filter state for undo
   */
  static getPreviousFilterState(namespace = 'endpoint-filter') {
    const history = FilterPersistence.getFilterHistory(namespace);
    if (history.length >= 2) {
      return history[history.length - 2].filters;
    }
    return null;
  }

  /**
   * Clear filter history
   */
  static clearFilterHistory(namespace = 'endpoint-filter') {
    try {
      localStorage.remove(`${namespace}.history`);
    } catch (error) {
      console.warn('Failed to clear filter history:', error);
    }
  }

  /**
   * Save user preferences
   */
  static saveUserPreferences(preferences, namespace = 'endpoint-filter') {
    try {
      localStorage.set(`${namespace}.preferences`, {
        preferences,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  static loadUserPreferences(namespace = 'endpoint-filter') {
    try {
      const stored = localStorage.get(`${namespace}.preferences`);
      if (stored) {
        return stored.preferences;
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    return null;
  }

  /**
   * Save filter analytics data
   */
  static saveFilterAnalytics(analyticsData, namespace = 'endpoint-filter') {
    try {
      const existing = localStorage.get(`${namespace}.analytics`) || [];
      existing.push({
        ...analyticsData,
        timestamp: Date.now()
      });

      // Keep only recent analytics (last 100 entries)
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.set(`${namespace}.analytics`, existing);
    } catch (error) {
      console.warn('Failed to save filter analytics:', error);
    }
  }

  /**
   * Get filter analytics data
   */
  static getFilterAnalytics(namespace = 'endpoint-filter') {
    try {
      return localStorage.get(`${namespace}.analytics`) || [];
    } catch (error) {
      console.warn('Failed to get filter analytics:', error);
      return [];
    }
  }

  /**
   * Export all saved data
   */
  static exportFilterData(namespace = 'endpoint-filter') {
    try {
      return {
        filters: localStorage.get(`${namespace}.filters`),
        history: localStorage.get(`${namespace}.history`),
        preferences: localStorage.get(`${namespace}.preferences`),
        analytics: localStorage.get(`${namespace}.analytics`),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to export filter data:', error);
      return null;
    }
  }

  /**
   * Import filter data
   */
  static importFilterData(data, namespace = 'endpoint-filter') {
    try {
      if (data.filters) {
        localStorage.set(`${namespace}.filters`, data.filters);
      }
      if (data.history) {
        localStorage.set(`${namespace}.history`, data.history);
      }
      if (data.preferences) {
        localStorage.set(`${namespace}.preferences`, data.preferences);
      }
      if (data.analytics) {
        localStorage.set(`${namespace}.analytics`, data.analytics);
      }
      return true;
    } catch (error) {
      console.warn('Failed to import filter data:', error);
      return false;
    }
  }

  /**
   * Clear all saved data
   */
  static clearAllSavedData(namespace = 'endpoint-filter') {
    try {
      localStorage.remove(`${namespace}.filters`);
      localStorage.remove(`${namespace}.history`);
      localStorage.remove(`${namespace}.preferences`);
      localStorage.remove(`${namespace}.analytics`);
    } catch (error) {
      console.warn('Failed to clear all saved data:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(namespace = 'endpoint-filter') {
    try {
      const filters = localStorage.get(`${namespace}.filters`);
      const history = localStorage.get(`${namespace}.history`);
      const preferences = localStorage.get(`${namespace}.preferences`);
      const analytics = localStorage.get(`${namespace}.analytics`);

      return {
        hasFilters: !!filters,
        historyEntries: history?.length || 0,
        hasPreferences: !!preferences,
        analyticsEntries: analytics?.length || 0,
        lastSaved: filters?.timestamp ? new Date(filters.timestamp) : null
      };
    } catch (error) {
      console.warn('Failed to get storage stats:', error);
      return null;
    }
  }

  /**
   * Validate stored data integrity
   */
  static validateStoredData(namespace = 'endpoint-filter') {
    const issues = [];

    try {
      // Validate filters
      const filters = localStorage.get(`${namespace}.filters`);
      if (filters && (!filters.filters || !filters.timestamp)) {
        issues.push('Invalid filters data structure');
      }

      // Validate history
      const history = localStorage.get(`${namespace}.history`);
      if (history && !Array.isArray(history)) {
        issues.push('Invalid history data structure');
      }

      // Validate preferences
      const preferences = localStorage.get(`${namespace}.preferences`);
      if (preferences && (!preferences.preferences || !preferences.timestamp)) {
        issues.push('Invalid preferences data structure');
      }

      // Validate analytics
      const analytics = localStorage.get(`${namespace}.analytics`);
      if (analytics && !Array.isArray(analytics)) {
        issues.push('Invalid analytics data structure');
      }

    } catch (error) {
      issues.push(`Storage validation error: ${error.message}`);
    }

    return issues;
  }

  /**
   * Cleanup old data
   */
  static cleanupOldData(namespace = 'endpoint-filter', maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const now = Date.now();

      // Clean up old history entries
      const history = localStorage.get(`${namespace}.history`) || [];
      const recentHistory = history.filter(entry => 
        now - entry.timestamp < maxAge
      );
      if (recentHistory.length !== history.length) {
        localStorage.set(`${namespace}.history`, recentHistory);
      }

      // Clean up old analytics entries
      const analytics = localStorage.get(`${namespace}.analytics`) || [];
      const recentAnalytics = analytics.filter(entry => 
        now - entry.timestamp < maxAge
      );
      if (recentAnalytics.length !== analytics.length) {
        localStorage.set(`${namespace}.analytics`, recentAnalytics);
      }

    } catch (error) {
      console.warn('Failed to cleanup old data:', error);
    }
  }
}

// Auto-register component
import ComponentManager from '../../../core/ComponentManager.js';
ComponentManager.register('filter-persistence', FilterPersistence);