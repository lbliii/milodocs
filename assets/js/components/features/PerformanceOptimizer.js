/**
 * Performance Optimizer Component
 * Handles lazy loading, performance monitoring, accessibility enhancements, and UX optimizations
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { debounce, throttle } from '../../utils/dom.js';

export class PerformanceOptimizer extends Component {
  constructor(config = {}) {
    super({
      name: 'performance-optimizer',
      selector: config.selector || 'body',
      ...config
    });
    
    this.lazyObserver = null;
    this.performanceObservers = [];
    this.isDebugMode = config.debugMode || window.location.hostname === 'localhost';
    this.memoryCheckInterval = null;
    
    // Touch gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  async onInit() {
    if (!this.element) {
      console.warn('PerformanceOptimizer: Target element not found');
      return;
    }

    // Initialize all optimizations
    await Promise.all([
      this.setupLazyLoading(),
      this.setupLoadingStates(),
      this.setupPerformanceMonitoring(),
      this.setupA11yEnhancements(),
      this.setupMobileOptimizations(),
      this.setupUXUtilities()
    ]);
    
    console.log('PerformanceOptimizer: All optimizations initialized');
  }

  /**
   * Setup lazy loading for images and components
   */
  async setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, skipping lazy loading');
      return;
    }

    this.lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleLazyLoad(entry.target);
        }
      });
    }, { 
      rootMargin: '100px',
      threshold: 0.1
    });

    // Observe all lazy load candidates
    const lazyElements = document.querySelectorAll('[data-src], [data-lazy-component]');
    lazyElements.forEach(el => this.lazyObserver.observe(el));
    
    console.log(`PerformanceOptimizer: Observing ${lazyElements.length} lazy load elements`);
  }

  /**
   * Handle lazy loading for a specific element
   */
  async handleLazyLoad(element) {
    try {
      // Lazy load images
      if (element.dataset.src) {
        element.src = element.dataset.src;
        element.removeAttribute('data-src');
        element.classList.add('lazy-loaded');
        this.emit('performance:imageLoaded', { element });
      }
      
      // Lazy load components
      if (element.dataset.lazyComponent) {
        const componentName = element.dataset.lazyComponent;
        await this.loadLazyComponent(componentName, element);
      }
      
      this.lazyObserver.unobserve(element);
    } catch (error) {
      console.error('Lazy loading failed:', error);
    }
  }

  /**
   * Load a lazy component
   */
  async loadLazyComponent(componentName, element) {
    const componentMap = {
      'chat': () => import('../article/Chat.js'),
      'search': () => import('../layout/Search.js')
    };
    
    const loader = componentMap[componentName];
    if (loader) {
      try {
        await loader();
        element.classList.add('loaded');
        this.emit('performance:componentLoaded', { componentName, element });
      } catch (error) {
        console.error(`Failed to load component ${componentName}:`, error);
      }
    }
  }

  /**
   * Setup enhanced loading states
   */
  setupLoadingStates() {
    const contentArea = document.getElementById('articleContent');
    if (contentArea && !contentArea.innerHTML.trim()) {
      this.showContentSkeleton(contentArea);
    }
    
    // Note: Page transitions disabled for static sites
    console.log('PerformanceOptimizer: Loading states configured');
  }

  /**
   * Show content skeleton while loading
   */
  showContentSkeleton(container) {
    const skeleton = `
      <div class="content-skeleton space-y-4" aria-label="Loading content">
        <div class="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
        </div>
        <div class="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>
    `;
    container.innerHTML = skeleton;
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.emit('performance:lcp', { value: lastEntry.startTime });
        if (this.isDebugMode) {
          console.log('LCP:', lastEntry.startTime);
        }
      });
      lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
      this.performanceObservers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer failed:', error);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.emit('performance:fid', { value: fid });
          if (this.isDebugMode) {
            console.log('FID:', fid);
          }
        });
      });
      fidObserver.observe({entryTypes: ['first-input']});
      this.performanceObservers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer failed:', error);
    }

    // Memory monitoring (debug mode only)
    if (this.isDebugMode && 'memory' in performance) {
      this.memoryCheckInterval = setInterval(() => {
        const memory = performance.memory;
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB'
        };
        this.emit('performance:memory', memoryInfo);
        console.log('Memory usage:', memoryInfo);
      }, 30000);
    }
  }

  /**
   * Setup accessibility enhancements
   */
  setupA11yEnhancements() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderOptimizations();
  }

  /**
   * Enhanced keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Navigate with arrow keys in sidebar
      if (e.target.closest('#linkTree')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const direction = e.key === 'ArrowDown' ? 1 : -1;
          this.navigateSidebar(direction);
        }
      }

      // Quick navigation shortcuts
      if (e.altKey) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
            this.emit('a11y:searchFocused');
            break;
          case 'n':
            e.preventDefault();
            document.querySelector('.next-link')?.focus();
            this.emit('a11y:nextFocused');
            break;
          case 'p':
            e.preventDefault();
            document.querySelector('.prev-link')?.focus();
            this.emit('a11y:prevFocused');
            break;
        }
      }
    });
  }

  /**
   * Navigate sidebar with keyboard
   */
  navigateSidebar(direction) {
    const sidebarLinks = document.querySelectorAll('#linkTree a');
    const currentIndex = Array.from(sidebarLinks).indexOf(document.activeElement);
    const nextIndex = Math.max(0, Math.min(sidebarLinks.length - 1, currentIndex + direction));
    sidebarLinks[nextIndex]?.focus();
  }

  /**
   * Focus management for modals and overlays
   */
  setupFocusManagement() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const activeModal = document.querySelector('.modal:not(.hidden)');
        if (activeModal) {
          this.trapFocus(e, activeModal);
        }
      }
    });
  }

  /**
   * Trap focus within a container
   */
  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }

  /**
   * Screen reader optimizations
   */
  setupScreenReaderOptimizations() {
    // Create live region for announcements
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);

    // Global announcement function
    window.announceToScreenReader = (message) => {
      announcer.textContent = message;
      this.emit('a11y:announced', { message });
      setTimeout(() => announcer.textContent = '', 1000);
    };
  }

  /**
   * Mobile optimizations
   */
  setupMobileOptimizations() {
    // Touch gesture handling
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;

      // Swipe gestures for navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right - go to previous page
          document.querySelector('.prev-link')?.click();
          this.emit('mobile:swipeRight');
        } else {
          // Swipe left - go to next page
          document.querySelector('.next-link')?.click();
          this.emit('mobile:swipeLeft');
        }
      }
    }, { passive: true });

    // Viewport height fix for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', debounce(setVH, 100));
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
  }

  /**
   * Setup UX utilities
   */
  setupUXUtilities() {
    // Enhanced global UX utilities (notifications now handled by Toast component)
    if (!window.MiloUX) {
      window.MiloUX = {};
    }
    
    // Only add utilities that aren't handled by other components
    window.MiloUX.smoothScrollTo = (element, offset = 0) => {
      this.smoothScrollTo(element, offset);
    };
  }

  // Notification system moved to dedicated Toast component

  /**
   * Smooth scroll to element
   */
  smoothScrollTo(element, offset = 0) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      this.emit('ux:smoothScrolled', { element, offset });
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // Clean up observers
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
    }
    
    this.performanceObservers.forEach(observer => {
      observer.disconnect();
    });
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    
    console.log('PerformanceOptimizer: Component destroyed and cleaned up');
  }
}

// Auto-register component
ComponentManager.register('performance-optimizer', PerformanceOptimizer);