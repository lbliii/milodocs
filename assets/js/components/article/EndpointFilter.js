/**
 * Endpoint Filter Component
 * Handles filtering of API endpoints by tags and other criteria
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { $$, $ } from '../../utils/index.js';

export class EndpointFilter extends Component {
  constructor(config = {}) {
    super({
      name: 'endpoint-filter',
      selector: config.selector || '[data-component="endpoint-filter"]',
      ...config
    });
    
    this.currentFilters = {
      tag: 'all',
      method: 'all',
      status: 'all'
    };
    
    this.endpoints = [];
    this.filterStats = new Map();
    
    this.options = {
      animateFiltering: true,
      showStats: true,
      storeFilters: true,
      namespace: 'endpoint-filter',
      ...this.options
    };
  }

  /**
   * Setup filter elements and endpoints
   */
  setupElements() {
    super.setupElements();
    
    // Find all filterable endpoints
    this.endpoints = $$('.endpoint-item');
    
    if (this.endpoints.length === 0) {
      console.log('No filterable endpoints found');
      return;
    }
    
    // Setup filter buttons
    this.tagFilters = $$('.tag-filter');
    this.methodFilters = $$('.method-filter');
    this.statusFilters = $$('.status-filter');
    
    // Setup search input if present
    this.searchInput = $('.endpoint-search');
    
    // Initialize endpoint data
    this.initializeEndpointData();
    
    // Build filter statistics
    this.buildFilterStats();
    
    // Load saved filters
    if (this.options.storeFilters) {
      this.loadSavedFilters();
    }
    
    console.log(`Initialized endpoint filter with ${this.endpoints.length} endpoints`);
  }

  /**
   * Initialize data for each endpoint
   */
  initializeEndpointData() {
    this.endpoints.forEach(endpoint => {
      const data = {
        element: endpoint,
        id: endpoint.id || this.generateEndpointId(endpoint),
        tags: this.extractTags(endpoint),
        method: this.extractMethod(endpoint),
        path: this.extractPath(endpoint),
        summary: this.extractSummary(endpoint),
        deprecated: this.isDeprecated(endpoint),
        visible: true
      };
      
      // Store data on element for quick access
      endpoint._filterData = data;
    });
  }

  /**
   * Generate a unique ID for an endpoint
   */
  generateEndpointId(endpoint) {
    const method = this.extractMethod(endpoint);
    const path = this.extractPath(endpoint);
    return `${method}-${path}`.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  }

  /**
   * Extract tags from endpoint element
   */
  extractTags(endpoint) {
    const tags = [];
    const tagElements = endpoint.querySelectorAll('.endpoint-tag');
    tagElements.forEach(tag => {
      const tagText = tag.textContent.trim().toLowerCase();
      if (tagText) tags.push(tagText);
    });
    return tags;
  }

  /**
   * Extract HTTP method from endpoint
   */
  extractMethod(endpoint) {
    const methodElement = endpoint.querySelector('.http-method');
    if (methodElement) {
      return methodElement.textContent.trim().toUpperCase();
    }
    return endpoint.getAttribute('data-method') || 'UNKNOWN';
  }

  /**
   * Extract path from endpoint
   */
  extractPath(endpoint) {
    const pathElement = endpoint.querySelector('.endpoint-path');
    if (pathElement) {
      return pathElement.textContent.trim();
    }
    return endpoint.getAttribute('data-path') || '/';
  }

  /**
   * Extract summary from endpoint
   */
  extractSummary(endpoint) {
    const summaryElement = endpoint.querySelector('.endpoint-summary');
    return summaryElement ? summaryElement.textContent.trim() : '';
  }

  /**
   * Check if endpoint is deprecated
   */
  isDeprecated(endpoint) {
    return endpoint.querySelector('.deprecated-badge') !== null;
  }

  /**
   * Build statistics for filter options
   */
  buildFilterStats() {
    const tagCounts = new Map();
    const methodCounts = new Map();
    
    this.endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      
      // Count tags
      data.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      
      // Count methods
      methodCounts.set(data.method, (methodCounts.get(data.method) || 0) + 1);
    });
    
    this.filterStats.set('tags', tagCounts);
    this.filterStats.set('methods', methodCounts);
    
    // Update filter button labels with counts if option is enabled
    if (this.options.showStats) {
      this.updateFilterButtonStats();
    }
  }

  /**
   * Update filter button labels with statistics
   */
  updateFilterButtonStats() {
    // Update tag filter stats
    this.tagFilters.forEach(button => {
      const tag = button.getAttribute('data-tag');
      if (tag && tag !== 'all') {
        const count = this.filterStats.get('tags').get(tag) || 0;
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
      }
    });
    
    // Update method filter stats
    this.methodFilters.forEach(button => {
      const method = button.getAttribute('data-method');
      if (method && method !== 'all') {
        const count = this.filterStats.get('methods').get(method) || 0;
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
      }
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tag filter clicks
    this.tagFilters.forEach(button => {
      this.addEventListener(button, 'click', (e) => {
        e.preventDefault();
        const tag = button.getAttribute('data-tag');
        this.filterByTag(tag);
      });
    });
    
    // Method filter clicks
    this.methodFilters.forEach(button => {
      this.addEventListener(button, 'click', (e) => {
        e.preventDefault();
        const method = button.getAttribute('data-method');
        this.filterByMethod(method);
      });
    });
    
    // Search input
    if (this.searchInput) {
      this.addEventListener(this.searchInput, 'input', (e) => {
        this.searchEndpoints(e.target.value);
      });
      
      // Clear search button
      const clearButton = $('.search-clear');
      if (clearButton) {
        this.addEventListener(clearButton, 'click', () => {
          this.searchInput.value = '';
          this.searchEndpoints('');
        });
      }
    }
    
    // Clear all filters button
    const clearAllButton = $('.clear-all-filters');
    if (clearAllButton) {
      this.addEventListener(clearAllButton, 'click', () => {
        this.clearAllFilters();
      });
    }
    
    // Keyboard shortcuts
    this.addEventListener(document, 'keydown', (e) => {
      if (e.target.closest('.endpoint-filter') && e.key === 'Escape') {
        this.clearAllFilters();
      }
    });
  }

  /**
   * Filter endpoints by tag
   */
  filterByTag(tag) {
    this.currentFilters.tag = tag;
    this.updateActiveFilterButton('.tag-filter', 'data-tag', tag);
    this.applyFilters();
    this.saveFilters();
    
    this.emit('tag-filter-changed', { tag, activeFilters: { ...this.currentFilters } });
  }

  /**
   * Filter endpoints by HTTP method
   */
  filterByMethod(method) {
    this.currentFilters.method = method;
    this.updateActiveFilterButton('.method-filter', 'data-method', method);
    this.applyFilters();
    this.saveFilters();
    
    this.emit('method-filter-changed', { method, activeFilters: { ...this.currentFilters } });
  }

  /**
   * Search endpoints by text
   */
  searchEndpoints(query) {
    this.currentFilters.search = query.toLowerCase().trim();
    this.applyFilters();
    this.saveFilters();
    
    this.emit('search-changed', { query, activeFilters: { ...this.currentFilters } });
  }

  /**
   * Update active state of filter buttons
   */
  updateActiveFilterButton(selector, attribute, value) {
    const buttons = $$(selector);
    buttons.forEach(button => {
      const isActive = button.getAttribute(attribute) === value;
      button.classList.toggle('tag-filter--active', isActive);
      button.classList.toggle('method-filter--active', isActive);
      button.classList.toggle('filter--active', isActive);
    });
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    let visibleCount = 0;
    
    this.endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      let isVisible = true;
      
      // Apply tag filter
      if (this.currentFilters.tag !== 'all') {
        isVisible = isVisible && data.tags.includes(this.currentFilters.tag);
      }
      
      // Apply method filter
      if (this.currentFilters.method !== 'all') {
        isVisible = isVisible && data.method === this.currentFilters.method;
      }
      
      // Apply search filter
      if (this.currentFilters.search) {
        const searchText = this.currentFilters.search;
        const searchableText = `${data.path} ${data.summary} ${data.tags.join(' ')}`.toLowerCase();
        isVisible = isVisible && searchableText.includes(searchText);
      }
      
      // Apply status filter (deprecated, etc.)
      if (this.currentFilters.status === 'deprecated') {
        isVisible = isVisible && data.deprecated;
      } else if (this.currentFilters.status === 'active') {
        isVisible = isVisible && !data.deprecated;
      }
      
      // Update endpoint visibility
      this.setEndpointVisibility(endpoint, isVisible);
      data.visible = isVisible;
      
      if (isVisible) visibleCount++;
    });
    
    // Update results count
    this.updateResultsCount(visibleCount);
    
    // Update clear filters button visibility
    this.updateClearFiltersVisibility();
    
    this.emit('filters-applied', {
      filters: { ...this.currentFilters },
      visibleCount,
      totalCount: this.endpoints.length
    });
  }

  /**
   * Set endpoint visibility with animation
   */
  setEndpointVisibility(endpoint, isVisible) {
    if (this.options.animateFiltering && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (isVisible && endpoint.style.display === 'none') {
        // Show with animation
        endpoint.style.display = '';
        endpoint.style.opacity = '0';
        endpoint.style.transform = 'translateY(10px)';
        endpoint.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation
        requestAnimationFrame(() => {
          endpoint.style.opacity = '1';
          endpoint.style.transform = 'translateY(0)';
        });
        
        // Clean up after animation
        setTimeout(() => {
          endpoint.style.transition = '';
          endpoint.style.transform = '';
        }, 300);
        
      } else if (!isVisible && endpoint.style.display !== 'none') {
        // Hide with animation
        endpoint.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        endpoint.style.opacity = '0';
        endpoint.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          endpoint.style.display = 'none';
          endpoint.style.transition = '';
          endpoint.style.transform = '';
        }, 300);
      }
    } else {
      // No animation
      endpoint.style.display = isVisible ? '' : 'none';
    }
    
    endpoint.classList.toggle('endpoint-item--filtered', !isVisible);
  }

  /**
   * Update results count display
   */
  updateResultsCount(count) {
    const countElement = $('.filter-results-count');
    if (countElement) {
      const totalCount = this.endpoints.length;
      countElement.textContent = `Showing ${count} of ${totalCount} endpoints`;
      countElement.classList.toggle('filter-results-count--filtered', count < totalCount);
    }
  }

  /**
   * Update clear filters button visibility
   */
  updateClearFiltersVisibility() {
    const hasActiveFilters = this.currentFilters.tag !== 'all' || 
                            this.currentFilters.method !== 'all' || 
                            this.currentFilters.search || 
                            this.currentFilters.status !== 'all';
    
    const clearButton = $('.clear-all-filters');
    if (clearButton) {
      clearButton.style.display = hasActiveFilters ? '' : 'none';
    }
    
    // Update filter indicator
    const filterIndicator = $('.active-filters-indicator');
    if (filterIndicator) {
      filterIndicator.classList.toggle('visible', hasActiveFilters);
    }
  }

  /**
   * Clear all active filters
   */
  clearAllFilters() {
    this.currentFilters = {
      tag: 'all',
      method: 'all',
      status: 'all',
      search: ''
    };
    
    // Reset UI
    this.updateActiveFilterButton('.tag-filter', 'data-tag', 'all');
    this.updateActiveFilterButton('.method-filter', 'data-method', 'all');
    
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    
    // Apply cleared filters
    this.applyFilters();
    this.saveFilters();
    
    this.emit('filters-cleared');
  }

  /**
   * Save current filters to storage
   */
  saveFilters() {
    if (!this.options.storeFilters) return;
    
    try {
      localStorage.setItem(`${this.options.namespace}.filters`, JSON.stringify({
        filters: this.currentFilters,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save endpoint filters:', error);
    }
  }

  /**
   * Load saved filters from storage
   */
  loadSavedFilters() {
    if (!this.options.storeFilters) return;
    
    try {
      const stored = localStorage.getItem(`${this.options.namespace}.filters`);
      if (stored) {
        const { filters } = JSON.parse(stored);
        this.currentFilters = { ...this.currentFilters, ...filters };
        
        // Apply loaded filters
        setTimeout(() => {
          if (this.currentFilters.tag !== 'all') {
            this.filterByTag(this.currentFilters.tag);
          }
          if (this.currentFilters.method !== 'all') {
            this.filterByMethod(this.currentFilters.method);
          }
          if (this.currentFilters.search) {
            if (this.searchInput) {
              this.searchInput.value = this.currentFilters.search;
            }
            this.searchEndpoints(this.currentFilters.search);
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Failed to load endpoint filters:', error);
    }
  }

  /**
   * Get current filter statistics
   */
  getStats() {
    const visibleCount = this.endpoints.filter(endpoint => endpoint._filterData.visible).length;
    
    return {
      totalEndpoints: this.endpoints.length,
      visibleEndpoints: visibleCount,
      hiddenEndpoints: this.endpoints.length - visibleCount,
      activeFilters: { ...this.currentFilters },
      filterStats: Object.fromEntries(this.filterStats),
      hasActiveFilters: this.currentFilters.tag !== 'all' || 
                       this.currentFilters.method !== 'all' || 
                       !!this.currentFilters.search
    };
  }

  /**
   * Custom cleanup
   */
  onDestroy() {
    // Clean up endpoint data
    this.endpoints.forEach(endpoint => {
      delete endpoint._filterData;
      endpoint.style.display = '';
      endpoint.style.opacity = '';
      endpoint.style.transform = '';
      endpoint.classList.remove('endpoint-item--filtered');
    });
    
    this.filterStats.clear();
  }
}

// Auto-register component
ComponentManager.register('endpoint-filter', EndpointFilter);