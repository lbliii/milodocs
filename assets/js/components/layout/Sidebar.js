/** Sidebar Component */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { ExpandableMixin, ResponsiveMixin } from '../index.js';
import { CurrentPageDetection } from '../../utils/CurrentPageDetection.js';
import { animationBridge } from '../../core/AnimationBridge.js';

export class Sidebar extends Component {
  constructor(config = {}) {
    super({
      name: 'navigation-sidebar-left',
      selector: config.selector || '#sidebar-left',
      ...config
    });
    
    this.linkTreeElement = null;
    this.isInitialized = false;
    this.currentPageDetector = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('Sidebar: Sidebar element not found');
      return;
    }

    this.linkTreeElement = this.findChild('#linkTree');
    if (!this.linkTreeElement) {
      console.warn('Sidebar: LinkTree element not found within sidebar');
      return;
    }

    // Reveal contents immediately to avoid opacity gating if later steps fail
    if (!this.linkTreeElement.classList.contains('initialized')) {
      this.linkTreeElement.classList.add('initialized');
    }
    
    this.initExpandable({
      toggleSelector: '.expand-toggle',
      contentSelector: '.nested-content',
      animationTiming: 'medium'
    });
    
    this.initResponsive({
      mobileBreakpoint: 768,
      overlaySelector: '#mobileNavOverlay'
    });
    
    const nestedContents = this.linkTreeElement.querySelectorAll('.nested-content');
    nestedContents.forEach((content) => {
      if (!content.hasAttribute('data-collapse-state')) {
        animationBridge.setCollapseState(content, 'collapsed');
      }
    });

    this.currentPageDetector = new CurrentPageDetection({
      activeClass: 'sidebar-link--active',
      parentItemSelector: 'li',
      toggleSelector: '.expand-toggle'
    });
    
    const found = this.currentPageDetector.init(this.linkTreeElement);
    if (found) {
      await this.currentPageDetector.expandParentSections(async (toggle, expand) => {
        await this.setToggleState(toggle, expand);
      });
    }
    
    this.setupKeyboardNavigation();
    
    this.element.classList.add('initialized');
    this.isInitialized = true;
    
    this.updateComponentState('ready');
  }

  /**
   * Setup keyboard navigation for accessibility
   */
  setupKeyboardNavigation() {
    this.addEventListener(this.linkTreeElement, 'keydown', async (e) => {
      const focusedElement = document.activeElement;
      
      if (e.key === 'ArrowRight') {
        const toggle = focusedElement.querySelector('.expand-toggle');
        if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
          e.preventDefault();
          await this.handleToggleClick(toggle);
        }
      } else if (e.key === 'ArrowLeft') {
        const toggle = focusedElement.querySelector('.expand-toggle');
        if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
          e.preventDefault();
          await this.handleToggleClick(toggle);
        }
      }
    });
  }

  // Toggle, responsive behavior, and current page detection are handled by mixins/utilities

  /**
   * Open mobile sidebar
   */
  open() {
    this.openMobile();
  }

  /**
   * Close mobile sidebar
   */
  close() {
    this.closeMobile();
  }

  /**
   * Force close sidebar (useful for cleanup)
   */
  forceClose() {
    this.forceCloseMobile();
  }

  /**
   * Toggle mobile sidebar
   */
  toggle() {
    this.toggleMobile();
  }

  /**
   * Reset sidebar to initial state (useful for debugging)
   */
  reset() {
    this.resetResponsiveState();
    this.emit('sidebar:reset');
  }

  /**
   * Enhanced health check for sidebar component
   * Uses modular health checks from mixins
   */
  isHealthy() {
    // Call parent health check first
    if (!super.isHealthy()) {
      return false;
    }
    
    // Sidebar-specific health checks
    if (!this.linkTreeElement || !document.contains(this.linkTreeElement)) {
      return false;
    }
    
    // Use expandable mixin health check
    if (!this.isExpandableHealthy()) {
      return false;
    }
    
    // Check current page detection
    if (this.currentPageDetector && !this.currentPageDetector.getCurrentPageInfo().found) {
      // This is not necessarily unhealthy, just log it
    }
    
    return true;
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // no-op
  }

  /**
   * Synchronize the sidebar to the current page
   * - Collapse all sections
   * - Expand ancestor sections of the current link
   * - Ensure current link is highlighted
   */
  async syncToCurrentPage() {
    try {
      if (!this.linkTreeElement) return false;

      // Update current page detection
      if (this.currentPageDetector) {
        this.currentPageDetector.updateCurrentPath();
      }

      // Find the current link
      let currentLink = this.linkTreeElement.querySelector('a.sidebar-item__link--active');
      if (!currentLink) {
        currentLink = this.linkTreeElement.querySelector('a[data-current="true"]');
      }
      if (!currentLink) {
        return false;
      }

      // Collapse all first to avoid mixed states
      if (typeof this.collapseAll === 'function') {
        await this.collapseAll();
      }

      // Collect ancestor toggles and expand from root downward
      const togglesToExpand = [];
      let parent = currentLink.closest('li');
      while (parent) {
        const toggle = parent.querySelector(':scope > .sidebar-item > .expand-toggle');
        if (toggle) togglesToExpand.push(toggle);
        parent = parent.parentElement?.closest('li');
      }

      for (let i = togglesToExpand.length - 1; i >= 0; i--) {
        const toggle = togglesToExpand[i];
        if (typeof this.expandToggle === 'function') {
          await this.expandToggle(toggle);
        } else if (typeof this.setToggleState === 'function') {
          await this.setToggleState(toggle, true);
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}

// Apply mixins to Sidebar prototype
Object.assign(Sidebar.prototype, ExpandableMixin);
Object.assign(Sidebar.prototype, ResponsiveMixin);

// Auto-register component
ComponentManager.register('navigation-sidebar-left', Sidebar);