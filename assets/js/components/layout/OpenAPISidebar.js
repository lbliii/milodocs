/** OpenAPI Sidebar Component */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { ExpandableMixin, ScrollTrackingMixin } from '../index.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('OpenAPISidebar');

export class OpenAPISidebar extends Component {
  constructor(config = {}) {
    super({
      name: 'openapi-sidebar',
      selector: config.selector || '[data-component="openapi-sidebar"]',
      ...config
    });
    
    this.isInitialized = false;
  }

  async onInit() {
    if (!this.element) {
      log.warn('OpenAPI Sidebar element not found');
      return;
    }

    this.initExpandable({
      toggleSelector: '.openapi-sidebar-tag-toggle',
      contentSelector: '.openapi-sidebar-endpoints-list',
      animationTiming: 'fast',
      autoExpand: true // OpenAPI tags are expanded by default
    });
    
    this.initScrollTracking({
      activeClass: 'openapi-sidebar-link--active',
      offset: 100,
      smoothScroll: true,
      throttleDelay: 50
    });
    
    this.setupOpenAPISpecificBehavior();
    this.isInitialized = true;
    
    log.info('OpenAPI Sidebar initialized');
  }

  /**
   * Setup OpenAPI-specific behavior that's not covered by mixins
   */
  setupOpenAPISpecificBehavior() {
    // Handle initial hash navigation
    if (window.location.hash) {
      setTimeout(() => {
        this.scrollToId(window.location.hash.substring(1));
      }, 100);
    }
    
    // Setup custom active link behavior for OpenAPI endpoints
    this.on('scroll-target-active', (data) => {
      this.handleOpenAPIActiveLink(data.link);
    });
    
    // Setup custom toggle behavior for OpenAPI tag groups
    this.on('after-toggle', (data) => {
      this.handleOpenAPIToggle(data.toggle, data.expanded);
    });
    
    
  }

  /**
   * Handle OpenAPI-specific active link behavior
   * Called when ScrollTrackingMixin detects a new active target
   */
  handleOpenAPIActiveLink(link) {
    // Update URL hash for deep linking
    const targetId = link.getAttribute('data-scroll-target');
    if (targetId && history.pushState) {
      history.pushState(null, null, `#${targetId}`);
    }
    
    // Apply OpenAPI-specific active classes
    const isEndpointLink = link.classList.contains('openapi-sidebar-endpoint-link');
    const activeClass = isEndpointLink ? 'openapi-sidebar-endpoint-link--active' : 'openapi-sidebar-link--active';
    
    // Remove existing OpenAPI active classes
    this.element.querySelectorAll('.openapi-sidebar-link--active, .openapi-sidebar-endpoint-link--active')
      .forEach(el => el.classList.remove('openapi-sidebar-link--active', 'openapi-sidebar-endpoint-link--active'));
    
    // Add OpenAPI-specific active class
    link.classList.add(activeClass);
    
    // Auto-expand parent tag group if this is an endpoint
    if (isEndpointLink) {
      this.expandParentTagGroup(link);
    }
    
    
  }

  /**
   * Handle OpenAPI-specific toggle behavior
   * Called when ExpandableMixin completes a toggle action
   */
  handleOpenAPIToggle(toggle, expanded) {
    // Apply OpenAPI-specific styling
    toggle.classList.toggle('openapi-sidebar-tag-toggle--expanded', expanded);
    
    
  }

  /**
   * Expand parent tag group for an endpoint link
   * @param {Element} link - The endpoint link element
   */
  expandParentTagGroup(link) {
    const parentGroup = link.closest('.openapi-sidebar-tag-group');
    if (!parentGroup) return;
    
          const toggle = parentGroup.querySelector('.openapi-sidebar-tag-toggle');
          if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
      // Use mixin's expandToggle method
      this.expandToggle(toggle);
    }
  }

  // Public API methods using mixins
  expandAllGroups() {
    // Use ExpandableMixin's expandAll method
    this.expandAll();
  }

  collapseAllGroups() {
    // Use ExpandableMixin's collapseAll method
    this.collapseAll();
  }

  scrollToEndpoint(endpointId) {
    // Use ScrollTrackingMixin's scrollToId method
    this.scrollToId(endpointId);
  }
}

// Apply mixins to OpenAPISidebar prototype
Object.assign(OpenAPISidebar.prototype, ExpandableMixin);
Object.assign(OpenAPISidebar.prototype, ScrollTrackingMixin);

// Auto-register component
ComponentManager.register('openapi-sidebar', OpenAPISidebar);

export default OpenAPISidebar;