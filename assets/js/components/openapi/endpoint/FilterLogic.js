/**
 * FilterLogic Component
 * Handles core filtering algorithms and visibility logic
 */

import { Component } from '../../../core/ComponentManager.js';

export class FilterLogic extends Component {
  constructor(config = {}) {
    super({
      name: 'filter-logic',
      selector: config.selector || '.endpoint-filter',
      ...config
    });
  }

  /**
   * Apply all active filters to endpoints
   */
  static applyFilters(endpoints, currentFilters, emit) {
    let visibleCount = 0;
    
    endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      let isVisible = true;
      
      // Apply tag filter
      if (currentFilters.tag !== 'all') {
        isVisible = isVisible && data.tags.includes(currentFilters.tag);
      }
      
      // Apply method filter
      if (currentFilters.method !== 'all') {
        isVisible = isVisible && data.method === currentFilters.method;
      }
      
      // Apply search filter
      if (currentFilters.search) {
        const searchText = currentFilters.search;
        const searchableText = `${data.path} ${data.summary} ${data.tags.join(' ')}`.toLowerCase();
        isVisible = isVisible && searchableText.includes(searchText);
      }
      
      // Apply status filter (deprecated, etc.)
      if (currentFilters.status === 'deprecated') {
        isVisible = isVisible && data.deprecated;
      } else if (currentFilters.status === 'active') {
        isVisible = isVisible && !data.deprecated;
      }
      
      // Update endpoint data
      data.visible = isVisible;
      
      if (isVisible) visibleCount++;
    });
    
    // Emit filter results
    emit('filters-applied', {
      filters: { ...currentFilters },
      visibleCount,
      totalCount: endpoints.length
    });
    
    return visibleCount;
  }

  /**
   * Filter endpoints by tag
   */
  static filterByTag(tag, currentFilters, updateActiveFilterButton, applyFilters, saveFilters, emit) {
    currentFilters.tag = tag;
    updateActiveFilterButton('.tag-filter', 'data-tag', tag);
    const visibleCount = applyFilters();
    saveFilters();
    
    emit('tag-filter-changed', { tag, activeFilters: { ...currentFilters } });
    return visibleCount;
  }

  /**
   * Filter endpoints by HTTP method
   */
  static filterByMethod(method, currentFilters, updateActiveFilterButton, applyFilters, saveFilters, emit) {
    currentFilters.method = method;
    updateActiveFilterButton('.method-filter', 'data-method', method);
    const visibleCount = applyFilters();
    saveFilters();
    
    emit('method-filter-changed', { method, activeFilters: { ...currentFilters } });
    return visibleCount;
  }

  /**
   * Search endpoints by text
   */
  static searchEndpoints(query, currentFilters, applyFilters, saveFilters, emit) {
    currentFilters.search = query.toLowerCase().trim();
    const visibleCount = applyFilters();
    saveFilters();
    
    emit('search-changed', { query, activeFilters: { ...currentFilters } });
    return visibleCount;
  }

  /**
   * Clear all active filters
   */
  static clearAllFilters(currentFilters, updateActiveFilterButton, searchInput, applyFilters, saveFilters, emit) {
    // Reset filter state
    currentFilters.tag = 'all';
    currentFilters.method = 'all';
    currentFilters.status = 'all';
    currentFilters.search = '';
    
    // Reset UI
    updateActiveFilterButton('.tag-filter', 'data-tag', 'all');
    updateActiveFilterButton('.method-filter', 'data-method', 'all');
    
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Apply cleared filters
    const visibleCount = applyFilters();
    saveFilters();
    
    emit('filters-cleared');
    return visibleCount;
  }

  /**
   * Check if any filters are active
   */
  static hasActiveFilters(currentFilters) {
    return currentFilters.tag !== 'all' || 
           currentFilters.method !== 'all' || 
           currentFilters.search || 
           currentFilters.status !== 'all';
  }

  /**
   * Get filtered endpoints
   */
  static getFilteredEndpoints(endpoints, currentFilters) {
    return endpoints.filter(endpoint => {
      const data = endpoint._filterData;
      if (!data) return false;
      
      // Apply tag filter
      if (currentFilters.tag !== 'all' && !data.tags.includes(currentFilters.tag)) {
        return false;
      }
      
      // Apply method filter
      if (currentFilters.method !== 'all' && data.method !== currentFilters.method) {
        return false;
      }
      
      // Apply search filter
      if (currentFilters.search) {
        const searchText = currentFilters.search;
        const searchableText = `${data.path} ${data.summary} ${data.tags.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchText)) {
          return false;
        }
      }
      
      // Apply status filter
      if (currentFilters.status === 'deprecated' && !data.deprecated) {
        return false;
      } else if (currentFilters.status === 'active' && data.deprecated) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get visible endpoints count
   */
  static getVisibleCount(endpoints) {
    return endpoints.filter(endpoint => {
      const data = endpoint._filterData;
      return data && data.visible;
    }).length;
  }

  /**
   * Get filter statistics
   */
  static getFilterStats(endpoints, currentFilters, filterStats) {
    const visibleCount = FilterLogic.getVisibleCount(endpoints);
    
    return {
      totalEndpoints: endpoints.length,
      visibleEndpoints: visibleCount,
      hiddenEndpoints: endpoints.length - visibleCount,
      activeFilters: { ...currentFilters },
      filterStats: Object.fromEntries(filterStats),
      hasActiveFilters: FilterLogic.hasActiveFilters(currentFilters)
    };
  }

  /**
   * Validate filter criteria
   */
  static validateFilters(currentFilters, availableTags, availableMethods) {
    const issues = [];
    
    // Validate tag filter
    if (currentFilters.tag !== 'all' && !availableTags.includes(currentFilters.tag)) {
      issues.push(`Invalid tag filter: ${currentFilters.tag}`);
    }
    
    // Validate method filter
    if (currentFilters.method !== 'all' && !availableMethods.includes(currentFilters.method)) {
      issues.push(`Invalid method filter: ${currentFilters.method}`);
    }
    
    // Validate status filter
    const validStatuses = ['all', 'deprecated', 'active'];
    if (!validStatuses.includes(currentFilters.status)) {
      issues.push(`Invalid status filter: ${currentFilters.status}`);
    }
    
    return issues;
  }

  /**
   * Create filter summary
   */
  static createFilterSummary(currentFilters, visibleCount, totalCount) {
    const activeFilters = [];
    
    if (currentFilters.tag !== 'all') {
      activeFilters.push(`Tag: ${currentFilters.tag}`);
    }
    
    if (currentFilters.method !== 'all') {
      activeFilters.push(`Method: ${currentFilters.method}`);
    }
    
    if (currentFilters.search) {
      activeFilters.push(`Search: "${currentFilters.search}"`);
    }
    
    if (currentFilters.status !== 'all') {
      activeFilters.push(`Status: ${currentFilters.status}`);
    }
    
    return {
      activeFilters,
      summary: activeFilters.length > 0 
        ? `Showing ${visibleCount} of ${totalCount} endpoints (${activeFilters.join(', ')})`
        : `Showing all ${totalCount} endpoints`,
      hasFilters: activeFilters.length > 0
    };
  }

  /**
   * Apply single filter type
   */
  static applySingleFilter(endpoints, filterType, filterValue) {
    return endpoints.filter(endpoint => {
      const data = endpoint._filterData;
      if (!data) return false;
      
      switch (filterType) {
        case 'tag':
          return filterValue === 'all' || data.tags.includes(filterValue);
        case 'method':
          return filterValue === 'all' || data.method === filterValue;
        case 'status':
          if (filterValue === 'deprecated') return data.deprecated;
          if (filterValue === 'active') return !data.deprecated;
          return true;
        case 'search':
          if (!filterValue) return true;
          const searchableText = `${data.path} ${data.summary} ${data.tags.join(' ')}`.toLowerCase();
          return searchableText.includes(filterValue.toLowerCase());
        default:
          return true;
      }
    });
  }

  /**
   * Get available filter values
   */
  static getAvailableFilterValues(endpoints) {
    const tags = new Set();
    const methods = new Set();
    const statuses = new Set(['all', 'active', 'deprecated']);
    
    endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      if (!data) return;
      
      data.tags.forEach(tag => tags.add(tag));
      methods.add(data.method);
    });
    
    return {
      tags: ['all', ...Array.from(tags).sort()],
      methods: ['all', ...Array.from(methods).sort()],
      statuses: Array.from(statuses)
    };
  }

  /**
   * Reset filter state
   */
  static resetFilterState() {
    return {
      tag: 'all',
      method: 'all',
      status: 'all',
      search: ''
    };
  }

  /**
   * Clone filter state
   */
  static cloneFilterState(currentFilters) {
    return { ...currentFilters };
  }

  /**
   * Compare filter states
   */
  static compareFilterStates(filters1, filters2) {
    return filters1.tag === filters2.tag &&
           filters1.method === filters2.method &&
           filters1.status === filters2.status &&
           filters1.search === filters2.search;
  }
}

// Auto-register component
import { ComponentManager } from '../../../core/ComponentManager.js';
ComponentManager.register('filter-logic', FilterLogic);