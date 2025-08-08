/**
 * OpenAPI Collapse Component
 * Extends the base Collapse component with OpenAPI-specific functionality
 * Handles responses, schemas, endpoints, and other OpenAPI documentation elements
 * Now uses the new StateManager system for consistent behavior
 */

import { Collapse } from '../ui/Collapse.js';

class OpenAPICollapse extends Collapse {
  constructor(config = {}) {
    super({
      name: 'openapi-collapse',
      selector: '.openapi-spec .collapse__header, .openapi-components .collapse__header, .responses-container .collapse__header, .response-header.collapse__header, .endpoint-group .collapse__header, .component-header.collapse__header',
      ...config
    });

    this.options = {
      animationDuration: 300,
      storeState: true,
      namespace: 'openapi-collapse',
      groupBySection: true,
      autoExpandSchemas: false,
      ...this.options
    };

    this.sectionGroups = new Map();
  }

  /**
   * Enhanced setup for OpenAPI elements
   */
  setupCollapseElements() {
    super.setupCollapseElements();
    
    if (this.options.groupBySection) {
      this.organizeBySections();
    }

    // Auto-expand certain elements if configured
    if (this.options.autoExpandSchemas) {
      this.autoExpandSchemas();
    }
  }

  /**
   * Initialize OpenAPI-specific collapse header with enhanced metadata
   */
  initializeCollapseHeader(header) {
    // Call parent initialization
    super.initializeCollapseHeader(header);

    const target = header.getAttribute('data-target');
    const collapseData = this.collapseElements.get(target);

    if (!collapseData) return;

    // Add OpenAPI-specific metadata
    collapseData.section = this.identifySection(header);
    collapseData.type = this.identifyType(header);
    collapseData.priority = this.calculatePriority(header);



    // Store enhanced data
    this.collapseElements.set(target, collapseData);
  }

  /**
   * Identify which OpenAPI section this collapse belongs to
   */
  identifySection(header) {
    if (header.closest('.responses-container')) return 'responses';
    if (header.closest('.openapi-components')) return 'components';
    if (header.closest('.endpoint-group')) return 'endpoints';
    if (header.closest('.openapi-spec')) return 'spec';
    return 'unknown';
  }

  /**
   * Identify the type of OpenAPI element
   */
  identifyType(header) {
    // Check for component types
    if (header.classList.contains('component-header')) {
      const schemaName = header.getAttribute('data-schema-name');
      if (schemaName) return 'schema';
    }

    // Check for response types
    if (header.classList.contains('response-header')) {
      return 'response';
    }

    // Check for endpoint types
    if (header.closest('.endpoint-item')) {
      return 'endpoint';
    }

    return 'generic';
  }

  /**
   * Calculate priority for auto-expansion logic
   */
  calculatePriority(header) {
    // Higher priority = more likely to auto-expand
    if (header.classList.contains('response-header')) {
      const statusCode = header.querySelector('.status-code')?.textContent;
      if (statusCode?.startsWith('2')) return 10; // Success responses
      if (statusCode === 'default') return 5;     // Default responses
      return 3;
    }

    if (header.classList.contains('component-header')) {
      return 7; // Component schemas
    }

    return 1; // Everything else
  }

  /**
   * Organize collapse elements by section for bulk operations
   */
  organizeBySections() {
    this.collapseElements.forEach((collapseData, targetId) => {
      const section = collapseData.section;
      
      if (!this.sectionGroups.has(section)) {
        this.sectionGroups.set(section, []);
      }
      
      this.sectionGroups.get(section).push(targetId);
    });

    
  }

  /**
   * Auto-expand schema components if configured
   */
  autoExpandSchemas() {
    const schemaElements = Array.from(this.collapseElements.values())
      .filter(data => data.type === 'schema')
      .sort((a, b) => b.priority - a.priority);

    schemaElements.slice(0, 3).forEach(collapseData => {
      if (!collapseData.isExpanded) {
        this.expand(collapseData);
      }
    });
  }

  /**
   * Enhanced expand with OpenAPI-specific logic
   */
  expand(collapseData) {
    super.expand(collapseData);

    // Special handling for response details
    if (collapseData.type === 'response') {
      this.handleResponseExpansion(collapseData);
    }

    // Initialize any nested components in expanded content
    this.initializeExpandedContent(collapseData.target, collapseData.type);

    // Emit OpenAPI-specific event
    this.emit('openapi:expanded', {
      targetId: collapseData.targetId,
      section: collapseData.section,
      type: collapseData.type
    });
  }

  /**
   * Handle special response expansion logic using enhanced Component base class
   */
  handleResponseExpansion(collapseData) {
    const { target, header } = collapseData;
    
    if (target && target.classList.contains('response-details')) {
      // Set transitioning first to trigger CSS transitions
      target.setAttribute('data-collapse-state', 'transitioning');
      header.setAttribute('aria-expanded', 'true');
      
      // Use requestAnimationFrame to ensure transition triggers
      requestAnimationFrame(() => {
        target.setAttribute('data-collapse-state', 'expanded');
      });
    }
  }

  /**
   * Handle response collapse
   */
  handleResponseCollapse(collapseData) {
    const { target, header } = collapseData;
    
    if (target && target.classList.contains('response-details')) {
      // Set transitioning first to trigger CSS transitions
      target.setAttribute('data-collapse-state', 'transitioning');
      header.setAttribute('aria-expanded', 'false');
      
      // Use requestAnimationFrame to ensure transition triggers
      requestAnimationFrame(() => {
        target.setAttribute('data-collapse-state', 'collapsed');
      });
    }
  }

  /**
   * Enhanced collapse with OpenAPI-specific cleanup
   */
  collapse(collapseData) {
    // Handle response-specific collapse
    if (collapseData.type === 'response') {
      this.handleResponseCollapse(collapseData);
    }

    super.collapse(collapseData);

    // Emit OpenAPI-specific event
    this.emit('openapi:collapsed', {
      targetId: collapseData.targetId,
      section: collapseData.section,
      type: collapseData.type
    });
  }

  /**
   * Initialize components within expanded OpenAPI content
   */
  initializeExpandedContent(target, type) {
    // Initialize syntax highlighting for code blocks
    const codeBlocks = target.querySelectorAll('pre code[class*="language-"]');
    if (codeBlocks.length > 0 && window.Prism) {
      codeBlocks.forEach(block => {
        if (!block.classList.contains('prism-highlighted')) {
          window.Prism.highlightElement(block);
          block.classList.add('prism-highlighted');
        }
      });
    }

    // Initialize copy buttons for code examples
    const copyButtons = target.querySelectorAll('.copy-btn:not([data-initialized])');
    copyButtons.forEach(button => {
      button.setAttribute('data-initialized', 'true');
      // Copy button initialization would go here
    });

    // For response sections, ensure proper schema rendering
    if (type === 'response') {
      this.enhanceResponseSchemas(target);
    }
  }

  /**
   * Enhance schema display within response content
   */
  enhanceResponseSchemas(responseTarget) {
    const schemaContainers = responseTarget.querySelectorAll('.schema-container');
    schemaContainers.forEach(container => {
      // Add enhanced styling classes based on schema type
      const typeBadge = container.querySelector('.type-badge');
      if (typeBadge) {
        const schemaType = typeBadge.textContent.replace(/[\[\]]/g, '');
        container.classList.add(`schema-type--${schemaType}`);
      }
    });
  }

  /**
   * Public API: Expand all elements in a specific section
   */
  expandSection(sectionName) {
    const sectionElements = this.sectionGroups.get(sectionName) || [];
    sectionElements.forEach(targetId => {
      this.expandElement(targetId);
    });
  }

  /**
   * Public API: Collapse all elements in a specific section
   */
  collapseSection(sectionName) {
    const sectionElements = this.sectionGroups.get(sectionName) || [];
    sectionElements.forEach(targetId => {
      this.collapseElement(targetId);
    });
  }

  /**
   * Public API: Get statistics about collapse state
   */
  getStats() {
    const stats = {
      total: this.collapseElements.size,
      expanded: 0,
      collapsed: 0,
      sections: {}
    };

    this.sectionGroups.forEach((elements, section) => {
      stats.sections[section] = {
        total: elements.length,
        expanded: 0,
        collapsed: 0
      };
    });

    this.collapseElements.forEach((collapseData) => {
      if (collapseData.isExpanded) {
        stats.expanded++;
        if (collapseData.section) {
          stats.sections[collapseData.section].expanded++;
        }
      } else {
        stats.collapsed++;
        if (collapseData.section) {
          stats.sections[collapseData.section].collapsed++;
        }
      }
    });

    return stats;
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('openapi-collapse', OpenAPICollapse);

// Export for use by other components
export { OpenAPICollapse };
export default OpenAPICollapse;