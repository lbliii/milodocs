/**
 * OpenAPI Sidebar Component
 * Handles OpenAPI-specific sidebar navigation with smooth scrolling and active states
 */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('OpenAPISidebar');

export class OpenAPISidebar extends Component {
  constructor(config = {}) {
    super({
      name: 'openapi-sidebar',
      selector: config.selector || '[data-component="openapi-sidebar"]',
      ...config
    });
    
    this.currentActiveLink = null;
    this.tagToggles = [];
    this.sidebarLinks = [];
    this.isInitialized = false;
    this.scrollOffset = 100; // Offset for better visual positioning
    this.scrollDebounceTimer = null;
    this.isScrolling = false;
  }

  async onInit() {
    if (!this.element) {
      log.warn('OpenAPI Sidebar element not found');
      return;
    }

    this.setupElements();
    this.setupEventListeners();
    this.setupTagToggles();
    this.setupActiveStateTracking();
    this.isInitialized = true;
    
    log.info('OpenAPI Sidebar initialized');
  }

  setupElements() {
    // Get all sidebar links for navigation
    this.sidebarLinks = Array.from(this.element.querySelectorAll('[data-scroll-target]'));
    
    // Get all tag toggles for collapsible sections
    this.tagToggles = Array.from(this.element.querySelectorAll('.openapi-sidebar-tag-toggle'));
    
    log.debug(`Found ${this.sidebarLinks.length} sidebar links and ${this.tagToggles.length} tag toggles`);
  }

  setupEventListeners() {
    // Handle sidebar link clicks for smooth scrolling
    this.sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleLinkClick(e));
    });

    // Handle scroll events for active state management
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Handle resize events
    window.addEventListener('resize', () => this.handleResize());
  }

  setupTagToggles() {
    this.tagToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.handleTagToggle(e));
      
      // Set initial state (expanded by default)
      const target = toggle.getAttribute('data-target');
      const targetElement = document.getElementById(target);
      if (targetElement) {
        toggle.setAttribute('aria-expanded', 'true');
        targetElement.style.display = 'block';
        toggle.classList.add('openapi-sidebar-tag-toggle--expanded');
      }
    });
  }

  setupActiveStateTracking() {
    // Initial active state setup
    this.updateActiveState();
    
    // Update active state on load if there's a hash
    if (window.location.hash) {
      setTimeout(() => {
        this.scrollToTarget(window.location.hash.substring(1));
      }, 100);
    }
  }

  handleLinkClick(e) {
    e.preventDefault();
    
    const link = e.currentTarget;
    const target = link.getAttribute('data-scroll-target');
    
    if (target) {
      this.scrollToTarget(target);
      this.setActiveLink(link);
      
      // Update URL without triggering page reload
      if (history.pushState) {
        history.pushState(null, null, `#${target}`);
      } else {
        window.location.hash = target;
      }
    }
  }

  handleTagToggle(e) {
    e.preventDefault();
    
    const toggle = e.currentTarget;
    const target = toggle.getAttribute('data-target');
    const targetElement = document.getElementById(target);
    
    if (!targetElement) return;
    
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    // Update button state
    toggle.setAttribute('aria-expanded', newState.toString());
    toggle.classList.toggle('openapi-sidebar-tag-toggle--expanded', newState);
    
    // Toggle target visibility with animation
    if (newState) {
      targetElement.style.display = 'block';
      // Force reflow for animation
      targetElement.offsetHeight;
      targetElement.classList.add('openapi-sidebar-endpoints-list--expanded');
    } else {
      targetElement.classList.remove('openapi-sidebar-endpoints-list--expanded');
      setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'false') {
          targetElement.style.display = 'none';
        }
      }, 150); // Match CSS transition duration
    }
    
    log.debug(`Toggled ${target}: ${newState ? 'expanded' : 'collapsed'}`);
  }

  handleScroll() {
    if (this.scrollDebounceTimer) {
      clearTimeout(this.scrollDebounceTimer);
    }
    
    this.scrollDebounceTimer = setTimeout(() => {
      if (!this.isScrolling) {
        this.updateActiveState();
      }
    }, 50);
  }

  handleResize() {
    // Handle responsive behavior if needed
    this.updateActiveState();
  }

  scrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      log.warn(`Target element not found: ${targetId}`);
      return;
    }

    this.isScrolling = true;
    
    const targetPosition = targetElement.offsetTop - this.scrollOffset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
      this.isScrolling = false;
    }, 1000);
    
    log.debug(`Scrolled to target: ${targetId}`);
  }

  updateActiveState() {
    if (this.sidebarLinks.length === 0) return;
    
    const scrollPosition = window.scrollY + this.scrollOffset;
    let activeLink = null;
    
    // Find the most appropriate active link based on scroll position
    this.sidebarLinks.forEach(link => {
      const target = link.getAttribute('data-scroll-target');
      const targetElement = document.getElementById(target);
      
      if (targetElement) {
        const elementTop = targetElement.offsetTop;
        const elementBottom = elementTop + targetElement.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          activeLink = link;
        }
      }
    });
    
    // If no element is in view, check if we're at the top or bottom
    if (!activeLink) {
      if (scrollPosition < 100) {
        // Near top of page - activate first link
        activeLink = this.sidebarLinks[0];
      } else {
        // Check if we're near an element
        let closestLink = null;
        let closestDistance = Infinity;
        
        this.sidebarLinks.forEach(link => {
          const target = link.getAttribute('data-scroll-target');
          const targetElement = document.getElementById(target);
          
          if (targetElement) {
            const distance = Math.abs(targetElement.offsetTop - scrollPosition);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestLink = link;
            }
          }
        });
        
        if (closestDistance < 200) { // Within 200px
          activeLink = closestLink;
        }
      }
    }
    
    this.setActiveLink(activeLink);
  }

  setActiveLink(newActiveLink) {
    if (this.currentActiveLink === newActiveLink) return;
    
    // Remove active state from previous link
    if (this.currentActiveLink) {
      this.currentActiveLink.classList.remove('openapi-sidebar-link--active', 'openapi-sidebar-endpoint-link--active');
    }
    
    // Set active state on new link
    if (newActiveLink) {
      newActiveLink.classList.add(
        newActiveLink.classList.contains('openapi-sidebar-endpoint-link') 
          ? 'openapi-sidebar-endpoint-link--active' 
          : 'openapi-sidebar-link--active'
      );
      
      // Ensure the parent tag group is expanded if this is an endpoint link
      if (newActiveLink.classList.contains('openapi-sidebar-endpoint-link')) {
        const parentGroup = newActiveLink.closest('.openapi-sidebar-tag-group');
        if (parentGroup) {
          const toggle = parentGroup.querySelector('.openapi-sidebar-tag-toggle');
          const targetList = parentGroup.querySelector('.openapi-sidebar-endpoints-list');
          
          if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
            toggle.click(); // Expand the group
          }
        }
      }
    }
    
    this.currentActiveLink = newActiveLink;
    
    if (newActiveLink) {
      const target = newActiveLink.getAttribute('data-scroll-target');
      log.debug(`Active link updated: ${target}`);
    }
  }

  // Public API methods
  expandAllGroups() {
    this.tagToggles.forEach(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'false') {
        toggle.click();
      }
    });
  }

  collapseAllGroups() {
    this.tagToggles.forEach(toggle => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        toggle.click();
      }
    });
  }

  scrollToEndpoint(endpointId) {
    this.scrollToTarget(endpointId);
  }
}

export default OpenAPISidebar;