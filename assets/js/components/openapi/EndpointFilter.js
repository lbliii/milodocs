/**
 * Endpoint Filter Component - Main Orchestrator
 * Handles filtering of API endpoints by tags and other criteria
 * Split into focused components for better maintainability
 */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { $$, $, localStorage } from '../../utils/index.js';
import { EndpointData } from './endpoint/EndpointData.js';
import { FilterLogic } from './endpoint/FilterLogic.js';
import { FilterUI } from './endpoint/FilterUI.js';
import { FilterPersistence } from './endpoint/FilterPersistence.js';

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
    if (this.endpoints.length === 0) return;
    
    // Setup filter buttons
    this.tagFilters = $$('.tag-filter');
    this.methodFilters = $$('.method-filter');
    this.statusFilters = $$('.status-filter');
    
    // Setup search input if present
    this.searchInput = $('.endpoint-search');
    
    // Initialize endpoint data using EndpointData component
    EndpointData.initializeEndpointData(this.endpoints, EndpointData.generateEndpointId);
    
    // Build filter statistics
    this.filterStats = EndpointData.buildFilterStats(this.endpoints);
    
    // Update filter button labels with counts if option is enabled
    if (this.options.showStats) {
      EndpointData.updateFilterButtonStats(this.tagFilters, this.methodFilters, this.filterStats);
    }
    
    // Load saved filters using FilterPersistence
    if (this.options.storeFilters) {
      this.loadSavedFilters();
    }
    
    
  }

  /**
   * Bind event listeners using FilterUI component
   */
  bindEvents() {
    // Setup filter buttons
    FilterUI.setupFilterButtons(
      this.tagFilters,
      this.methodFilters,
      (element, event, handler) => this.addEventListener(element, event, handler),
      {
        onTagFilter: (tag) => this.filterByTag(tag),
        onMethodFilter: (method) => this.filterByMethod(method)
      }
    );
    
    // Setup search input
    FilterUI.setupSearchInput(
      this.searchInput,
      (element, event, handler) => this.addEventListener(element, event, handler),
      {
        onSearch: (query) => this.searchEndpoints(query)
      }
    );
    
    // Setup clear all button
    FilterUI.setupClearAllButton(
      (element, event, handler) => this.addEventListener(element, event, handler),
      () => this.clearAllFilters()
    );
    
    // Setup keyboard shortcuts
    FilterUI.setupKeyboardShortcuts(
      (element, event, handler) => this.addEventListener(element, event, handler),
      () => this.clearAllFilters()
    );
  }

  /**
   * Filter endpoints by tag using FilterLogic
   */
  filterByTag(tag) {
    FilterLogic.filterByTag(
      tag,
      this.currentFilters,
      FilterUI.updateActiveFilterButton,
      () => this.applyFilters(),
      () => this.saveFilters(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Filter endpoints by HTTP method using FilterLogic
   */
  filterByMethod(method) {
    FilterLogic.filterByMethod(
      method,
      this.currentFilters,
      FilterUI.updateActiveFilterButton,
      () => this.applyFilters(),
      () => this.saveFilters(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Search endpoints by text using FilterLogic
   */
  searchEndpoints(query) {
    FilterLogic.searchEndpoints(
      query,
      this.currentFilters,
      () => this.applyFilters(),
      () => this.saveFilters(),
      (event, data) => this.emit(event, data)
    );
  }



  /**
   * Apply all active filters using FilterLogic and FilterUI
   */
  applyFilters() {
    const visibleCount = FilterLogic.applyFilters(
      this.endpoints,
      this.currentFilters,
      (event, data) => this.emit(event, data)
    );
    
    // Update UI elements
    FilterUI.updateEndpointsVisibility(this.endpoints, this.options.animateFiltering);
    FilterUI.updateResultsCount(visibleCount, this.endpoints.length);
    FilterUI.updateClearFiltersVisibility(FilterLogic.hasActiveFilters(this.currentFilters));
    
    return visibleCount;
  }



  /**
   * Clear all active filters using FilterLogic
   */
  clearAllFilters() {
    FilterLogic.clearAllFilters(
      this.currentFilters,
      FilterUI.updateActiveFilterButton,
      this.searchInput,
      () => this.applyFilters(),
      () => this.saveFilters(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Save current filters using FilterPersistence
   */
  saveFilters() {
    if (!this.options.storeFilters) return;
    FilterPersistence.saveFilters(this.currentFilters, this.options.namespace);
  }

  /**
   * Load saved filters using FilterPersistence
   */
  loadSavedFilters() {
    if (!this.options.storeFilters) return;
    
    const savedFilters = FilterPersistence.loadSavedFilters(this.options.namespace);
    if (savedFilters) {
      this.currentFilters = { ...this.currentFilters, ...savedFilters };
      
      // Apply loaded filters using FilterPersistence
      FilterPersistence.applySavedFilters(
        savedFilters,
        {
          onTagFilter: (tag) => this.filterByTag(tag),
          onMethodFilter: (method) => this.filterByMethod(method),
          onSearch: (query) => this.searchEndpoints(query)
        },
        this.searchInput
      );
    }
  }

  /**
   * Get current filter statistics using FilterLogic
   */
  getStats() {
    return FilterLogic.getFilterStats(this.endpoints, this.currentFilters, this.filterStats);
  }

  /**
   * Custom cleanup using split components
   */
  onDestroy() {
    // Clean up endpoint data using EndpointData
    EndpointData.cleanupEndpointData(this.endpoints);
    
    // Reset visual states using FilterUI
    FilterUI.resetVisualStates(this.endpoints);
    
    // Clear filter stats
    if (this.filterStats) {
      this.filterStats.clear();
    }
  }
}

// Auto-register component
ComponentManager.register('endpoint-filter', EndpointFilter);