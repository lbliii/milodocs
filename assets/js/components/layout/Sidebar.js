/**
 * Sidebar Component
 * Handles sidebar navigation with expand/collapse functionality
 */

import { Component } from '../../core/Component.js';
import { animationBridge } from '../../core/AnimationBridge.js';
import ComponentManager from '../../core/ComponentManager.js';

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
    this.isOpen = false; // Track mobile sidebar state
    this.resizeTimeout = null; // For debouncing resize events
  }

  async onInit() {
    if (!this.element) {
      console.warn('Sidebar: Sidebar element not found');
      return;
    }

    // 🚀 NEW: Enhanced initialization with loading states
    this.setLoadingState(true);
    this.updateComponentState('initializing');

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
    
    // Initialize mobile sidebar state based on current CSS classes
    this.initializeMobileState();
    
    // Ensure sidebar is closed on desktop view and properly positioned
    this.ensureProperState();
    
    // Mark as initialized for animations
    this.element.classList.add('initialized');
    this.linkTreeElement.classList.add('initialized');
    this.isInitialized = true;
    
    // 🚀 NEW: Initialization complete
    this.setLoadingState(false);
    this.updateComponentState('ready');
    
    console.log(`Sidebar: Initialized with ${this.toggles.length} toggles`);
  }

  /**
   * Setup event listeners for toggles
   */
  setupEventListeners() {
    this.toggles.forEach(toggle => {
      this.addEventListener(toggle, 'click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // ✅ FIXED: Handle async animation properly
        await this.handleToggleClick(toggle);
      });
    });
  }

  /**
   * Handle toggle button clicks - FIXED for async animation handling
   */
  async handleToggleClick(toggle) {
    const listItem = toggle.closest('li');
    const nestedContent = listItem.querySelector('.nested-content');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    // ✅ FIXED: Await the animation completion for better state management
    await this.toggleContent(toggle, !isExpanded);
    
    this.emit('sidebar:toggled', {
      toggle,
      expanded: !isExpanded,
      listItem
    });
  }

  /**
   * Toggle content visibility with animation - FIXED for better performance
   */
  async toggleContent(toggle, expand) {
    const listItem = toggle.closest('li');
    const nestedContent = listItem.querySelector('.nested-content');
    const svg = toggle.querySelector('svg');

    if (!nestedContent) return;

    // Update ARIA and visual state immediately for better UX
    toggle.setAttribute('aria-expanded', expand.toString());
    if (expand) {
      svg?.classList.add('rotate-90');
    } else {
      svg?.classList.remove('rotate-90');
    }

    if (expand) {
      // ✅ FIXED: Use proper animation bridge methods for smoother expansion
      if (this.isInitialized) {
        await animationBridge.expand(nestedContent, { timing: 'medium' });
      } else {
        // Instant expansion during initialization
        animationBridge.setCollapseState(nestedContent, 'expanded');
      }
    } else {
      // ✅ FIXED: Use proper animation bridge methods for smoother collapse
      if (this.isInitialized) {
        await animationBridge.collapse(nestedContent, { timing: 'medium' });
      } else {
        // Instant collapse during initialization
        animationBridge.setCollapseState(nestedContent, 'collapsed');
      }
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
    // Keyboard navigation - FIXED for async animations
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
   * Expand all sections - FIXED for async animations
   */
  async expandAll() {
    // Use Promise.all for parallel expansion for better performance
    const expandPromises = this.toggles.map(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'false') {
        return this.toggleContent(toggle, true);
      }
      return Promise.resolve();
    });
    
    await Promise.all(expandPromises);
    this.emit('sidebar:expandedAll');
  }

  /**
   * Collapse all sections - FIXED for async animations
   */
  async collapseAll() {
    // Use Promise.all for parallel collapse for better performance
    const collapsePromises = this.toggles.map(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        return this.toggleContent(toggle, false);
      }
      return Promise.resolve();
    });
    
    await Promise.all(collapsePromises);
    this.emit('sidebar:collapsedAll');
  }

  /**
   * Initialize mobile sidebar state
   */
  initializeMobileState() {
    // Check if sidebar is currently open based on CSS classes
    this.isOpen = this.element.classList.contains('translate-x-0') && 
                  !this.element.classList.contains('-translate-x-full');
    
    console.log('Sidebar: Initial mobile state -', this.isOpen ? 'open' : 'closed');
    console.log('Sidebar: Current classes -', this.element.className);
  }

  /**
   * Ensure proper sidebar state based on screen size
   */
  ensureProperState() {
    // Force proper state based on screen size
    this.checkAndSetProperState();
    
    // Listen for window resize to handle responsive behavior
    this.addEventListener(window, 'resize', () => {
      // Debounce resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkAndSetProperState();
      }, 150);
    });
  }

  /**
   * Check screen size and set appropriate state
   */
  checkAndSetProperState() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile: ensure sidebar starts closed
      this.forceClose();
      console.log('Sidebar: Forced mobile state (closed)');
    } else {
      // On desktop: ensure sidebar is visible but close mobile controls
      this.ensureDesktopVisible();
      console.log('Sidebar: Ensured desktop state (visible)');
    }
  }

  /**
   * Ensure sidebar is properly visible on desktop
   */
  ensureDesktopVisible() {
    // Remove mobile transform classes
    this.element.classList.remove('-translate-x-full', 'translate-x-0');
    // Set open state to false (no mobile overlay needed)
    this.isOpen = false;
    
    // Hide overlay if it exists
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    
    // Reset body overflow
    document.body.style.overflow = '';
  }

  /**
   * Open mobile sidebar
   */
  open() {
    if (this.isOpen) return;
    
    // 🚀 NEW: Enhanced state management
    this.updateComponentState('opening');
    
    this.element.classList.remove('-translate-x-full');
    this.element.classList.add('translate-x-0');
    this.isOpen = true;
    
    // Set final state after animation
    setTimeout(() => {
      this.updateComponentState('open');
    }, 300);
    
    this.emit('sidebar:opened');
    console.log('Sidebar: Mobile sidebar opened');
  }

  /**
   * Close mobile sidebar
   */
  close() {
    if (!this.isOpen) return;
    
    // 🚀 NEW: Enhanced state management
    this.updateComponentState('closing');
    
    this.element.classList.add('-translate-x-full');
    this.element.classList.remove('translate-x-0');
    this.isOpen = false;
    
    // Set final state after animation
    setTimeout(() => {
      this.updateComponentState('closed');
    }, 300);
    
    this.emit('sidebar:closed');
    console.log('Sidebar: Mobile sidebar closed');
  }

  /**
   * Force close sidebar (useful for cleanup)
   */
  forceClose() {
    this.element.classList.add('-translate-x-full');
    this.element.classList.remove('translate-x-0');
    this.isOpen = false;
    
    this.emit('sidebar:closed');
    console.log('Sidebar: Mobile sidebar force closed');
  }

  /**
   * Toggle mobile sidebar
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Reset sidebar to initial state (useful for debugging)
   */
  reset() {
    this.forceClose();
    
    // Also hide overlay if it exists
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    console.log('Sidebar: Reset to initial state');
    this.emit('sidebar:reset');
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('Sidebar: Component destroyed');
  }
}

// Auto-register component
ComponentManager.register('navigation-sidebar-left', Sidebar);