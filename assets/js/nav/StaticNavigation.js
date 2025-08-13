/**
 * Static site navigation handling (bfcache, popstate, focus-return)
 */
import ComponentManager from '../core/ComponentManager.js';
import { milo } from '../core/MiloCore.js';
import { logger } from '../utils/Logger.js';

const log = logger.component('StaticNav');

export function isStaticDeployment() {
  const hasUglyURLs = window.location.pathname.includes('.html');
  const hasBaseURL = window.HugoEnvironment?.baseURL === '/' || window.HugoEnvironment?.baseURL?.endsWith('/');
  return hasUglyURLs || hasBaseURL;
}

export function syncSidebarComponent() {
  try {
    const instance = Array.from(ComponentManager.instances.values()).find((inst) => inst.name === 'navigation-sidebar-left');
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

function testSidebarInteractivity(toggle) {
  try {
    return toggle.hasAttribute('aria-expanded');
  } catch (error) {
    log.debug('Sidebar interactivity test failed:', error);
    return false;
  }
}

function hasOrphanedEventListeners() {
  try {
    const elementsWithListeners = document.querySelectorAll('[data-component-listeners]');
    for (const element of elementsWithListeners) {
      const listenerIds = element.dataset.componentListeners.split(',');
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

export function checkComponentHealth() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!milo.initialized) {
        log.warn('Core system not initialized after navigation');
        resolve('needs_full_init');
        return;
      }

      const sidebarElement = document.getElementById('sidebar-left');
      if (sidebarElement) {
      const toggles = sidebarElement.querySelectorAll('.sidebar__toggle');
        if (toggles.length > 0) {
          const firstToggle = toggles[0];
          if (!firstToggle.hasAttribute('aria-expanded')) {
            log.info('Sidebar toggles missing aria-expanded attributes');
            resolve('needs_component_reinit');
            return;
          }
          if (!firstToggle.dataset.componentListeners) {
            log.info('Sidebar toggles missing event listener tracking');
            resolve('needs_component_reinit');
            return;
          }
          if (!testSidebarInteractivity(firstToggle)) {
            log.info('Sidebar toggles not responsive to events');
            resolve('needs_component_reinit');
            return;
          }
        }
      }

      if (hasOrphanedEventListeners()) {
        log.info('Detected orphaned event listeners');
        resolve('needs_component_reinit');
        return;
      }

      resolve('healthy');
    }, 150);
  });
}

export function attachStaticNavigationHandlers({ onInit }) {
  const MAX_REINIT_ATTEMPTS = 3;
  let isCurrentPageInitialized = false;
  let lastURL = window.location.href;
  let reinitializationAttempts = 0;

  async function handleStaticNavigation(event) {
    const currentURL = window.location.href;
    const isNewPage = currentURL !== lastURL;
    if (isNewPage || event?.persisted || !isCurrentPageInitialized) {
      log.info(`Static navigation detected: ${isNewPage ? 'new page' : 'cached page'}`);
      lastURL = currentURL;
      if (isNewPage) reinitializationAttempts = 0;

      const healthStatus = await checkComponentHealth();
      if (healthStatus === 'needs_full_init') {
        if (reinitializationAttempts < MAX_REINIT_ATTEMPTS) {
          reinitializationAttempts++;
          log.info(`Performing full initialization (attempt ${reinitializationAttempts})`);
          await onInit();
          isCurrentPageInitialized = true;
          syncSidebarComponent();
        }
      } else if (healthStatus === 'needs_component_reinit') {
        if (reinitializationAttempts < MAX_REINIT_ATTEMPTS) {
          reinitializationAttempts++;
          log.info(`Reinitializing components (attempt ${reinitializationAttempts})`);
          const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
          log.info(`Static navigation: ${reinitialized} components reinitialized`);
          isCurrentPageInitialized = true;
          syncSidebarComponent();
        }
      } else {
        log.info('Components appear healthy after navigation');
        isCurrentPageInitialized = true;
        syncSidebarComponent();
      }
    }
  }

  // For static sites
  window.addEventListener('pageshow', handleStaticNavigation);
  window.addEventListener('popstate', (event) => {
    log.info('Static site popstate navigation');
    handleStaticNavigation(event);
  });
  window.addEventListener('focus', () => {
    setTimeout(() => handleStaticNavigation({ type: 'focus' }), 100);
  });

  return { handleStaticNavigation };
}

export function attachDynamicNavigationHandlers({ onInit }) {
  let isCurrentPageInitialized = false;

  window.addEventListener('pageshow', (event) => {
    if (event.persisted || !isCurrentPageInitialized) {
      log.info('Page restored/loaded, checking component state...');
      if (!milo.initialized) {
        onInit().then(() => {
          isCurrentPageInitialized = true;
          syncSidebarComponent();
        });
      } else {
        const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
        log.info(`Page navigation handled: ${reinitialized} components reinitialized`);
        isCurrentPageInitialized = true;
        syncSidebarComponent();
      }
    }
  });

  window.addEventListener('popstate', () => {
    log.info('Navigation detected (popstate), reinitializing components...');
    setTimeout(() => {
      if (milo.initialized) {
        const reinitialized = ComponentManager.reinitializeAfterCacheRestore();
        log.info(`Back/forward navigation handled: ${reinitialized} components reinitialized`);
        syncSidebarComponent();
      } else {
        onInit();
      }
    }, 100);
  });
}

export default {
  isStaticDeployment,
  attachStaticNavigationHandlers,
  attachDynamicNavigationHandlers,
  checkComponentHealth,
  syncSidebarComponent,
};

