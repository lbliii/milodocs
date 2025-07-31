/**
 * SearchFilter Component
 * Advanced filtering functionality for search results
 */

import { Component } from '../../core/ComponentManager.js';

export class SearchFilter extends Component {
  constructor(config = {}) {
    super({
      name: 'searchFilter',
      selector: config.selector || '#filterSelect',
      ...config
    });

    this.filterField = config.filterField || 'section';
    this.displayName = config.displayName || 'Sections';
    this.documents = [];
    this.filterValues = [];
    this.currentFilter = '';
    
    // Event callbacks
    this.onFilterChange = config.onFilterChange || (() => {});
    this.onFilterReady = config.onFilterReady || (() => {});
  }

  async onInit() {
    this.cacheElements();
    this.setupEventListeners();
  }

  cacheElements() {
    this.filterSelect = document.getElementById('filterSelect');
    this.filterContainer = document.getElementById('filterContainer');
    this.filterLabel = document.querySelector('label[for="filterSelect"]');
  }

  setupEventListeners() {
    if (this.filterSelect) {
      // Filter change with debouncing and visual feedback
      let filterTimeout;
      this.filterSelect.addEventListener('change', (e) => {
        clearTimeout(filterTimeout);
        
        // Immediate visual feedback
        this.updateFilterState(e.target.value);
        
        // Debounced callback
        filterTimeout = setTimeout(() => {
          this.currentFilter = e.target.value;
          this.onFilterChange(e.target.value);
          this.emit('filter:changed', { 
            filter: e.target.value,
            filterField: this.filterField 
          });
        }, 150);
      });

      // Focus management
      this.filterSelect.addEventListener('focus', () => {
        this.filterSelect.classList.add('filter-focused');
      });

      this.filterSelect.addEventListener('blur', () => {
        this.filterSelect.classList.remove('filter-focused');
      });
    }
  }

  /**
   * Initialize filter with documents data
   */
  initializeWithDocuments(documents) {
    this.documents = documents;
    this.buildFilterOptions();
    this.setDefaultFilter();
    this.updateFilterLabel();
    
    this.emit('filter:ready', {
      filterValues: this.filterValues,
      totalDocuments: documents.length
    });
    
    this.onFilterReady(this.filterValues);
  }

  /**
   * Build filter options with sophisticated functionality
   */
  buildFilterOptions() {
    if (!this.filterSelect || !this.documents.length) return;

    // Extract and process filter values
    this.filterValues = [...new Set(
      this.documents
        .map(doc => doc[this.filterField])
        .filter(value => value !== null && value !== undefined)
    )].sort();

    // Preserve existing "All" option or create one
    const existingOptions = Array.from(this.filterSelect.children);
    const allOption = existingOptions.find(option => 
      option.value === '' || option.textContent.toLowerCase().includes('all')
    );
    
    this.filterSelect.innerHTML = '';
    
    if (allOption) {
      this.filterSelect.appendChild(allOption);
    } else {
      this.filterSelect.appendChild(this.createAllOption());
    }

    // Add filter options with counts
    this.filterValues.forEach(value => {
      const count = this.documents.filter(doc => doc[this.filterField] === value).length;
      const option = this.createFilterOption(value, count);
      this.filterSelect.appendChild(option);
    });
  }

  /**
   * Create "All" option
   */
  createAllOption() {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = `All ${this.displayName}`;
    option.setAttribute('data-count', this.documents.length);
    return option;
  }

  /**
   * Create individual filter option with smart display
   */
  createFilterOption(value, count) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${this.formatDisplayText(value)} (${count})`;
    option.setAttribute('data-count', count);
    option.setAttribute('data-filter-value', value);
    
    // Add color coding for popular sections
    if (count > this.documents.length * 0.1) {
      option.setAttribute('data-popular', 'true');
    }
    
    return option;
  }

  /**
   * Format text for display with smart transformations
   */
  formatDisplayText(value) {
    if (!value) return 'Other';
    
    // Handle common patterns
    const formatted = value
      .split(/[-_]/)
      .map(word => {
        // Handle abbreviations
        if (word.toUpperCase() === word && word.length <= 4) {
          return word.toUpperCase();
        }
        // Handle special cases
        const specialCases = {
          'api': 'API',
          'ui': 'UI',
          'ux': 'UX',
          'css': 'CSS',
          'js': 'JavaScript',
          'html': 'HTML',
          'json': 'JSON',
          'xml': 'XML',
          'sql': 'SQL'
        };
        
        const lowerWord = word.toLowerCase();
        if (specialCases[lowerWord]) {
          return specialCases[lowerWord];
        }
        
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
      
    return formatted;
  }

  /**
   * Set default filter based on context
   */
  setDefaultFilter() {
    if (!this.filterContainer || !this.filterSelect) return;

    const defaultFilter = this.filterContainer.getAttribute('data-category');
    if (defaultFilter && this.filterValues.includes(defaultFilter)) {
      this.filterSelect.value = defaultFilter;
      this.currentFilter = defaultFilter;
      this.updateFilterState(defaultFilter);
    }
  }

  /**
   * Update filter label with display name
   */
  updateFilterLabel() {
    if (this.filterLabel) {
      this.filterLabel.textContent = this.displayName.charAt(0).toUpperCase() + 
                                     this.displayName.slice(1);
    }
  }

  /**
   * Update visual state based on filter selection
   */
  updateFilterState(filterValue) {
    if (!this.filterSelect) return;

    // Update active state
    if (filterValue) {
      this.filterSelect.classList.add('filter-active');
    } else {
      this.filterSelect.classList.remove('filter-active');
    }

    // Update option styling
    Array.from(this.filterSelect.options).forEach(option => {
      if (option.value === filterValue) {
        option.setAttribute('selected', 'selected');
      } else {
        option.removeAttribute('selected');
      }
    });
  }

  /**
   * Get current filter information
   */
  getCurrentFilter() {
    return {
      value: this.currentFilter,
      field: this.filterField,
      displayText: this.formatDisplayText(this.currentFilter),
      count: this.getFilterCount(this.currentFilter)
    };
  }

  /**
   * Get count of documents for a filter value
   */
  getFilterCount(filterValue) {
    if (!filterValue) return this.documents.length;
    return this.documents.filter(doc => doc[this.filterField] === filterValue).length;
  }

  /**
   * Reset filter to default state
   */
  resetFilter() {
    if (this.filterSelect) {
      this.filterSelect.value = '';
      this.currentFilter = '';
      this.updateFilterState('');
      
      this.emit('filter:reset', { filterField: this.filterField });
    }
  }

  /**
   * Set filter programmatically
   */
  setFilter(value) {
    if (this.filterSelect && this.filterValues.includes(value)) {
      this.filterSelect.value = value;
      this.currentFilter = value;
      this.updateFilterState(value);
      
      // Trigger change event
      this.onFilterChange(value);
      this.emit('filter:changed', { 
        filter: value,
        filterField: this.filterField 
      });
    }
  }

  /**
   * Get all available filter values
   */
  getFilterValues() {
    return this.filterValues.map(value => ({
      value,
      displayText: this.formatDisplayText(value),
      count: this.getFilterCount(value)
    }));
  }

  /**
   * Filter documents by current filter
   */
  filterDocuments(documents = this.documents) {
    if (!this.currentFilter) return documents;
    return documents.filter(doc => doc[this.filterField] === this.currentFilter);
  }

  /**
   * Update filter configuration
   */
  updateConfig(config) {
    if (config.filterField) this.filterField = config.filterField;
    if (config.displayName) this.displayName = config.displayName;
    if (config.onFilterChange) this.onFilterChange = config.onFilterChange;
    if (config.onFilterReady) this.onFilterReady = config.onFilterReady;
    
    // Rebuild if documents are available
    if (this.documents.length) {
      this.buildFilterOptions();
      this.updateFilterLabel();
    }
  }

  /**
   * Destroy component and cleanup
   */
  destroy() {
    if (this.filterSelect) {
      this.filterSelect.removeEventListener('change', this.handleFilterChange);
      this.filterSelect.removeEventListener('focus', this.handleFocus);
      this.filterSelect.removeEventListener('blur', this.handleBlur);
    }
    super.destroy();
  }
}