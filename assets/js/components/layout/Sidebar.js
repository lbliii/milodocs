/**
 * Sidebar Component
 * Handles sidebar navigation with expand/collapse functionality
 */

import { Component } from '../../core/ComponentManager.js';

export class Sidebar extends Component {
  constructor(config = {}) {
    super({
      name: 'navigation-sidebar-left',
      selector: config.selector || '#sidebar-left',
      ...config
    });
    
    this.toggles = [];
    this.currentPath = window.location.pathname;
    this.isInitialized = false;
    this.linkTreeElement = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('Sidebar: Sidebar element not found');
      return;
    }

    // Find the linkTree element within the sidebar
    this.linkTreeElement = this.findChild('#linkTree');
    if (!this.linkTreeElement) {
      console.warn('Sidebar: LinkTree element not found within sidebar');
      return;
    }

    console.log('Sidebar: Sidebar and LinkTree elements found');
    this.toggles = Array.from(this.linkTreeElement.querySelectorAll('.expand-toggle'));
    
    if (this.toggles.length === 0) {
      console.warn('Sidebar: No toggle elements found');
      return;
    }

    this.setupEventListeners();
    this.expandCurrentPath();
    this.setupAccessibility();
    
    // Mark as initialized for animations
    this.element.classList.add('initialized');
    this.linkTreeElement.classList.add('initialized');
    this.isInitialized = true;
    
    console.log(`Sidebar: Initialized with ${this.toggles.length} toggles`);
  }

  /**
   * Setup event listeners for toggles
   */
  setupEventListeners() {
    this.toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleToggleClick(toggle);
      });
    });
  }

  /**
   * Handle toggle button clicks
   */
  handleToggleClick(toggle) {
    const listItem = toggle.closest('li');
    const nestedContent = listItem.querySelector('.nested-content');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    this.toggleContent(toggle, !isExpanded);
    
    this.emit('sidebar:toggled', {
      toggle,
      expanded: !isExpanded,
      listItem
    });
  }

  /**
   * Toggle content visibility with animation
   */
  toggleContent(toggle, expand) {
    const listItem = toggle.closest('li');
    const nestedContent = listItem.querySelector('.nested-content');
    const svg = toggle.querySelector('svg');

    if (!nestedContent) return;

    if (expand) {
      // Expand content
      if (this.isInitialized) {
        nestedContent.classList.add('expanding');
        setTimeout(() => {
          nestedContent.classList.remove('expanding');
          nestedContent.classList.add('expanded');
        }, 300);
      } else {
        nestedContent.classList.add('expanded');
      }
      toggle.setAttribute('aria-expanded', 'true');
      svg?.classList.add('rotate-90');
    } else {
      // Collapse content
      if (this.isInitialized) {
        nestedContent.classList.add('collapsing');
        setTimeout(() => {
          nestedContent.classList.remove('collapsing', 'expanded');
        }, 300);
      } else {
        nestedContent.classList.remove('expanded');
      }
      toggle.setAttribute('aria-expanded', 'false');
      svg?.classList.remove('rotate-90');
    }
  }

  /**
   * Expand the path to current page
   */
  expandCurrentPath() {
    const currentLink = this.linkTreeElement.querySelector(`a[href="${this.currentPath}"]`);
    if (!currentLink) return;
    
    // Mark current link as active
    currentLink.classList.add('sidebar-link--active');
    
    // Expand parent sections
    let parent = currentLink.closest('li');
    while (parent) {
      const parentToggle = parent.querySelector('.expand-toggle');
      if (parentToggle) {
        this.toggleContent(parentToggle, true);
      }
      
      // Move up to parent li
      parent = parent.parentElement?.closest('li');
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Keyboard navigation
    this.linkTreeElement.addEventListener('keydown', (e) => {
      const focusedElement = document.activeElement;
      
      if (e.key === 'ArrowRight') {
        const toggle = focusedElement.querySelector('.expand-toggle');
        if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
          e.preventDefault();
          this.handleToggleClick(toggle);
        }
      } else if (e.key === 'ArrowLeft') {
        const toggle = focusedElement.querySelector('.expand-toggle');
        if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
          e.preventDefault();
          this.handleToggleClick(toggle);
        }
      }
    });
    
    // Set proper ARIA attributes
    this.toggles.forEach(toggle => {
      if (!toggle.hasAttribute('aria-expanded')) {
        toggle.setAttribute('aria-expanded', 'false');
      }
      if (!toggle.hasAttribute('role')) {
        toggle.setAttribute('role', 'button');
      }
    });
  }

  /**
   * Expand all sections
   */
  expandAll() {
    this.toggles.forEach(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'false') {
        this.toggleContent(toggle, true);
      }
    });
    this.emit('sidebar:expandedAll');
  }

  /**
   * Collapse all sections
   */
  collapseAll() {
    this.toggles.forEach(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        this.toggleContent(toggle, false);
      }
    });
    this.emit('sidebar:collapsedAll');
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('Sidebar: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('navigation-sidebar-left', Sidebar);