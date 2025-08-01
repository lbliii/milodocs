/**
 * OpenAPI Viewer Component
 * Handles OpenAPI documentation rendering and interactions
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { $$, $, CopyManager, localStorage } from '../../utils/index.js';

export class OpenAPIViewer extends Component {
  constructor(config = {}) {
    super({
      name: 'openapi-viewer',
      selector: config.selector || '[data-component="openapi-viewer"]',
      ...config
    });
    
    this.currentFilter = 'all';
    this.endpoints = new Map();
    this.options = {
      autoCollapse: true,
      storePreferences: true,
      namespace: 'openapi-viewer',
      ...this.options
    };
  }

  /**
   * Setup elements and initialize OpenAPI viewer
   */
  setupElements() {
    super.setupElements();
    
    // Find all endpoints
    this.endpointElements = $$('.endpoint-item');
    
    if (this.endpointElements.length === 0) {
      console.log('No OpenAPI endpoints found');
      return;
    }
    
    console.log(`Found ${this.endpointElements.length} OpenAPI endpoints`);
    
    // Setup endpoints
    this.endpointElements.forEach(endpoint => this.setupEndpoint(endpoint));
    
    // Load metadata
    this.loadMetadata();
    
    // Load user preferences
    if (this.options.storePreferences) {
      this.loadPreferences();
    }
  }

  /**
   * Setup individual endpoint
   */
  setupEndpoint(endpoint) {
    const header = endpoint.querySelector('.endpoint-header');
    const details = endpoint.querySelector('.endpoint-details');
    const method = endpoint.getAttribute('data-method');
    const path = endpoint.getAttribute('data-path');
    
    if (!header || !details) {
      console.warn('Endpoint missing header or details:', endpoint);
      return;
    }
    
    // Generate unique ID for endpoint if not present
    if (!endpoint.id) {
      endpoint.id = `endpoint-${method}-${path}`.replace(/[^a-zA-Z0-9-]/g, '-');
    }
    
    // Setup ARIA attributes
    header.setAttribute('aria-controls', details.id || `${endpoint.id}-details`);
    details.id = details.id || `${endpoint.id}-details`;
    
    // Store endpoint data
    this.endpoints.set(endpoint, {
      header,
      details,
      method,
      path,
      isExpanded: false,
      tags: this.getEndpointTags(endpoint)
    });
    
    // Add component tracking
    endpoint.setAttribute('data-openapi-component', this.id);
  }

  /**
   * Get endpoint tags for filtering
   */
  getEndpointTags(endpoint) {
    const tags = [];
    const tagElements = endpoint.querySelectorAll('.endpoint-tag');
    tagElements.forEach(tag => {
      tags.push(tag.textContent.trim().toLowerCase());
    });
    return tags;
  }

  /**
   * Load OpenAPI metadata
   */
  loadMetadata() {
    const metadataScript = $('#openapi-metadata');
    if (metadataScript) {
      try {
        this.metadata = JSON.parse(metadataScript.textContent);
        console.log('Loaded OpenAPI metadata:', this.metadata);
      } catch (error) {
        console.warn('Failed to parse OpenAPI metadata:', error);
      }
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Endpoint header clicks
    this.addEventListener(document, 'click', (e) => {
      const header = e.target.closest('.endpoint-header');
      if (header) {
        const endpoint = header.closest('.endpoint-item');
        if (endpoint && this.endpoints.has(endpoint)) {
          e.preventDefault();
          this.toggleEndpoint(endpoint);
        }
      }
    });
    
    // Keyboard support for endpoint headers
    this.addEventListener(document, 'keydown', (e) => {
      const header = e.target.closest('.endpoint-header');
      if (header && (e.key === 'Enter' || e.key === ' ')) {
        const endpoint = header.closest('.endpoint-item');
        if (endpoint && this.endpoints.has(endpoint)) {
          e.preventDefault();
          this.toggleEndpoint(endpoint);
        }
      }
    });
    
    // Tag filter clicks
    this.addEventListener(document, 'click', (e) => {
      const tagFilter = e.target.closest('.tag-filter');
      if (tagFilter) {
        e.preventDefault();
        const tag = tagFilter.getAttribute('data-tag');
        this.filterByTag(tag);
      }
    });
    
    // Copy button clicks
    this.addEventListener(document, 'click', (e) => {
      const copyBtn = e.target.closest('.copy-button');
      if (copyBtn) {
        e.preventDefault();
        this.handleCopyClick(copyBtn);
      }
    });
  }

  /**
   * Toggle endpoint expansion
   */
  async toggleEndpoint(endpoint) {
    const endpointData = this.endpoints.get(endpoint);
    if (!endpointData) return;
    
    const { header, details, isExpanded } = endpointData;
    
    // Update state
    endpointData.isExpanded = !isExpanded;
    
    try {
      if (endpointData.isExpanded) {
        await this.expandEndpoint(endpoint, endpointData);
      } else {
        await this.collapseEndpoint(endpoint, endpointData);
      }
      
      // Save preferences
      if (this.options.storePreferences) {
        this.savePreferences();
      }
      
      // Emit events
      this.emit('endpoint-toggle', {
        endpoint,
        expanded: endpointData.isExpanded,
        method: endpointData.method,
        path: endpointData.path
      });
      
    } catch (error) {
      console.error('Toggle animation failed:', error);
      // Revert state on error
      endpointData.isExpanded = !endpointData.isExpanded;
    }
  }

  /**
   * Expand endpoint details
   */
  async expandEndpoint(endpoint, endpointData) {
    const { header, details } = endpointData;
    
    // Update ARIA
    header.setAttribute('aria-expanded', 'true');
    
    // Show details
    details.style.display = 'block';
    details.classList.add('expanded');
    
    // Animate if motion is allowed
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Simple slide down animation
      details.style.maxHeight = '0';
      details.style.overflow = 'hidden';
      details.style.transition = 'max-height 0.3s ease-out';
      
      // Force reflow
      details.offsetHeight;
      
      // Animate to full height
      details.style.maxHeight = details.scrollHeight + 'px';
      
      // Clean up after animation
      setTimeout(() => {
        details.style.maxHeight = '';
        details.style.overflow = '';
        details.style.transition = '';
      }, 300);
    }
    
    // Initialize any components within the expanded section
    this.initializeNestedComponents(details);
    
    this.emit('endpoint-expanded', { endpoint, details });
  }

  /**
   * Collapse endpoint details
   */
  async collapseEndpoint(endpoint, endpointData) {
    const { header, details } = endpointData;
    
    // Update ARIA
    header.setAttribute('aria-expanded', 'false');
    
    // Animate if motion is allowed
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      details.style.maxHeight = details.scrollHeight + 'px';
      details.style.overflow = 'hidden';
      details.style.transition = 'max-height 0.3s ease-in';
      
      // Force reflow
      details.offsetHeight;
      
      // Animate to zero height
      details.style.maxHeight = '0';
      
      // Hide after animation
      setTimeout(() => {
        details.style.display = 'none';
        details.classList.remove('expanded');
        details.style.maxHeight = '';
        details.style.overflow = '';
        details.style.transition = '';
      }, 300);
    } else {
      // No animation
      details.style.display = 'none';
      details.classList.remove('expanded');
    }
    
    this.emit('endpoint-collapsed', { endpoint, details });
  }

  /**
   * Initialize nested components in expanded sections
   */
  initializeNestedComponents(container) {
    // Initialize code tabs
    const codeTabs = container.querySelectorAll('[data-component="code-tabs"]');
    codeTabs.forEach(tabs => {
      if (!tabs.hasAttribute('data-initialized')) {
        this.initializeCodeTabs(tabs);
        tabs.setAttribute('data-initialized', 'true');
      }
    });
  }

  /**
   * Initialize code tabs component
   */
  initializeCodeTabs(tabsContainer) {
    const tabButtons = tabsContainer.querySelectorAll('.code-tab');
    const tabPanels = tabsContainer.querySelectorAll('.code-tab-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = button.getAttribute('data-tab');
        
        // Update active tab
        tabButtons.forEach(btn => btn.classList.remove('code-tab--active'));
        button.classList.add('code-tab--active');
        
        // Update active panel
        tabPanels.forEach(panel => panel.classList.remove('code-tab-panel--active'));
        const targetPanel = tabsContainer.querySelector(`[data-panel="${targetTab}"]`);
        if (targetPanel) {
          targetPanel.classList.add('code-tab-panel--active');
        }
        
        // Emit event
        this.emit('code-tab-changed', { tab: targetTab, container: tabsContainer });
      });
    });
  }

  /**
   * Filter endpoints by tag
   */
  filterByTag(tag) {
    this.currentFilter = tag;
    
    // Update active filter button
    const filterButtons = $$('.tag-filter');
    filterButtons.forEach(btn => {
      btn.classList.toggle('tag-filter--active', btn.getAttribute('data-tag') === tag);
    });
    
    // Show/hide endpoints
    this.endpoints.forEach((data, endpoint) => {
      const shouldShow = tag === 'all' || data.tags.includes(tag.toLowerCase());
      
      if (shouldShow) {
        endpoint.style.display = '';
        endpoint.classList.remove('endpoint-item--filtered');
      } else {
        endpoint.style.display = 'none';
        endpoint.classList.add('endpoint-item--filtered');
      }
    });
    
    // Save filter preference
    if (this.options.storePreferences) {
      this.savePreferences();
    }
    
    this.emit('filter-changed', { tag, filteredCount: this.getFilteredCount() });
  }

  /**
   * Get count of filtered endpoints
   */
  getFilteredCount() {
    let count = 0;
    this.endpoints.forEach((data, endpoint) => {
      if (endpoint.style.display !== 'none') {
        count++;
      }
    });
    return count;
  }

  /**
   * Handle copy button clicks using unified CopyManager
   */
  async handleCopyClick(button) {
    const result = await CopyManager.copy(button, {
      successMessage: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      `,
      errorMessage: '❌',
      feedbackDuration: 2000,
      announceMessage: 'Code copied to clipboard',
      analytics: {
        component: 'openapi-viewer',
        endpointId: button.closest('.endpoint-item')?.id || 'unknown'
      },
      onSuccess: (text) => {
        this.emit('code-copied', { text, button });
      },
      onError: (error) => {
        this.emit('code-copy-failed', { error, button });
      }
    });

    return result;
  }

  /**
   * Expand all endpoints
   */
  async expandAll() {
    const expandPromises = Array.from(this.endpoints.keys())
      .filter(endpoint => !this.endpoints.get(endpoint).isExpanded)
      .map(endpoint => this.toggleEndpoint(endpoint));
    
    await Promise.all(expandPromises);
    this.emit('expanded-all');
  }

  /**
   * Collapse all endpoints
   */
  async collapseAll() {
    const collapsePromises = Array.from(this.endpoints.keys())
      .filter(endpoint => this.endpoints.get(endpoint).isExpanded)
      .map(endpoint => this.toggleEndpoint(endpoint));
    
    await Promise.all(collapsePromises);
    this.emit('collapsed-all');
  }

  /**
   * Save user preferences
   */
  savePreferences() {
    if (!this.options.storePreferences) return;
    
    const preferences = {
      filter: this.currentFilter,
      expandedEndpoints: [],
      timestamp: Date.now()
    };
    
    // Save expanded endpoints
    this.endpoints.forEach((data, endpoint) => {
      if (data.isExpanded) {
        preferences.expandedEndpoints.push(endpoint.id);
      }
    });
    
    try {
      localStorage.set(`${this.options.namespace}.preferences`, preferences);
    } catch (error) {
      console.warn('Failed to save OpenAPI preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  loadPreferences() {
    if (!this.options.storePreferences) return;
    
    try {
      const preferences = localStorage.get(`${this.options.namespace}.preferences`);
      if (preferences) {
        
        // Apply filter
        if (preferences.filter && preferences.filter !== 'all') {
          setTimeout(() => this.filterByTag(preferences.filter), 100);
        }
        
        // Expand previously expanded endpoints
        if (preferences.expandedEndpoints && preferences.expandedEndpoints.length > 0) {
          setTimeout(() => {
            preferences.expandedEndpoints.forEach(endpointId => {
              const endpoint = $(`#${endpointId}`);
              if (endpoint && this.endpoints.has(endpoint)) {
                const endpointData = this.endpoints.get(endpoint);
                if (!endpointData.isExpanded) {
                  this.toggleEndpoint(endpoint);
                }
              }
            });
          }, 200);
        }
      }
    } catch (error) {
      console.warn('Failed to load OpenAPI preferences:', error);
    }
  }

  /**
   * Get component statistics
   */
  getStats() {
    let expanded = 0;
    let collapsed = 0;
    
    this.endpoints.forEach(data => {
      if (data.isExpanded) {
        expanded++;
      } else {
        collapsed++;
      }
    });
    
    return {
      totalEndpoints: this.endpoints.size,
      expanded,
      collapsed,
      currentFilter: this.currentFilter,
      filteredCount: this.getFilteredCount(),
      metadata: this.metadata
    };
  }

  /**
   * Custom cleanup
   */
  onDestroy() {
    // Clean up endpoint references
    this.endpoints.forEach((data, endpoint) => {
      endpoint.removeAttribute('data-openapi-component');
    });
    this.endpoints.clear();
  }
}

// Auto-register component
ComponentManager.register('openapi-viewer', OpenAPIViewer);