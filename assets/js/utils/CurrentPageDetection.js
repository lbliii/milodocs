/**
 * CurrentPageDetection - Utility for detecting and highlighting current page in navigation
 * Handles complex scenarios like static deployments, relative paths, and Hugo data attributes
 */

import { NavigationUtils } from './NavigationUtils.js';
import { logger } from './Logger.js';

const log = logger.component('CurrentPageDetection');

/**
 * Current page detection and highlighting utility
 */
export class CurrentPageDetection {
  
  /**
   * Create a new CurrentPageDetection instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: null, // Must be provided
      activeClass: 'sidebar-link--active',
      parentItemSelector: 'li',
      toggleSelector: '.expand-toggle',
      linkSelector: 'a',
      ...options
    };
    
    this.currentPath = NavigationUtils.getCurrentPath();
    this.container = null;
    this.currentLink = null;
  }

  /**
   * Initialize current page detection
   * @param {Element} container - Container element to search within
   * @returns {boolean} Whether initialization was successful
   */
  init(container) {
    if (!container) {
      log.error('Container element is required for current page detection');
      return false;
    }
    
    this.container = container;
    return this.detectAndHighlightCurrentPage();
  }

  /**
   * Detect current page and highlight it in navigation
   * @returns {boolean} Whether current page was found and highlighted
   */
  detectAndHighlightCurrentPage() {
    log.debug('Detecting current page for path:', this.currentPath);
    
    // Find the current link
    this.currentLink = NavigationUtils.findCurrentLink(this.container, this.currentPath);
    
    if (!this.currentLink) {
      log.debug('No current link found for path:', this.currentPath);
      return false;
    }
    
    log.debug('Found current link:', this.currentLink.href, this.currentLink.textContent.trim());
    
    // Highlight the current link
    this.highlightCurrentLink();
    
    // Expand parent sections
    this.expandParentSections();
    
    return true;
  }

  /**
   * Highlight the current link with active class
   */
  highlightCurrentLink() {
    if (!this.currentLink) return;
    
    // Remove existing active classes from other links
    this.clearActiveLinks();
    
    // Add active class to current link
    if (!this.currentLink.classList.contains(this.options.activeClass)) {
      this.currentLink.classList.add(this.options.activeClass);
      log.debug('Added active class to current link');
    }
  }

  /**
   * Clear active classes from all links in container
   */
  clearActiveLinks() {
    const activeLinks = this.container.querySelectorAll(`.${this.options.activeClass}`);
    activeLinks.forEach(link => {
      link.classList.remove(this.options.activeClass);
    });
  }

  /**
   * Expand parent sections to show the current page
   * @param {Function} expandFunction - Function to expand a toggle (optional)
   * @returns {number} Number of sections expanded
   */
  expandParentSections(expandFunction = null) {
    if (!this.currentLink) return 0;
    
    const parents = NavigationUtils.findParentNavigationItems(this.currentLink, this.options.parentItemSelector);
    let expandedCount = 0;
    
    parents.forEach(parent => {
      const toggle = parent.querySelector(this.options.toggleSelector);
      if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
        const navInfo = NavigationUtils.getNavigationItemInfo(parent);
        log.debug(`Expanding parent section: ${navInfo.sectionName}`);
        
        if (expandFunction && typeof expandFunction === 'function') {
          // Use provided expand function (for components with custom logic)
          expandFunction(toggle, true);
        } else {
          // Default expand behavior
          this.defaultExpandToggle(toggle);
        }
        
        expandedCount++;
      }
    });
    
    log.debug(`Expanded ${expandedCount} parent sections for current page`);
    return expandedCount;
  }

  /**
   * Default toggle expansion (fallback when no custom function provided)
   * @param {Element} toggle - Toggle element to expand
   */
  defaultExpandToggle(toggle) {
    toggle.setAttribute('aria-expanded', 'true');
    
    // Update visual indicator
    const chevron = toggle.querySelector('svg, .chevron, .icon');
    if (chevron) {
      chevron.classList.add('rotate-90');
    }
    
    // Show content
    const parent = toggle.closest(this.options.parentItemSelector);
    const content = parent?.querySelector('.nested-content, .collapse-content');
    if (content) {
      content.style.display = '';
      content.classList.add('expanded');
      content.setAttribute('data-collapse-state', 'expanded');
    }
  }

  /**
   * Update current path and re-detect
   * @param {string} newPath - New path to detect
   * @returns {boolean} Whether new path was found and highlighted
   */
  updateCurrentPath(newPath) {
    this.currentPath = newPath || NavigationUtils.getCurrentPath();
    return this.detectAndHighlightCurrentPage();
  }

  /**
   * Get current page information
   * @returns {Object} Current page information
   */
  getCurrentPageInfo() {
    if (!this.currentLink) {
      return {
        found: false,
        path: this.currentPath,
        link: null,
        text: null,
        href: null
      };
    }
    
    return {
      found: true,
      path: this.currentPath,
      link: this.currentLink,
      text: this.currentLink.textContent.trim(),
      href: this.currentLink.getAttribute('href'),
      parents: NavigationUtils.findParentNavigationItems(this.currentLink, this.options.parentItemSelector)
    };
  }

  /**
   * Reset current page detection (clear highlights and collapse)
   */
  reset() {
    this.clearActiveLinks();
    this.currentLink = null;
    log.debug('Current page detection reset');
  }
}

/**
 * Utility function to quickly detect current page in a container
 * @param {Element} container - Container to search within
 * @param {Object} options - Configuration options
 * @param {Function} expandFunction - Optional custom expand function
 * @returns {Object} Detection result
 */
export function detectCurrentPage(container, options = {}, expandFunction = null) {
  const detector = new CurrentPageDetection(options);
  const success = detector.init(container);
  
  if (success && expandFunction) {
    detector.expandParentSections(expandFunction);
  }
  
  return {
    success,
    detector,
    pageInfo: detector.getCurrentPageInfo()
  };
}
