/**
 * Components index - Lazy loading and registration of all components
 * Enhanced with modern vanilla JS performance optimizations
 */

import { ComponentManager } from '../core/ComponentManager.js';
import { logger } from '../utils/Logger.js';
import { requestIdleTime, logFeatureSupport } from '../utils/FeatureDetection.js';

const log = logger.component('ComponentLoader');

// Component registration with lazy loading
export const componentRegistry = {
  // Article components
  'article-clipboard': () => import('./article/Clipboard.js'),
  'article-collapse': () => import('./article/Collapse.js'),
  'article-chat': () => import('./chat/index.js'),
  'article-header': () => import('./article/Header.js'),
  'article-tabs': () => import('./article/Tabs.js'),
  'article-toc': () => import('./article/TOC.js'),
  'article-tiles': () => import('./article/Tiles.js'),
  'article-summarization': () => import('./article/Summarization.js'),
  'article-related-content': () => import('./article/RelatedContent.js'),
  'copy-page': () => import('./article/CopyPage.js'),
  'notebook-viewer': () => import('./notebook/NotebookViewer.js'),
  'notebook-progressive-reveal': () => import('./article/NotebookProgressiveReveal.js'),
  'notebook-cell': () => import('./notebook/NotebookCell.js'),
  'notebook-navigation': () => import('./notebook/NotebookNavigation.js'),
  'notebook-state': () => import('./notebook/NotebookState.js'),
  
  // OpenAPI components
  'openapi-viewer': () => import('./article/OpenAPIViewer.js'),
  'openapi-collapse': () => import('./article/OpenAPICollapse.js'),
  'endpoint-filter': () => import('./openapi/EndpointFilter.js'),
  'endpoint-data': () => import('./openapi/endpoint/EndpointData.js'),
  'filter-logic': () => import('./openapi/endpoint/FilterLogic.js'),
  'filter-ui': () => import('./openapi/endpoint/FilterUI.js'),
  'filter-persistence': () => import('./openapi/endpoint/FilterPersistence.js'),

  
  // Layout components
  'theme': () => import('./layout/Theme.js'),
  'theme-toggle': () => import('./layout/ThemeToggle.js'),
  'openapi-sidebar': () => import('./layout/OpenAPISidebar.js'),
  'navigation-mobile-toggle': () => import('./layout/MobileNav.js'),
  'navigation-sidebar-left': () => import('./layout/Sidebar.js'),

  'glossary': () => import('./layout/Glossary.js'),
  'chat-toc-toggle': () => import('./layout/ChatTocToggle.js'),
  
  // UI components
  'toast': () => import('./ui/Toast.js'),
  
  // Feature components
  'tutorial-manager': () => import('./features/TutorialManager.js'),

  'performance-optimizer': () => import('./features/PerformanceOptimizer.js')
};

/**
 * Lazy load a component
 */
export async function loadComponent(name) {
  const loader = componentRegistry[name];
  if (!loader) {
    log.warn(`Component "${name}" not found in registry`);
    return null;
  }
  
  try {
    log.debug(`Loading component module: ${name}`);
    const module = await loader();
    log.trace(`Component module loaded: ${name}`, module);
    
    // Component should be auto-registered when module loads
    const instance = ComponentManager.create(name);
    if (instance) {
      log.trace(`Component instance created: ${name}`);
      return await instance.init();
    } else {
      log.error(`Failed to create instance for: ${name}`);
      return null;
    }
  } catch (error) {
    log.error(`Failed to load component "${name}":`, error);
    log.warn(`Falling back to legacy implementation for ${name}`);
    return null;
  }
}

/**
 * Load multiple components
 */
export async function loadComponents(names) {
  const promises = names.map(name => loadComponent(name));
  const results = await Promise.allSettled(promises);
  
  return results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
}

/**
 * Register all available components for discovery
 * Enhanced with requestIdleCallback for optimal performance
 */
export function registerAllComponents() {
  // Critical components that should be registered immediately
  const critical = [
    'toast',                     // Must be first for notifications
    'theme-toggle',              // Must be early for theme application
    'navigation-sidebar-left',   // Essential for navigation
    'search',                    // Essential search functionality
    'navigation-mobile-toggle',  // Mobile navigation
    'article-clipboard',         // Code copying
    'article-collapse',          // Content collapsing
    'performance-optimizer'      // Performance enhancements
  ];
  
  // Secondary components (loaded during idle time)
  const secondary = [
    'article-toc',
    'article-chat', 
    'article-tabs',
    'article-tiles',
    'article-header',
    'article-summarization',
    'article-related-content',     // Enhanced related content with view toggling
    'copy-page',                   // Copy page functionality
    'notebook-progressive-reveal', // Progressive reveal for notebook cells
    
    // OpenAPI components
    'openapi-viewer',
    'openapi-collapse', 
    'endpoint-filter',

    'glossary',
    'chat-toc-toggle',
    'tutorial-manager'
    // 'theme' component removed - conflicts with 'theme-toggle' loaded above
  ];
  
  // Log feature support in debug mode
  if (window.location.hostname === 'localhost') {
    logFeatureSupport();
  }
  
  log.info(`Loading ${critical.length} critical components...`);
  
  // Register critical components first
  return Promise.all(critical.map(name => {
    log.debug(`Loading critical component: ${name}`);
    return loadComponent(name);
  }))
    .then((criticalResults) => {
      const successfulCritical = criticalResults.filter(r => r).length;
      log.info(`Critical components loaded: ${successfulCritical}/${critical.length}`);
      
      // 🚀 MODERN ENHANCEMENT: Load secondary components during idle time
      loadSecondaryComponentsInIdle(secondary);
      
      // Return critical components immediately for faster perceived performance
      return criticalResults.filter(r => r);
    });
}

/**
 * 🚀 Load secondary components during browser idle time
 * This dramatically improves perceived performance by prioritizing critical components
 */
function loadSecondaryComponentsInIdle(secondary) {
  const startTime = performance.now();
  
  log.info(`Scheduling ${secondary.length} secondary components for idle loading...`);
  
  // Use requestIdleCallback for optimal performance
  requestIdleTime(
    async () => {
      const idleStartTime = performance.now();
      log.debug('Browser is idle, loading secondary components...');
      
      // Load secondary components in batches to avoid blocking
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < secondary.length; i += batchSize) {
        batches.push(secondary.slice(i, i + batchSize));
      }
      
      // Process batches with small delays between them
      for (const [index, batch] of batches.entries()) {
        if (index > 0) {
          // Small delay between batches to keep the main thread responsive
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        log.trace(`Loading batch ${index + 1}/${batches.length}:`, batch);
        
        const batchPromises = batch.map(name => {
          log.trace(`Loading secondary component: ${name}`);
          return loadComponent(name);
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        const batchSuccessful = batchResults.filter(r => r.status === 'fulfilled' && r.value);
        
        log.trace(`Batch ${index + 1} completed: ${batchSuccessful.length}/${batch.length} successful`);
      }
      
      const totalTime = performance.now() - startTime;
      const idleTime = performance.now() - idleStartTime;
      
      log.info(`Secondary components loaded in ${Math.round(idleTime)}ms (${Math.round(totalTime)}ms total)`);
      
      // Emit completion event for other components that might depend on this
      import('../core/EventBus.js').then(({ eventBus }) => {
        eventBus.emit('components:secondary-loaded', {
          count: secondary.length,
          loadTime: idleTime,
          totalTime
        });
      });
    },
    { 
      timeout: 3000,  // Maximum wait time
      priority: 'low' // These are non-critical
    }
  );
}