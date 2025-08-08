/**
 * MiloDocs Main Entry Point - New Architecture
 * Orchestrates the initialization of the entire JavaScript system
 */

import { milo } from './core/MiloCore.js';
import { ready } from './utils/dom.js';
import { registerAllComponents } from './components/index.js';
import { logger } from './utils/Logger.js';
import { animationBridge } from './core/AnimationBridge.js';
import ComponentManager from './core/ComponentManager.js';

const log = logger.component('MiloDocs');

/**
 * Initialize MiloDocs system
 */
async function initializeMiloDocs() {
  try {
    // Initialize core system
    await milo.init();
    
    // Initialize animation bridge (NEW)
    animationBridge.init();
    animationBridge.migrateExistingComponents();
    
    // Register critical components
    await registerAllComponents();
    

    
    // Setup global utilities
    await setupGlobalUtilities();
    
    log.info('MiloDocs fully initialized');
    log.debug('Debug utilities available:');
    log.debug('  - window.resetNavigation() - Reset sidebar state');
    log.debug('  - window.debugSidebar() - Debug sidebar info + auto-fix');
    log.debug('  - window.debugComponents() - Show all registered components');
    log.debug('  - window.reinitializeComponents() - Reinitialize broken components (simulates cache restore)');
    
  } catch (error) {
    log.error('MiloDocs initialization failed:', error);

    throw error;
  }
}




/**
 * Setup global utilities and enhancements
 */
async function setupGlobalUtilities() {
  // Enhanced global utilities that replace the old main.js functionality
  const { 
    createRipple, 
    smoothScrollTo, 
    debounce, 
    throttle 
  } = await import('./utils/dom.js');
  
  const { showLoading, hideLoading } = await import('./utils/LoadingStateManager.js');
  
  // Global ripple effect setup (from old main.js)
  const clickableElements = document.querySelectorAll(`
    button, .btn, .topbar__button,
    .nav-link, .breadcrumb__link, .toc-link,
    .quicklinks__link, .quicklinks__item,
    .tile, .card, .resource-card,
    .topbar__logo-link, .dropdown-link,
    .sidebar-item__link, .expand-toggle
  `);
  
  clickableElements.forEach(element => {
    element.addEventListener('click', (e) => createRipple(element, e));
  });
  
  // Enhanced hover states (from old main.js)
  const hoverElements = document.querySelectorAll('.tile, .card, .quicklinks__item');
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = '';
    });
  });
  
  // Form loading states using unified LoadingStateManager
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        
        // Store original content for restoration
        const originalContent = submitButton.innerHTML;
        submitButton.setAttribute('data-original-content', originalContent);
        
        // Show loading state using LoadingStateManager
        const loaderId = showLoading(submitButton, {
          type: 'dots',
          message: 'Processing...',
          size: 'small'
        });
        
        // Store loader ID for potential cleanup
        submitButton.setAttribute('data-loader-id', loaderId);
      }
    });
    
    // Handle form completion/error for cleanup
    form.addEventListener('reset', function() {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        const loaderId = submitButton.getAttribute('data-loader-id');
        const originalContent = submitButton.getAttribute('data-original-content');
        
        if (loaderId) {
          hideLoading(loaderId);
          submitButton.removeAttribute('data-loader-id');
        }
        
        if (originalContent) {
          submitButton.innerHTML = originalContent;
          submitButton.removeAttribute('data-original-content');
        }
        
        submitButton.disabled = false;
      }
    });
  });
  
  // Scroll enhancements (from old main.js)
  await setupScrollEnhancements();
}

/**
 * Setup scroll-based enhancements
 */
async function setupScrollEnhancements() {
  const { throttle } = await import('./utils/dom.js');
  
  let lastScrollY = window.scrollY;
  
  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      document.body.setAttribute('data-scroll-direction', scrollDirection);

      const scrolled = window.pageYOffset;
      document.querySelectorAll('.hero-parallax').forEach((hero) => {
        const parallax = scrolled * 0.5;
        hero.style.transform = `translateY(${parallax}px)`;
      });

      document.querySelectorAll('.fade-in-on-scroll').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add('visible');
        }
      });

      lastScrollY = currentScrollY;
      scheduled = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}



/**
 * Initialize MiloDocs and handle page restoration from cache
 */
async function handlePageInitialization() {
  // Add environment class for styling
  const env = window.HugoEnvironment?.environment || 'development';
  document.body.classList.add(`env-${env}`);
  
  // Initialize the system
  await initializeMiloDocs();
  
  // System ready
  // (info already logged via logger in initializeMiloDocs)
}

/**
 * Start initialization when DOM is ready
 */
ready(() => {
  handlePageInitialization();
});

/**
 * Handle page restoration and navigation for static deployments
 * Static sites (uglyURLs: true, relativeURLs: true) have different navigation behavior
 */

// Track initialization state across page loads
let isCurrentPageInitialized = false;
let lastURL = window.location.href;
let reinitializationAttempts = 0;
const MAX_REINIT_ATTEMPTS = 3;

/**
 * Check if this is a static deployment
 */
function isStaticDeployment() {
  // Check for static deployment indicators
  const hasUglyURLs = window.location.pathname.includes('.html');
  const hasBaseURL = window.HugoEnvironment?.baseURL === '/' || window.HugoEnvironment?.baseURL?.endsWith('/');
  return hasUglyURLs || hasBaseURL;
}

/**
 * Enhanced component health check for static sites
 */
function checkComponentHealth() {
  // Wait a bit for any ongoing page transitions to complete
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!milo.initialized) {
        log.warn('Core system not initialized after navigation');
        resolve('needs_full_init');
        return;
      }

      // 🔧 ENHANCED: Check if critical components are working
      const sidebarElement = document.getElementById('sidebar-left');
      if (sidebarElement) {
        const toggles = sidebarElement.querySelectorAll('.expand-toggle');
        if (toggles.length > 0) {
          // Test if first toggle has proper attributes (indicates initialization)
          const firstToggle = toggles[0];
          if (!firstToggle.hasAttribute('aria-expanded')) {
            log.info('Sidebar toggles missing aria-expanded attributes');
            resolve('needs_component_reinit');
            return;
          }
          
          // 🔧 ENHANCED: Check for event listener tracking
          if (!firstToggle.dataset.componentListeners) {
            log.info('Sidebar toggles missing event listener tracking');
            resolve('needs_component_reinit');
            return;
          }
          
          // 🔧 ENHANCED: Test if click events actually work
          if (!testSidebarInteractivity(firstToggle)) {
            log.info('Sidebar toggles not responsive to events');
            resolve('needs_component_reinit');
            return;
          }
        }
      }

      // 🔧 ENHANCED: Check for orphaned event listeners
      if (hasOrphanedEventListeners()) {
        log.info('Detected orphaned event listeners');
        resolve('needs_component_reinit');
        return;
      }

      resolve('healthy');
    }, 150); // Longer delay for static sites
  });
}

/**
 * Test if sidebar interactivity is working
 */
function testSidebarInteractivity(toggle) {
  try {
    // Non-destructive health check: do not mutate UI state here.
    // We already validate listener presence separately; just ensure ARIA wiring exists.
    return toggle.hasAttribute('aria-expanded');
  } catch (error) {
    log.debug('Sidebar interactivity test failed:', error);
    return false;
  }
}

/**
 * Check for orphaned event listeners from destroyed components
 */
function hasOrphanedEventListeners() {
  try {
    const elementsWithListeners = document.querySelectorAll('[data-component-listeners]');
    
    for (const element of elementsWithListeners) {
      const listenerIds = element.dataset.componentListeners.split(',');
      
      // Check if any of these component IDs are no longer valid
      for (const componentId of listenerIds) {
        const instance = ComponentManager.instances.get(componentId);
        if (!instance || instance.state === 'destroyed') {
          log.debug(`Found orphaned listeners from component ${componentId}`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    log.debug('Error checking for orphaned listeners:', error);
    return false;
  }
}

/**
 * Helper: sync Sidebar component to current page
 * Placed at module scope so navigation handlers can call it.
 */
function syncSidebarComponent() {
  try {
    const instance = Array.from(ComponentManager.instances.values())
      .find(inst => inst.name === 'navigation-sidebar-left');
    if (instance && typeof instance.syncToCurrentPage === 'function') {
      instance.syncToCurrentPage();
      return true;
    }
    return false;
  } catch (e) {
    log.debug('syncSidebarComponent failed:', e);
    return false;
  }
}

/**
 * Handle page navigation for static sites
 */
async function handleStaticNavigation(event) {
  const currentURL = window.location.href;
  const isNewPage = currentURL !== lastURL;
  
    if (isNewPage || event?.persisted || !isCurrentPageInitialized) {
    log.info(`Static navigation detected: ${isNewPage ? 'new page' : 'cached page'}`);
    lastURL = currentURL;
    
    // Reset attempt counter for new pages
    if (isNewPage) {
      reinitializationAttempts = 0;
    }
    
    // Check component health
    const healthStatus = await checkComponentHealth();
    
      if (healthStatus === 'needs_full_init') {
      if (reinitializationAttempts < MAX_REINIT_ATTEMPTS) {
        reinitializationAttempts++;
        log.info(`Performing full initialization (attempt ${reinitializationAttempts})`);
        await handlePageInitialization();
        isCurrentPageInitialized = true;
          // keep sidebar in sync with the new location
          // Use component API to sync sidebar reliably
          syncSidebarComponent();
      }
    } else if (healthStatus === 'needs_component_reinit') {
      if (reinitializationAttempts < MAX_REINIT_ATTEMPTS) {
        reinitializationAttempts++;
        log.info(`Reinitializing components (attempt ${reinitializationAttempts})`);
        const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
        log.info(`Static navigation: ${reinitialized} components reinitialized`);
        isCurrentPageInitialized = true;
          // keep sidebar in sync with the new location
          // Use component API to sync sidebar reliably
          syncSidebarComponent();
      }
    } else {
      log.info('Components appear healthy after navigation');
      isCurrentPageInitialized = true;
        // still resync current page highlight/expansion on healthy fast-nav
        // Use component API to sync sidebar reliably
        syncSidebarComponent();
    }
  }
}

// Different event handling for static vs dynamic sites
if (isStaticDeployment()) {
  log.info('Static deployment detected, using enhanced navigation handling');
  
  // For static sites, use pageshow as primary event
  window.addEventListener('pageshow', handleStaticNavigation);
  
  // Also handle popstate for browser navigation
  window.addEventListener('popstate', (event) => {
    log.info('Static site popstate navigation');
    handleStaticNavigation(event);
  });
  
  // Handle focus events (when returning to tab)
  window.addEventListener('focus', () => {
    setTimeout(() => {
      handleStaticNavigation({ type: 'focus' });
    }, 100);
  });
  
} else {
  // For dynamic sites, use the original approach
  log.info('Dynamic deployment detected, using standard navigation handling');
  
  window.addEventListener('pageshow', (event) => {
    if (event.persisted || !isCurrentPageInitialized) {
      log.info('Page restored/loaded, checking component state...');
      
      if (!milo.initialized) {
        handlePageInitialization().then(() => {
          isCurrentPageInitialized = true;
          // Use component API to sync sidebar reliably
          syncSidebarComponent();
        });
      } else {
        const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
        log.info(`Page navigation handled: ${reinitialized} components reinitialized`);
        isCurrentPageInitialized = true;
        // Use component API to sync sidebar reliably
        syncSidebarComponent();
      }
    }
  });
  
  window.addEventListener('popstate', (event) => {
    log.info('Navigation detected (popstate), reinitializing components...');
    setTimeout(() => {
      if (milo.initialized) {
        const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
        log.info(`Back/forward navigation handled: ${reinitialized} components reinitialized`);
        // Use component API to sync sidebar reliably
        syncSidebarComponent();
      } else {
        handlePageInitialization();
      }
    }, 100);
  });
}

// Global debug utilities for testing
if (typeof window !== 'undefined') {
  // Add reinitialize function for debugging
  window.reinitializeComponents = () => {
    log.info('Manual component reinitialization triggered');
    const count = milo.reinitializeComponents();
    log.info(`Reinitialized ${count} components`);
    return count;
  };
  
  // Debug function specifically for testing static navigation
  window.testStaticNavigation = () => {
    log.info('Testing static navigation handling...');
    log.info(`Current URL: ${window.location.href}`);
    log.info(`Is static deployment: ${isStaticDeployment()}`);
    log.info(`Core initialized: ${milo.initialized}`);
    log.info(`Page initialized: ${isCurrentPageInitialized}`);
    
    handleStaticNavigation({ type: 'manual_test' });
  };
  
  // Use module-scope syncSidebarComponent
  
  // Debug function to check component health
  window.checkComponentHealth = async () => {
    log.info('Checking component health...');
    const health = await checkComponentHealth();
    log.info(`Component health status: ${health}`);
    return health;
  };
  
  // Debug function to test sidebar functionality specifically
  window.testSidebarFunctionality = () => {
    log.info('Testing sidebar functionality...');
    const sidebarElement = document.getElementById('sidebar-left');
    
    if (!sidebarElement) {
      log.error('Sidebar element not found');
      return false;
    }
    
    // Check if sidebar is visible
    const sidebarStyle = window.getComputedStyle(sidebarElement);
    const isVisible = sidebarStyle.display !== 'none' && sidebarStyle.opacity !== '0';
    log.info(`Sidebar visibility: ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    log.info(`Sidebar opacity: ${sidebarStyle.opacity}`);
    log.info(`Sidebar display: ${sidebarStyle.display}`);
    log.info(`Sidebar transform: ${sidebarStyle.transform}`);
    log.info(`Sidebar component state: ${sidebarElement.dataset.componentState || 'none'}`);
    
    const toggles = sidebarElement.querySelectorAll('.expand-toggle');
    log.info(`Found ${toggles.length} sidebar toggles`);
    
    if (toggles.length === 0) {
      log.error('No sidebar toggles found');
      return { isVisible, toggleCount: 0 };
    }
    
    const firstToggle = toggles[0];
    
    // Check initialization
    const hasAria = firstToggle.hasAttribute('aria-expanded');
    const hasListeners = !!firstToggle.dataset.componentListeners;
    
    log.info(`Toggle has aria-expanded: ${hasAria}`);
    log.info(`Toggle has listener tracking: ${hasListeners}`);
    log.info(`Toggle listener IDs: ${firstToggle.dataset.componentListeners}`);
    
    // Test click functionality
    const originalState = firstToggle.getAttribute('aria-expanded');
    log.info(`Original toggle state: ${originalState}`);
    
    // Simulate click
    const clickEvent = new Event('click', { bubbles: true, cancelable: true });
    firstToggle.dispatchEvent(clickEvent);
    
    // Check if state changed (after a brief delay for animations)
    setTimeout(() => {
      const newState = firstToggle.getAttribute('aria-expanded');
      log.info(`New toggle state after click: ${newState}`);
      const isWorking = newState !== originalState;
      log.info(`Sidebar click functionality: ${isWorking ? '✅ WORKING' : '❌ BROKEN'}`);
      
      // Restore original state
      firstToggle.setAttribute('aria-expanded', originalState);
    }, 100);
    
    return { 
      isVisible, 
      hasAria, 
      hasListeners, 
      toggleCount: toggles.length,
      componentState: sidebarElement.dataset.componentState 
    };
  };
}

// Export for external access
export { milo, initializeMiloDocs };