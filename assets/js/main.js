/**
 * MiloDocs Main Entry Point - New Architecture
 * Orchestrates the initialization of the entire JavaScript system
 */

import { milo } from './core/MiloCore.js';
import { ready } from './utils/dom.js';
import { registerAllComponents } from './components/index.js';
import { logger } from './utils/Logger.js';
import configureLogging from './utils/LoggingConfig.js';
import { animationBridge } from './core/AnimationBridge.js';
import ComponentManager from './core/ComponentManager.js';
import installGlobalErrorGuards from './init/ErrorGuards.js';
import { setupGlobalEnhancements } from './ui/GlobalEnhancements.js';
import { isStaticDeployment, attachStaticNavigationHandlers, attachDynamicNavigationHandlers, checkComponentHealth, syncSidebarComponent } from './nav/StaticNavigation.js';
import installDebugTools from './debug/DevTools.js';

const log = logger.component('MiloDocs');

/**
 * Configure centralized logging and optional console shim
 * Allows build/runtime control via: window.HugoEnvironment.logLevel or data-log-level on <html>
 */
// configureLogging moved to utils/LoggingConfig.js to slim this entry file

/**
 * Initialize MiloDocs system
 */
async function initializeMiloDocs() {
  try {
    // Configure logging early; guard to avoid interfering with error handling
    try { configureLogging(); } catch (_) {}
    // Global safety nets: avoid unhandled promise and error floods
    installGlobalErrorGuards();
    // Initialize core system
    await milo.init();
    
    // Initialize animation bridge (NEW)
    animationBridge.init();
    animationBridge.migrateExistingComponents();
    
    // Register critical components
    await registerAllComponents();
    

    
    // Setup global utilities
    await setupGlobalEnhancements();
    
    log.info('MiloDocs fully initialized');
    log.debug('Debug utilities available:');
    log.debug('  - window.resetNavigation() - Reset sidebar state');
    log.debug('  - window.debugSidebar() - Debug sidebar info + auto-fix');
    log.debug('  - window.debugComponents() - Show all registered components');
    log.debug('  - window.reinitializeComponents() - Reinitialize broken components (simulates cache restore)');
    installDebugTools();
    
  } catch (error) {
    log.error('MiloDocs initialization failed:', error);

    throw error;
  }
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
  attachStaticNavigationHandlers({ onInit: handlePageInitialization });
} else {
  log.info('Dynamic deployment detected, using standard navigation handling');
  attachDynamicNavigationHandlers({ onInit: handlePageInitialization });
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