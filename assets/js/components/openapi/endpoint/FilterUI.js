/**
 * FilterUI Component
 * Handles user interface, animations, and visual updates for endpoint filtering
 */

import { Component } from '../../../core/Component.js';

export class FilterUI extends Component {
  constructor(config = {}) {
    super({
      name: 'filter-ui',
      selector: config.selector || '.endpoint-filter',
      ...config
    });
  }

  /**
   * Update active state of filter buttons
   */
  static updateActiveFilterButton(selector, attribute, value) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      const isActive = button.getAttribute(attribute) === value;
      button.classList.toggle('tag-filter--active', isActive);
      button.classList.toggle('method-filter--active', isActive);
      button.classList.toggle('filter--active', isActive);
    });
  }

  /**
   * Set endpoint visibility with animation
   */
  static setEndpointVisibility(endpoint, isVisible, animateFiltering = true) {
    if (animateFiltering && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (isVisible && endpoint.style.display === 'none') {
        // Show with animation
        endpoint.style.display = '';
        endpoint.style.opacity = '0';
        endpoint.style.transform = 'translateY(10px)';
        // CSS handles transitions via animation tokens
        
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
        // CSS handles transitions via animation tokens
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
   * Update all endpoints visibility
   */
  static updateEndpointsVisibility(endpoints, animateFiltering = true) {
    endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      if (data) {
        FilterUI.setEndpointVisibility(endpoint, data.visible, animateFiltering);
      }
    });
  }

  /**
   * Update results count display
   */
  static updateResultsCount(count, totalCount) {
    const countElement = document.querySelector('.filter-results-count');
    if (countElement) {
      countElement.textContent = `Showing ${count} of ${totalCount} endpoints`;
      countElement.classList.toggle('filter-results-count--filtered', count < totalCount);
    }
  }

  /**
   * Update clear filters button visibility
   */
  static updateClearFiltersVisibility(hasActiveFilters) {
    const clearButton = document.querySelector('.clear-all-filters');
    if (clearButton) {
      clearButton.style.display = hasActiveFilters ? '' : 'none';
    }
    
    // Update filter indicator
    const filterIndicator = document.querySelector('.active-filters-indicator');
    if (filterIndicator) {
      filterIndicator.classList.toggle('visible', hasActiveFilters);
    }
  }

  /**
   * Setup filter button event listeners
   */
  static setupFilterButtons(tagFilters, methodFilters, addEventListener, callbacks) {
    // Tag filter clicks
    tagFilters.forEach(button => {
      addEventListener(button, 'click', (e) => {
        e.preventDefault();
        const tag = button.getAttribute('data-tag');
        callbacks.onTagFilter(tag);
      });
    });
    
    // Method filter clicks
    methodFilters.forEach(button => {
      addEventListener(button, 'click', (e) => {
        e.preventDefault();
        const method = button.getAttribute('data-method');
        callbacks.onMethodFilter(method);
      });
    });
  }

  /**
   * Setup search input event listeners
   */
  static setupSearchInput(searchInput, addEventListener, callbacks) {
    if (!searchInput) return;

    addEventListener(searchInput, 'input', (e) => {
      callbacks.onSearch(e.target.value);
    });
    
    // Clear search button
    const clearButton = document.querySelector('.search-clear');
    if (clearButton) {
      addEventListener(clearButton, 'click', () => {
        searchInput.value = '';
        callbacks.onSearch('');
      });
    }
  }

  /**
   * Setup clear all filters button
   */
  static setupClearAllButton(addEventListener, onClearAll) {
    const clearAllButton = document.querySelector('.clear-all-filters');
    if (clearAllButton) {
      addEventListener(clearAllButton, 'click', () => {
        onClearAll();
      });
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  static setupKeyboardShortcuts(addEventListener, onClearAll) {
    addEventListener(document, 'keydown', (e) => {
      if (e.target.closest('.endpoint-filter') && e.key === 'Escape') {
        onClearAll();
      }
    });
  }

  /**
   * Create filter status indicator
   */
  static createFilterStatusIndicator(currentFilters, visibleCount, totalCount) {
    const container = document.querySelector('.filter-status');
    if (!container) return;

    const activeFilters = [];
    if (currentFilters.tag !== 'all') activeFilters.push(`Tag: ${currentFilters.tag}`);
    if (currentFilters.method !== 'all') activeFilters.push(`Method: ${currentFilters.method}`);
    if (currentFilters.search) activeFilters.push(`Search: "${currentFilters.search}"`);
    if (currentFilters.status !== 'all') activeFilters.push(`Status: ${currentFilters.status}`);

    container.innerHTML = `
      <div class="filter-status__count">
        Showing ${visibleCount} of ${totalCount} endpoints
      </div>
      ${activeFilters.length > 0 ? `
        <div class="filter-status__active">
          Active filters: ${activeFilters.join(', ')}
        </div>
      ` : ''}
    `;
  }

  /**
   * Highlight matching text in search results
   */
  static highlightSearchText(endpoints, searchQuery) {
    if (!searchQuery) return;

    const searchText = searchQuery.toLowerCase().trim();
    if (!searchText) return;

    endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      if (!data || !data.visible) return;

      // Highlight in path
      const pathElement = endpoint.querySelector('.endpoint-path');
      if (pathElement) {
        FilterUI.highlightTextInElement(pathElement, searchText);
      }

      // Highlight in summary
      const summaryElement = endpoint.querySelector('.endpoint-summary');
      if (summaryElement) {
        FilterUI.highlightTextInElement(summaryElement, searchText);
      }

      // Highlight in tags
      const tagElements = endpoint.querySelectorAll('.endpoint-tag');
      tagElements.forEach(tag => {
        FilterUI.highlightTextInElement(tag, searchText);
      });
    });
  }

  /**
   * Remove search text highlighting
   */
  static removeSearchHighlighting(endpoints) {
    endpoints.forEach(endpoint => {
      const highlightedElements = endpoint.querySelectorAll('.search-highlight');
      highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.replaceChild(document.createTextNode(element.textContent), element);
        parent.normalize();
      });
    });
  }

  /**
   * Highlight text in specific element
   */
  static highlightTextInElement(element, searchText) {
    const originalText = element.textContent;
    const regex = new RegExp(`(${searchText})`, 'gi');
    
    if (regex.test(originalText)) {
      const highlightedHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
      element.innerHTML = highlightedHTML;
    }
  }

  /**
   * Show filter loading state
   */
  static showFilterLoading() {
    const filterContainer = document.querySelector('.endpoint-filter');
    if (filterContainer) {
      filterContainer.classList.add('filter-loading');
    }
  }

  /**
   * Hide filter loading state
   */
  static hideFilterLoading() {
    const filterContainer = document.querySelector('.endpoint-filter');
    if (filterContainer) {
      filterContainer.classList.remove('filter-loading');
    }
  }

  /**
   * Animate filter application
   */
  static animateFilterApplication(endpoints, delay = 50) {
    endpoints.forEach((endpoint, index) => {
      const data = endpoint._filterData;
      if (data && data.visible) {
        setTimeout(() => {
          endpoint.style.transform = 'scale(1.02)';
          setTimeout(() => {
            endpoint.style.transform = '';
          }, 150);
        }, index * delay);
      }
    });
  }

  /**
   * Create filter breadcrumbs
   */
  static createFilterBreadcrumbs(currentFilters, onRemoveFilter) {
    const breadcrumbsContainer = document.querySelector('.filter-breadcrumbs');
    if (!breadcrumbsContainer) return;

    breadcrumbsContainer.innerHTML = '';

    const filters = [];
    if (currentFilters.tag !== 'all') {
      filters.push({ type: 'tag', value: currentFilters.tag, label: `Tag: ${currentFilters.tag}` });
    }
    if (currentFilters.method !== 'all') {
      filters.push({ type: 'method', value: currentFilters.method, label: `Method: ${currentFilters.method}` });
    }
    if (currentFilters.search) {
      filters.push({ type: 'search', value: currentFilters.search, label: `Search: "${currentFilters.search}"` });
    }
    if (currentFilters.status !== 'all') {
      filters.push({ type: 'status', value: currentFilters.status, label: `Status: ${currentFilters.status}` });
    }

    filters.forEach(filter => {
      const breadcrumb = document.createElement('span');
      breadcrumb.className = 'filter-breadcrumb';
      breadcrumb.innerHTML = `
        ${filter.label}
        <button class="filter-breadcrumb__remove" aria-label="Remove ${filter.label}">×</button>
      `;
      
      const removeButton = breadcrumb.querySelector('.filter-breadcrumb__remove');
      removeButton.addEventListener('click', () => {
        onRemoveFilter(filter.type);
      });
      
      breadcrumbsContainer.appendChild(breadcrumb);
    });
  }

  /**
   * Update filter button counts
   */
  static updateFilterButtonCounts(tagFilters, methodFilters, endpoints, currentFilters) {
    // Update tag filter counts
    tagFilters.forEach(button => {
      const tag = button.getAttribute('data-tag');
      if (tag && tag !== 'all') {
        // Count how many endpoints would be visible with this tag filter
        const tempFilters = { ...currentFilters, tag };
        const count = endpoints.filter(endpoint => {
          const data = endpoint._filterData;
          return data && data.tags.includes(tag);
        }).length;
        
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
        button.disabled = count === 0;
      }
    });

    // Update method filter counts
    methodFilters.forEach(button => {
      const method = button.getAttribute('data-method');
      if (method && method !== 'all') {
        const tempFilters = { ...currentFilters, method };
        const count = endpoints.filter(endpoint => {
          const data = endpoint._filterData;
          return data && data.method === method;
        }).length;
        
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
        button.disabled = count === 0;
      }
    });
  }

  /**
   * Reset all visual states
   */
  static resetVisualStates(endpoints) {
    endpoints.forEach(endpoint => {
      // Reset visibility
      endpoint.style.display = '';
      endpoint.style.opacity = '';
      endpoint.style.transform = '';
      endpoint.style.transition = '';
      endpoint.classList.remove('endpoint-item--filtered');
      
      // Reset data
      if (endpoint._filterData) {
        endpoint._filterData.visible = true;
      }
    });

    // Reset UI elements
    FilterUI.removeSearchHighlighting(endpoints);
    FilterUI.hideFilterLoading();
    
    // Reset buttons
    const buttons = document.querySelectorAll('.tag-filter, .method-filter');
    buttons.forEach(button => {
      button.classList.remove('tag-filter--active', 'method-filter--active', 'filter--active');
      button.disabled = false;
    });
  }
}

// Auto-register component
import ComponentManager from '../../../core/ComponentManager.js';
ComponentManager.register('filter-ui', FilterUI);