/**
 * EndpointData Component
 * Handles endpoint data extraction, parsing, and statistics building
 */

import { Component } from '../../../core/ComponentManager.js';

export class EndpointData extends Component {
  constructor(config = {}) {
    super({
      name: 'endpoint-data',
      selector: config.selector || '.endpoint-item',
      ...config
    });
  }

  /**
   * Initialize endpoint data for all endpoints
   */
  static initializeEndpointData(endpoints, generateEndpointId) {
    endpoints.forEach(endpoint => {
      const data = {
        element: endpoint,
        id: endpoint.id || generateEndpointId(endpoint),
        tags: EndpointData.extractTags(endpoint),
        method: EndpointData.extractMethod(endpoint),
        path: EndpointData.extractPath(endpoint),
        summary: EndpointData.extractSummary(endpoint),
        deprecated: EndpointData.isDeprecated(endpoint),
        visible: true
      };
      
      // Store data on element for quick access
      endpoint._filterData = data;
    });
  }

  /**
   * Generate a unique ID for an endpoint
   */
  static generateEndpointId(endpoint) {
    const method = EndpointData.extractMethod(endpoint);
    const path = EndpointData.extractPath(endpoint);
    return `${method}-${path}`.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  }

  /**
   * Extract tags from endpoint element
   */
  static extractTags(endpoint) {
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
  static extractMethod(endpoint) {
    const methodElement = endpoint.querySelector('.http-method');
    if (methodElement) {
      return methodElement.textContent.trim().toUpperCase();
    }
    return endpoint.getAttribute('data-method') || 'UNKNOWN';
  }

  /**
   * Extract path from endpoint
   */
  static extractPath(endpoint) {
    const pathElement = endpoint.querySelector('.endpoint-path');
    if (pathElement) {
      return pathElement.textContent.trim();
    }
    return endpoint.getAttribute('data-path') || '/';
  }

  /**
   * Extract summary from endpoint
   */
  static extractSummary(endpoint) {
    const summaryElement = endpoint.querySelector('.endpoint-summary');
    return summaryElement ? summaryElement.textContent.trim() : '';
  }

  /**
   * Check if endpoint is deprecated
   */
  static isDeprecated(endpoint) {
    return endpoint.querySelector('.deprecated-badge') !== null;
  }

  /**
   * Build statistics for filter options
   */
  static buildFilterStats(endpoints) {
    const filterStats = new Map();
    const tagCounts = new Map();
    const methodCounts = new Map();
    
    endpoints.forEach(endpoint => {
      const data = endpoint._filterData;
      
      // Count tags
      data.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      
      // Count methods
      methodCounts.set(data.method, (methodCounts.get(data.method) || 0) + 1);
    });
    
    filterStats.set('tags', tagCounts);
    filterStats.set('methods', methodCounts);
    
    return filterStats;
  }

  /**
   * Update filter button labels with statistics
   */
  static updateFilterButtonStats(tagFilters, methodFilters, filterStats) {
    // Update tag filter stats
    tagFilters.forEach(button => {
      const tag = button.getAttribute('data-tag');
      if (tag && tag !== 'all') {
        const count = filterStats.get('tags').get(tag) || 0;
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
      }
    });
    
    // Update method filter stats
    methodFilters.forEach(button => {
      const method = button.getAttribute('data-method');
      if (method && method !== 'all') {
        const count = filterStats.get('methods').get(method) || 0;
        const label = button.textContent.replace(/\s*\(\d+\)$/, '');
        button.textContent = `${label} (${count})`;
      }
    });
  }

  /**
   * Get endpoint data for specific endpoint
   */
  static getEndpointData(endpoint) {
    return endpoint._filterData;
  }

  /**
   * Update endpoint data
   */
  static updateEndpointData(endpoint, updates) {
    if (endpoint._filterData) {
      Object.assign(endpoint._filterData, updates);
    }
  }

  /**
   * Clean up endpoint data
   */
  static cleanupEndpointData(endpoints) {
    endpoints.forEach(endpoint => {
      delete endpoint._filterData;
    });
  }

  /**
   * Get all endpoint data as array
   */
  static getAllEndpointData(endpoints) {
    return endpoints.map(endpoint => endpoint._filterData).filter(data => data);
  }

  /**
   * Find endpoints matching criteria
   */
  static findEndpoints(endpoints, criteria) {
    return endpoints.filter(endpoint => {
      const data = endpoint._filterData;
      if (!data) return false;

      for (const [key, value] of Object.entries(criteria)) {
        if (key === 'tags') {
          if (!data.tags.some(tag => value.includes(tag))) {
            return false;
          }
        } else if (data[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get statistics summary
   */
  static getStatsSummary(endpoints, filterStats) {
    const allData = EndpointData.getAllEndpointData(endpoints);
    
    return {
      totalEndpoints: endpoints.length,
      methodDistribution: Object.fromEntries(filterStats.get('methods') || new Map()),
      tagDistribution: Object.fromEntries(filterStats.get('tags') || new Map()),
      deprecatedCount: allData.filter(data => data.deprecated).length,
      uniqueTags: filterStats.get('tags')?.size || 0,
      uniqueMethods: filterStats.get('methods')?.size || 0
    };
  }

  /**
   * Validate endpoint data integrity
   */
  static validateEndpointData(endpoints) {
    const issues = [];
    
    endpoints.forEach((endpoint, index) => {
      const data = endpoint._filterData;
      
      if (!data) {
        issues.push(`Endpoint ${index}: Missing filter data`);
        return;
      }
      
      if (!data.method || data.method === 'UNKNOWN') {
        issues.push(`Endpoint ${index}: Invalid or missing HTTP method`);
      }
      
      if (!data.path || data.path === '/') {
        issues.push(`Endpoint ${index}: Invalid or missing path`);
      }
      
      if (!Array.isArray(data.tags)) {
        issues.push(`Endpoint ${index}: Invalid tags format`);
      }
    });
    
    return issues;
  }

  /**
   * Export endpoint data for analysis
   */
  static exportEndpointData(endpoints) {
    const allData = EndpointData.getAllEndpointData(endpoints);
    
    return {
      timestamp: new Date().toISOString(),
      totalCount: allData.length,
      endpoints: allData.map(data => ({
        id: data.id,
        method: data.method,
        path: data.path,
        tags: data.tags,
        summary: data.summary,
        deprecated: data.deprecated,
        visible: data.visible
      }))
    };
  }

  /**
   * Search endpoints by text
   */
  static searchEndpoints(endpoints, query) {
    if (!query || query.trim().length === 0) {
      return endpoints;
    }
    
    const searchText = query.toLowerCase().trim();
    
    return endpoints.filter(endpoint => {
      const data = endpoint._filterData;
      if (!data) return false;
      
      const searchableText = `${data.path} ${data.summary} ${data.tags.join(' ')}`.toLowerCase();
      return searchableText.includes(searchText);
    });
  }
}

// Auto-register component
import { ComponentManager } from '../../../core/ComponentManager.js';
ComponentManager.register('endpoint-data', EndpointData);