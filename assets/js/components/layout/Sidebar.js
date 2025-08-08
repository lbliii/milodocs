/**
 * Sidebar Component - Refactored with modular architecture
 * Uses mixins and utilities for expandable and responsive functionality
 */

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

    // Find the linkTree element within the sidebar
    this.linkTreeElement = this.findChild('#linkTree');
    if (!this.linkTreeElement) {
      console.warn('Sidebar: LinkTree element not found within sidebar');
      return;
    }

    console.log('Sidebar: Sidebar and LinkTree elements found');
    // Reveal contents immediately to avoid opacity gating if later steps fail
    // (CSS has #linkTree:not(.initialized){opacity:0})
    if (!this.linkTreeElement.classList.contains('initialized')) {
      this.linkTreeElement.classList.add('initialized');
    }
    
    // 🚀 REFACTORED: Initialize mixins for modular functionality
    this.initExpandable({
      toggleSelector: '.expand-toggle',
      contentSelector: '.nested-content',
      animationTiming: 'medium'
    });
    
    this.initResponsive({
      mobileBreakpoint: 768,
      overlaySelector: '#mobileNavOverlay'
    });
    
    // Ensure all nested-content start with a known state for consistent CSS behavior
    const nestedContents = this.linkTreeElement.querySelectorAll('.nested-content');
    nestedContents.forEach((content) => {
      if (!content.hasAttribute('data-collapse-state')) {
        animationBridge.setCollapseState(content, 'collapsed');
      }
    });

    // 🚀 REFACTORED: Use CurrentPageDetection utility
    this.currentPageDetector = new CurrentPageDetection({
      activeClass: 'sidebar-link--active',
      parentItemSelector: 'li',
      toggleSelector: '.expand-toggle'
    });
    
    // Detect and highlight current page
    const found = this.currentPageDetector.init(this.linkTreeElement);
    // Expand ancestor sections of the active page using mixin methods
    if (found) {
      await this.currentPageDetector.expandParentSections(async (toggle, expand) => {
        await this.setToggleState(toggle, expand);
      });
    }
    
    this.setupKeyboardNavigation();
    
    // Mark as initialized for animations
    this.element.classList.add('initialized');
    // this.linkTreeElement.classList.add('initialized'); // already added early
    this.isInitialized = true;
    
    // Set ready state
    this.updateComponentState('ready');
    
    console.log(`Sidebar: Initialized with ${this.toggles?.length || 0} toggles`);
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

  // Note: Toggle functionality now handled by ExpandableMixin
  // Mobile functionality now handled by ResponsiveMixin
  // Current page detection now handled by CurrentPageDetection utility

  /**
   * Reset sidebar to clean state before setting current path
   */
  resetSidebarState() {
    // Remove any existing active classes
    const existingActiveLinks = this.linkTreeElement.querySelectorAll('.sidebar-link--active');
    existingActiveLinks.forEach(link => {
      link.classList.remove('sidebar-link--active');
    });
    
    // Collapse all sections to start fresh
    const allToggles = this.linkTreeElement.querySelectorAll('.expand-toggle');
    allToggles.forEach(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        // this.toggleContent(toggle, false);
        this.collapseToggle(toggle);
      }
    });
    
    console.debug('Sidebar: Reset to clean state');
  }

  /**
   * Expand the path to current page
   */
  expandCurrentPath() {
    console.debug('Sidebar: Expanding path for current page:', this.currentPath);
    
    // 🔧 ENHANCED: Use data-current="true" as primary method
    // Hugo should be setting this attribute on the current page link
    let currentLink = this.linkTreeElement.querySelector('a[data-current="true"]');
    
    if (currentLink) {
      console.debug('Sidebar: Found current link via data-current attribute:', currentLink.href);
    } else {
      // Fallback: Try multiple approaches to find the current link
      console.debug('Sidebar: No data-current link found, trying path matching...');
      
      // First, try exact match with current path
      currentLink = this.linkTreeElement.querySelector(`a[href="${this.currentPath}"]`);
      
      // If not found, try with relative path format (for static deployments)
      if (!currentLink) {
        const relativePath = `.${this.currentPath}`;
        currentLink = this.linkTreeElement.querySelector(`a[href="${relativePath}"]`);
      }
      
      // If still not found, try without leading slash
      if (!currentLink && this.currentPath.startsWith('/')) {
        const pathWithoutSlash = this.currentPath.substring(1);
        currentLink = this.linkTreeElement.querySelector(`a[href="${pathWithoutSlash}"]`);
      }
      
      // If still not found, try matching based on ending paths (most permissive)
      if (!currentLink) {
        const allLinks = this.linkTreeElement.querySelectorAll('a[href]');
        for (const link of allLinks) {
          const linkPath = link.getAttribute('href');
          if (this.pathsMatch(this.currentPath, linkPath)) {
            currentLink = link;
            console.debug('Sidebar: Found current link via path matching:', linkPath);
            break;
          }
        }
      }
    }
    
    if (!currentLink) {
      console.debug('Sidebar: No current link found for path:', this.currentPath);
      return;
    }
    
    console.debug('Sidebar: Found current link:', currentLink.href, currentLink.textContent.trim());
    
    // 🔧 ENHANCED: Only mark as active if not already marked
    if (!currentLink.classList.contains('sidebar-link--active')) {
      currentLink.classList.add('sidebar-link--active');
    }
    
    // 🔧 ENHANCED: Only expand parent sections that aren't already expanded
    let parent = currentLink.closest('li');
    let expandedCount = 0;
    
    while (parent) {
      const parentToggle = parent.querySelector(':scope > .sidebar-item > .expand-toggle');
      if (parentToggle && parentToggle.getAttribute('aria-expanded') !== 'true') {
        const sectionName = parentToggle.getAttribute('aria-label') || parent.querySelector('a')?.textContent?.trim() || 'unknown section';
        console.debug(`Sidebar: Expanding parent section: ${sectionName}`);
        // this.toggleContent(parentToggle, true);
        this.expandToggle(parentToggle);
        expandedCount++;
      } else if (parentToggle) {
        const sectionName = parentToggle.getAttribute('aria-label') || parent.querySelector('a')?.textContent?.trim() || 'unknown section';
        console.debug(`Sidebar: Parent section already expanded: ${sectionName}`);
      }
      
      // Move up to parent li (skip nested ul)
      parent = parent.parentElement?.closest('li');
    }
    
    console.debug(`Sidebar: Expanded ${expandedCount} new parent sections for current page`);
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
        // return this.toggleContent(toggle, true);
        return this.expandToggle(toggle);
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
        // return this.toggleContent(toggle, false);
        return this.collapseToggle(toggle);
      }
      return Promise.resolve();
    });
    
    await Promise.all(collapsePromises);
    this.emit('sidebar:collapsedAll');
  }

  /**
   * Check if two paths match, accounting for relative vs absolute paths
   */
  pathsMatch(currentPath, linkPath) {
    // Normalize both paths
    const normalizePath = (path) => {
      if (path.startsWith('./')) {
        return path.substring(2);
      }
      if (path.startsWith('/')) {
        return path.substring(1);
      }
      return path;
    };

    const normalizedCurrent = normalizePath(currentPath);
    const normalizedLink = normalizePath(linkPath);
    
    // Direct match
    if (normalizedCurrent === normalizedLink) {
      return true;
    }
    
    // Handle index.html cases
    if (normalizedCurrent.endsWith('/index.html') && normalizedLink.endsWith('/')) {
      return normalizedCurrent.replace('/index.html', '/') === normalizedLink;
    }
    
    if (normalizedLink.endsWith('/index.html') && normalizedCurrent.endsWith('/')) {
      return normalizedLink.replace('/index.html', '/') === normalizedCurrent;
    }
    
    // Handle directory vs index file
    if (normalizedCurrent.endsWith('/') && normalizedLink === normalizedCurrent + 'index.html') {
      return true;
    }
    
    if (normalizedLink.endsWith('/') && normalizedCurrent === normalizedLink + 'index.html') {
      return true;
    }
    
    return false;
  }

  /**
   * Initialize mobile sidebar state without interfering with desktop CSS
   */
  initializeMobileState() {
    // 🔧 FIXED: Only detect mobile state, don't assume desktop behavior
    // Desktop visibility is handled by CSS responsive classes: md:translate-x-0
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile, check if sidebar is currently open
      this.isOpen = this.element.classList.contains('translate-x-0') && 
                    !this.element.classList.contains('-translate-x-full');
    } else {
      // On desktop, sidebar visibility is handled by CSS, just track mobile overlay state
      this.isOpen = false; // No mobile overlay should be active on desktop
    }
    
    console.log(`Sidebar: Initial state (${isMobile ? 'mobile' : 'desktop'}) -`, this.isOpen ? 'mobile overlay open' : 'normal');
    console.log('Sidebar: Current classes -', this.element.className);
  }

  /**
   * Setup responsive handling without forcing initial state
   */
  setupResponsiveHandling() {
    // Listen for window resize to handle responsive behavior
    // But don't force any initial state - let CSS handle it
    this.addEventListener(window, 'resize', () => {
      // Debounce resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResponsiveChange();
      }, 150);
    });
  }

  /**
   * Handle responsive changes without forcing initial desktop state
   */
  handleResponsiveChange() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile: ensure any open overlay is closed
      this.closeOverlayIfOpen();
      console.log('Sidebar: Responsive change to mobile');
    } else {
      // On desktop: just ensure overlays are hidden, but don't touch sidebar visibility
      this.closeOverlayIfOpen();
      console.log('Sidebar: Responsive change to desktop');
    }
  }

  /**
   * Close overlay and clean up mobile-specific state without touching sidebar visibility
   */
  closeOverlayIfOpen() {
    // Hide overlay if it exists
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    // Reset mobile open state
    this.isOpen = false;
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
    // 🔧 FIXED: Don't touch the core responsive classes!
    // The sidebar has: transform -translate-x-full md:translate-x-0
    // These classes handle responsive behavior automatically via CSS
    // We should only remove temporary mobile state classes
    
    // Remove any temporary mobile state classes (added by open/close methods)
    // but keep the original responsive classes intact
    if (this.element.classList.contains('translate-x-0') && 
        !this.element.classList.contains('md:translate-x-0')) {
      // Only remove if it's a temporary class, not the responsive one
      this.element.classList.remove('translate-x-0');
    }
    
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
      console.debug('Sidebar: LinkTree element missing');
      return false;
    }
    
    // Use expandable mixin health check
    if (!this.isExpandableHealthy()) {
      console.debug('Sidebar: Expandable functionality unhealthy');
      return false;
    }
    
    // Check current page detection
    if (this.currentPageDetector && !this.currentPageDetector.getCurrentPageInfo().found) {
      console.debug('Sidebar: Current page not detected');
      // This is not necessarily unhealthy, just log it
    }
    
    return true;
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('Sidebar: Component destroyed');
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
      console.debug('Sidebar: syncToCurrentPage failed', e);
      return false;
    }
  }
}

// Apply mixins to Sidebar prototype
Object.assign(Sidebar.prototype, ExpandableMixin);
Object.assign(Sidebar.prototype, ResponsiveMixin);

// Auto-register component
ComponentManager.register('navigation-sidebar-left', Sidebar);