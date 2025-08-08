/**
 * ScrollTrackingMixin - Mixin for components that need scroll-based functionality
 * Provides standardized scroll tracking, active state management, and performance optimizations
 * Refactored to use MixinBase utilities for consistency
 */

import { MixinUtilities, validateMixinInterface } from './MixinBase.js';
import { debounce, throttle } from '../utils/index.js';

/**
 * Mixin that adds scroll tracking functionality to components
 * Usage: Object.assign(YourComponent.prototype, ScrollTrackingMixin);
 */
export const ScrollTrackingMixin = {
  
  /**
   * Initialize scroll tracking functionality using MixinBase utilities
   * Call this from your component's onInit method
   * @param {Object} options - Configuration options
   */
  initScrollTracking: MixinUtilities.createInitFunction(
    'ScrollTrackingMixin',
    {
      activeClass: 'active',
      offset: 100,
      smoothScroll: true,
      throttleDelay: 16, // ~60fps
      debounceDelay: 100,
      useIntersectionObserver: true,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    },
    function setupScrollTracking() {
      this.scrollTargets = [];
      this.activeTarget = null;
      this.isScrolling = false;
      this.scrollTimeout = null;
      this.observer = null;
      
      this.setupScrollElements();
      this.setupScrollTracking();
    }
  ),

  /**
   * Find and cache scroll-related elements
   */
  setupScrollElements() {
    if (!this.element) return;
    
    // Find all scroll targets (links with data-scroll-target or href starting with #)
    const scrollLinks = this.element.querySelectorAll('[data-scroll-target], a[href^="#"]');
    
    this.scrollTargets = Array.from(scrollLinks).map(link => {
      const targetId = link.getAttribute('data-scroll-target') || 
                      link.getAttribute('href')?.substring(1);
      const targetElement = document.getElementById(targetId);
      
      return {
        link,
        targetId,
        targetElement,
        isActive: false
      };
    }).filter(target => target.targetElement); // Only keep targets with valid elements
  },

  /**
   * Setup scroll tracking based on configuration
   */
  setupScrollTracking() {
    if (this.scrollOptions.useIntersectionObserver && 'IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.setupScrollListener();
    }
    
    this.setupScrollLinks();
  },

  /**
   * Setup Intersection Observer for modern scroll tracking
   */
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: this.scrollOptions.rootMargin,
      threshold: this.scrollOptions.threshold
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = this.scrollTargets.find(t => t.targetElement === entry.target);
        if (target) {
          if (entry.isIntersecting) {
            this.setActiveTarget(target);
          }
        }
      });
    }, observerOptions);
    
    // Observe all target elements
    this.scrollTargets.forEach(target => {
      this.observer.observe(target.targetElement);
    });
  },

  /**
   * Setup scroll listener (fallback for older browsers)
   */
  setupScrollListener() {
    const throttledScrollHandler = throttle(() => {
      this.handleScroll();
    }, this.scrollOptions.throttleDelay);
    
    this.addEventListener(window, 'scroll', throttledScrollHandler);
    
    // Initial check
    this.handleScroll();
  },

  /**
   * Setup click handlers for scroll links
   */
  setupScrollLinks() {
    this.scrollTargets.forEach(target => {
      this.addEventListener(target.link, 'click', (e) => {
        e.preventDefault();
        this.scrollToTarget(target);
      });
    });
  },

  /**
   * Handle scroll events (for non-IntersectionObserver mode)
   */
  handleScroll() {
    if (this.isScrolling) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let activeTarget = null;
    let closestDistance = Infinity;
    
    // Find the target that's closest to the top of the viewport
    this.scrollTargets.forEach(target => {
      const rect = target.targetElement.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const distance = Math.abs(elementTop - scrollTop - this.scrollOptions.offset);
      
      if (distance < closestDistance && rect.top <= this.scrollOptions.offset) {
        closestDistance = distance;
        activeTarget = target;
      }
    });
    
    if (activeTarget && activeTarget !== this.activeTarget) {
      this.setActiveTarget(activeTarget);
    }
  },

  /**
   * Set the active target and update UI
   * @param {Object} target - Target object to set as active
   */
  setActiveTarget(target) {
    // Remove active class from previous target
    if (this.activeTarget) {
      this.activeTarget.link.classList.remove(this.scrollOptions.activeClass);
      this.activeTarget.isActive = false;
    }
    
          // Set new active target
      this.activeTarget = target;
      if (target) {
        target.link.classList.add(this.scrollOptions.activeClass);
        target.isActive = true;
        
        // Emit event
        this.emit('scroll-target-active', {
          target: target.targetElement,
          link: target.link,
          targetId: target.targetId
        });
      }
  },

  /**
   * Scroll to a specific target
   * @param {Object} target - Target object to scroll to
   */
  async scrollToTarget(target) {
    if (!target.targetElement) return;
    
    this.isScrolling = true;
    
    // Emit before-scroll event
    this.emit('before-scroll', {
      target: target.targetElement,
      link: target.link,
      targetId: target.targetId
    });
    
    if (this.scrollOptions.smoothScroll && 'scrollBehavior' in document.documentElement.style) {
      // Use native smooth scrolling
      const elementTop = target.targetElement.offsetTop - this.scrollOptions.offset;
      
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      
      // Wait for scroll to complete
      await this.waitForScrollEnd();
    } else {
      // Instant scroll fallback
      const elementTop = target.targetElement.offsetTop - this.scrollOptions.offset;
      window.scrollTo(0, elementTop);
    }
    
    // Set as active target
    this.setActiveTarget(target);
    
    this.isScrolling = false;
    
    // Emit after-scroll event
    this.emit('after-scroll', {
      target: target.targetElement,
      link: target.link,
      targetId: target.targetId
    });
    
    // Scrolled successfully
  },

  /**
   * Wait for smooth scroll to end
   * @returns {Promise} Promise that resolves when scrolling stops
   */
  waitForScrollEnd() {
    return new Promise(resolve => {
      let lastScrollTop = window.pageYOffset;
      let scrollEndTimer;
      
      const checkScrollEnd = () => {
        const currentScrollTop = window.pageYOffset;
        
        if (Math.abs(currentScrollTop - lastScrollTop) < 1) {
          // Scroll has stopped
          resolve();
        } else {
          lastScrollTop = currentScrollTop;
          scrollEndTimer = setTimeout(checkScrollEnd, 50);
        }
      };
      
      scrollEndTimer = setTimeout(checkScrollEnd, 50);
    });
  },

  /**
   * Update scroll targets (useful when DOM changes)
   */
  updateScrollTargets() {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Re-setup elements and tracking
    this.setupScrollElements();
    this.setupScrollTracking();
  },

  /**
   * Get current active target
   * @returns {Object|null} Current active target or null
   */
  getActiveTarget() {
    return this.activeTarget;
  },

  /**
   * Get all scroll targets
   * @returns {Array} Array of all scroll targets
   */
  getScrollTargets() {
    return this.scrollTargets;
  },

  /**
   * Scroll to target by ID
   * @param {string} targetId - ID of target to scroll to
   */
  scrollToId(targetId) {
    const target = this.scrollTargets.find(t => t.targetId === targetId);
    if (target) {
      this.scrollToTarget(target);
    }
  },

  /**
   * Check if scroll tracking functionality is healthy using standardized checks
   */
  isScrollTrackingHealthy: MixinUtilities.createHealthCheck([
    function() { return this.scrollTargets && this.scrollTargets.length > 0; },
    function() { return this.scrollOptions !== undefined; },
    function() {
      // Check if targets have valid elements
      return this.scrollTargets.every(target => 
        target.targetElement && document.contains(target.targetElement) &&
        target.link && document.contains(target.link)
      );
    },
    function() {
      // Check if observer is working (if using IntersectionObserver)
      if (this.scrollOptions.useIntersectionObserver) {
        return this.observer !== null;
      }
      return true;
    }
  ]),

  /**
   * Clean up scroll tracking
   */
  cleanupScrollTracking() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    
    this.scrollTargets = [];
    this.activeTarget = null;
  }
};

// Validate mixin interface
validateMixinInterface(ScrollTrackingMixin, {
  methods: ['initScrollTracking', 'isScrollTrackingHealthy']
});
