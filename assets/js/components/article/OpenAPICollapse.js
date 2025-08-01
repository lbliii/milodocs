/**
 * OpenAPI Collapse Component
 * Enhanced collapse functionality specifically for OpenAPI documentation
 * Extends the base ArticleCollapse with OpenAPI-specific features
 */

import { ArticleCollapse } from './Collapse.js';
import { ComponentManager } from '../../core/ComponentManager.js';
import { $$, $ } from '../../utils/index.js';

export class OpenAPICollapse extends ArticleCollapse {
  constructor(config = {}) {
    super({
      name: 'openapi-collapse',
      selector: config.selector || '.openapi-spec .collapse__header',
      ...config
    });
    
    this.options = {
      animationDuration: 400,
      storeState: true,
      namespace: 'openapi-collapse',
      autoExpandSchemas: false,
      groupBySection: true,
      ...this.options
    };
    
    this.sectionGroups = new Map();
  }

  /**
   * Setup elements with OpenAPI-specific enhancements
   */
  setupElements() {
    // Initialize parent class state first
    if (!this.toggles) {
      this.toggles = new Map();
    }
    
    // Don't call super.setupElements() because it uses hardcoded '.toggle-collapse'
    // Instead, implement our own element finding logic
    
    // Find all collapse toggles using our selector
    this.collapseToggles = $$(this.selector);
    
    if (this.collapseToggles.length === 0) {
      console.log('No OpenAPI collapse toggles found on page');
      return;
    }
    
    console.log(`Found ${this.collapseToggles.length} OpenAPI collapse toggles`);
    
    // Setup each toggle using parent class method
    this.collapseToggles.forEach(toggle => this.setupToggle(toggle));
    
    // Setup event listeners  
    this.bindEvents();
    
    // Group collapses by section for better management
    if (this.options.groupBySection) {
      this.groupCollapsesBySection();
    }
    
    // Auto-expand certain sections based on preferences
    this.autoExpandSections();
  }

  /**
   * Override parent bindEvents to use our selector
   */
  bindEvents() {
    // Use event delegation for OpenAPI collapse headers
    this.addEventListener(document, 'click', (e) => {
      const toggle = e.target.closest('.collapse__header');
      if (toggle && this.toggles.has(toggle)) {
        e.preventDefault();
        this.handleToggleClick(toggle);
      }
    });
    
    // Keyboard support
    this.addEventListener(document, 'keydown', (e) => {
      const toggle = e.target.closest('.collapse__header');
      if (toggle && this.toggles.has(toggle)) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleToggleClick(toggle);
        }
      }
    });
  }

  /**
   * Group collapse elements by their parent sections
   */
  groupCollapsesBySection() {
    this.collapseToggles.forEach(toggle => {
      const section = toggle.closest('.openapi-endpoints, .openapi-components, .openapi-security');
      if (section) {
        const sectionName = this.getSectionName(section);
        if (!this.sectionGroups.has(sectionName)) {
          this.sectionGroups.set(sectionName, []);
        }
        this.sectionGroups.get(sectionName).push(toggle);
      }
    });
    
    console.log('Grouped OpenAPI collapses by section:', Object.fromEntries(this.sectionGroups));
  }

  /**
   * Get section name from section element
   */
  getSectionName(section) {
    if (section.classList.contains('openapi-endpoints')) return 'endpoints';
    if (section.classList.contains('openapi-components')) return 'components';
    if (section.classList.contains('openapi-security')) return 'security';
    return 'unknown';
  }

  /**
   * Auto-expand certain sections based on options
   */
  autoExpandSections() {
    if (this.options.autoExpandSchemas) {
      // Auto-expand schema components
      const schemaToggles = $$('.openapi-components .component-item .collapse__header');
      schemaToggles.forEach(toggle => {
        setTimeout(() => this.expandToggle(toggle), 100);
      });
    }
  }

  /**
   * Enhanced setup for individual toggles with OpenAPI context
   */
  setupToggle(toggle) {
    super.setupToggle(toggle);
    
    // Add OpenAPI-specific context
    const toggleData = this.toggles.get(toggle);
    if (toggleData) {
      // Determine toggle type
      toggleData.type = this.getToggleType(toggle);
      
      // Add schema depth for nested schemas
      if (toggleData.type === 'schema') {
        toggleData.depth = this.getSchemaDepth(toggle);
      }
      
      // Add HTTP method for endpoints
      if (toggleData.type === 'endpoint') {
        const endpointItem = toggle.closest('.endpoint-item');
        if (endpointItem) {
          toggleData.method = endpointItem.getAttribute('data-method');
          toggleData.path = endpointItem.getAttribute('data-path');
        }
      }
    }
  }

  /**
   * Determine the type of toggle (endpoint, schema, component, etc.)
   */
  getToggleType(toggle) {
    if (toggle.closest('.endpoint-item')) return 'endpoint';
    if (toggle.closest('.component-item')) return 'component';
    if (toggle.closest('.security-scheme-requirement')) return 'security';
    if (toggle.closest('.schema-container')) return 'schema';
    return 'generic';
  }

  /**
   * Get schema nesting depth
   */
  getSchemaDepth(toggle) {
    const schemaContainer = toggle.closest('.schema-container');
    if (schemaContainer) {
      const level = schemaContainer.getAttribute('data-level');
      return level ? parseInt(level, 10) : 0;
    }
    return 0;
  }

  /**
   * Enhanced expand with OpenAPI-specific animations
   */
  async expand(toggle, toggleData) {
    const { content, type, depth } = toggleData;
    
    // Add expanding class for custom animations
    content.classList.add('openapi-expanding');
    
    // Call parent expand method
    await super.expand(toggle, toggleData);
    
    // Add type-specific classes
    content.classList.add(`openapi-${type}-expanded`);
    
    // Handle nested schema animations
    if (type === 'schema' && depth > 0) {
      content.style.animationDelay = `${depth * 50}ms`;
    }
    
    // Remove expanding class
    content.classList.remove('openapi-expanding');
    
    // Initialize any OpenAPI-specific components in the expanded content
    this.initializeExpandedContent(content, type);
    
    this.emit('openapi-expanded', { toggle, type, depth, method: toggleData.method, path: toggleData.path });
  }

  /**
   * Enhanced collapse with OpenAPI-specific cleanup
   */
  async collapse(toggle, toggleData) {
    const { content, type } = toggleData;
    
    // Add collapsing class
    content.classList.add('openapi-collapsing');
    
    // Call parent collapse method
    await super.collapse(toggle, toggleData);
    
    // Remove type-specific classes
    content.classList.remove(`openapi-${type}-expanded`, 'openapi-collapsing');
    
    this.emit('openapi-collapsed', { toggle, type });
  }

  /**
   * Initialize OpenAPI-specific components in expanded content
   */
  initializeExpandedContent(content, type) {
    // Initialize syntax highlighting for code blocks
    const codeBlocks = content.querySelectorAll('pre code[class*="language-"]');
    if (codeBlocks.length > 0 && window.Prism) {
      codeBlocks.forEach(block => {
        window.Prism.highlightElement(block);
      });
    }
    
    // Initialize copy buttons if not already initialized
    const copyButtons = content.querySelectorAll('.copy-button:not([data-initialized])');
    copyButtons.forEach(button => {
      button.setAttribute('data-initialized', 'true');
      // Copy functionality is handled by the main OpenAPIViewer component
    });
    
    // Initialize nested collapse elements
    const nestedToggles = content.querySelectorAll('.collapse__header:not([data-openapi-collapse])');
    nestedToggles.forEach(nestedToggle => {
      this.setupToggle(nestedToggle);
      nestedToggle.setAttribute('data-openapi-collapse', this.id);
    });
  }

  /**
   * Expand all toggles in a specific section
   */
  async expandSection(sectionName) {
    const toggles = this.sectionGroups.get(sectionName);
    if (toggles) {
      const expandPromises = toggles
        .filter(toggle => !this.toggles.get(toggle)?.isExpanded)
        .map(toggle => this.expandToggle(toggle));
      
      await Promise.all(expandPromises);
      this.emit('section-expanded', { section: sectionName, count: toggles.length });
    }
  }

  /**
   * Collapse all toggles in a specific section
   */
  async collapseSection(sectionName) {
    const toggles = this.sectionGroups.get(sectionName);
    if (toggles) {
      const collapsePromises = toggles
        .filter(toggle => this.toggles.get(toggle)?.isExpanded)
        .map(toggle => this.collapseToggle(toggle));
      
      await Promise.all(collapsePromises);
      this.emit('section-collapsed', { section: sectionName, count: toggles.length });
    }
  }

  /**
   * Expand all schemas up to a certain depth
   */
  async expandSchemasByDepth(maxDepth = 2) {
    const schemaPromises = Array.from(this.toggles.entries())
      .filter(([toggle, data]) => {
        return data.type === 'schema' && 
               data.depth <= maxDepth && 
               !data.isExpanded;
      })
      .map(([toggle]) => this.expandToggle(toggle));
    
    await Promise.all(schemaPromises);
    this.emit('schemas-expanded-by-depth', { maxDepth, count: schemaPromises.length });
  }

  /**
   * Enhanced storage key generation with OpenAPI context
   */
  getStorageKey(toggle) {
    const toggleData = this.toggles.get(toggle);
    const baseKey = super.getStorageKey(toggle);
    
    if (toggleData?.type === 'endpoint' && toggleData.method && toggleData.path) {
      return `${this.options.namespace}.endpoint.${toggleData.method}.${toggleData.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    
    if (toggleData?.type && toggleData.content.id) {
      return `${this.options.namespace}.${toggleData.type}.${toggleData.content.id}`;
    }
    
    return baseKey;
  }

  /**
   * Get enhanced statistics with OpenAPI context
   */
  getStats() {
    const baseStats = super.getStats();
    
    // Add section-based statistics
    const sectionStats = {};
    this.sectionGroups.forEach((toggles, sectionName) => {
      sectionStats[sectionName] = {
        total: toggles.length,
        expanded: toggles.filter(toggle => this.toggles.get(toggle)?.isExpanded).length,
        collapsed: toggles.filter(toggle => !this.toggles.get(toggle)?.isExpanded).length
      };
    });
    
    // Add type-based statistics
    const typeStats = {};
    this.toggles.forEach(data => {
      const type = data.type || 'unknown';
      if (!typeStats[type]) {
        typeStats[type] = { total: 0, expanded: 0, collapsed: 0 };
      }
      typeStats[type].total++;
      if (data.isExpanded) {
        typeStats[type].expanded++;
      } else {
        typeStats[type].collapsed++;
      }
    });
    
    return {
      ...baseStats,
      sections: sectionStats,
      types: typeStats
    };
  }

  /**
   * Custom cleanup with OpenAPI-specific cleanup
   */
  onDestroy() {
    super.onDestroy();
    
    // Clear section groups
    this.sectionGroups.clear();
    
    // Remove OpenAPI-specific attributes
    this.collapseToggles.forEach(toggle => {
      toggle.removeAttribute('data-openapi-collapse');
    });
  }
}

// Auto-register component
ComponentManager.register('openapi-collapse', OpenAPICollapse);