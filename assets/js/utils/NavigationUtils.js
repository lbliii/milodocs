/**
 * NavigationUtils - Utilities for navigation path matching and link detection
 * Extracted from Sidebar component for reusability across navigation components
 */

import { logger } from './Logger.js';

const log = logger.component('NavigationUtils');

/**
 * Navigation utilities for path matching and link detection
 */
export class NavigationUtils {
  
  /**
   * Normalize path for comparison (handles static deployments)
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path
   */
  static normalizePath(path) {
    if (!path) return '';
    
    if (path.startsWith('./')) {
      return path.substring(2);
    }
    if (path.startsWith('/')) {
      return path.substring(1);
    }
    return path;
  }

  /**
   * Check if two paths match, accounting for relative vs absolute paths
   * @param {string} currentPath - Current page path
   * @param {string} linkPath - Link href path
   * @returns {boolean} Whether paths match
   */
  static pathsMatch(currentPath, linkPath) {
    if (!currentPath || !linkPath) return false;
    
    const normalizedCurrent = this.normalizePath(currentPath);
    const normalizedLink = this.normalizePath(linkPath);
    
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
   * Find current link using multiple detection strategies
   * @param {Element} container - Container element to search within
   * @param {string} currentPath - Current page path
   * @returns {Element|null} Found link element or null
   */
  static findCurrentLink(container, currentPath) {
    if (!container || !currentPath) return null;
    
    let currentLink = null;
    
    // Strategy 1: Use data-current="true" as primary method (set by Hugo)
    currentLink = container.querySelector('a[data-current="true"]');
    
    if (currentLink) {
      log.debug('Found current link via data-current attribute:', currentLink.href);
      return currentLink;
    }
    
    log.debug('No data-current link found, trying path matching...');
    
    // Strategy 2: Exact match with current path
    currentLink = container.querySelector(`a[href="${currentPath}"]`);
    
    if (currentLink) {
      log.debug('Found current link via exact path match:', currentLink.href);
      return currentLink;
    }
    
    // Strategy 3: Relative path format (for static deployments)
    const relativePath = `.${currentPath}`;
    currentLink = container.querySelector(`a[href="${relativePath}"]`);
    
    if (currentLink) {
      log.debug('Found current link via relative path match:', currentLink.href);
      return currentLink;
    }
    
    // Strategy 4: Without leading slash
    if (currentPath.startsWith('/')) {
      const pathWithoutSlash = currentPath.substring(1);
      currentLink = container.querySelector(`a[href="${pathWithoutSlash}"]`);
      
      if (currentLink) {
        log.debug('Found current link via path without slash:', currentLink.href);
        return currentLink;
      }
    }
    
    // Strategy 5: Fuzzy matching using pathsMatch function
    const allLinks = container.querySelectorAll('a[href]');
    for (const link of allLinks) {
      const linkPath = link.getAttribute('href');
      if (this.pathsMatch(currentPath, linkPath)) {
        log.debug('Found current link via fuzzy path matching:', linkPath);
        return link;
      }
    }
    
    log.debug('No current link found for path:', currentPath);
    return null;
  }

  /**
   * Get current page path with normalization for static deployments
   * @returns {string} Current page path
   */
  static getCurrentPath() {
    let currentPath = window.location.pathname;
    
    // Normalize current path for static deployments
    if (currentPath.endsWith('/')) {
      currentPath += 'index.html';
    }
    
    return currentPath;
  }

  /**
   * Find parent navigation items for a given link
   * @param {Element} link - Link element to find parents for
   * @param {string} parentSelector - Selector for parent items (default: 'li')
   * @returns {Element[]} Array of parent elements
   */
  static findParentNavigationItems(link, parentSelector = 'li') {
    const parents = [];
    let parent = link.closest(parentSelector);
    
    while (parent) {
      parents.push(parent);
      // Move up to parent (skip nested ul)
      parent = parent.parentElement?.closest(parentSelector);
    }
    
    return parents;
  }

  /**
   * Get navigation item info (link text, section name, etc.)
   * @param {Element} navigationItem - Navigation item element
   * @returns {Object} Navigation item information
   */
  static getNavigationItemInfo(navigationItem) {
    const link = navigationItem.querySelector('a');
    const toggle = navigationItem.querySelector('.expand-toggle');
    
    return {
      link,
      toggle,
      href: link?.getAttribute('href'),
      text: link?.textContent?.trim(),
      sectionName: toggle?.getAttribute('aria-label') || link?.textContent?.trim(),
      hasToggle: !!toggle,
      isExpanded: toggle?.getAttribute('aria-expanded') === 'true',
      isSection: link?.getAttribute('data-section') === 'true'
    };
  }
}

// Utility functions for easy import
export const {
  normalizePath,
  pathsMatch,
  findCurrentLink,
  getCurrentPath,
  findParentNavigationItems,
  getNavigationItemInfo
} = NavigationUtils;
