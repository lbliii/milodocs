/**
 * Components index - Lazy loading and registration of all components
 */

import { ComponentManager } from '../core/ComponentManager.js';

// Component registration with lazy loading
export const componentRegistry = {
  // Article components
  'article-clipboard': () => import('./article/Clipboard.js'),
  'article-collapse': () => import('./article/Collapse.js'),
  'article-chat': () => import('./article/Chat.js'),
  'article-header': () => import('./article/Header.js'),
  'article-tabs': () => import('./article/Tabs.js'),
  'article-toc': () => import('./article/TOC.js'),
  'article-tiles': () => import('./article/Tiles.js'),
  'article-summarization': () => import('./article/Summarization.js'),
  
  // Layout components
  'theme': () => import('./layout/Theme.js'),
  'theme-toggle': () => import('./layout/ThemeToggle.js'),
  'navigation-mobile-toggle': () => import('./layout/MobileNav.js'),
  'navigation-sidebar-left': () => import('./layout/Sidebar.js'),
  'search': () => import('./layout/Search.js'),
  'glossary': () => import('./layout/Glossary.js'),
  'chat-toc-toggle': () => import('./layout/ChatTocToggle.js'),
  
  // UI components
  'toast': () => import('./ui/Toast.js'),
  
  // Feature components
  'tutorial-manager': () => import('./features/TutorialManager.js'),
  'debug-tray': () => import('./features/DebugTray.js'),
  'performance-optimizer': () => import('./features/PerformanceOptimizer.js')
};

/**
 * Lazy load a component
 */
export async function loadComponent(name) {
  const loader = componentRegistry[name];
  if (!loader) {
    console.warn(`Component "${name}" not found in registry`);
    return null;
  }
  
  try {
    console.log(`🔄 Loading component module: ${name}`);
    const module = await loader();
    console.log(`📦 Component module loaded: ${name}`, module);
    
    // Component should be auto-registered when module loads
    const instance = ComponentManager.create(name);
    if (instance) {
      console.log(`✅ Component instance created: ${name}`);
      return await instance.init();
    } else {
      console.error(`❌ Failed to create instance for: ${name}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to load component "${name}":`, error);
    console.warn(`Falling back to legacy implementation for ${name}`);
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
  
  // Secondary components (loaded after critical ones)
  const secondary = [
    'article-toc',
    'article-chat', 
    'article-tabs',
    'article-tiles',
    'article-header',
    'article-summarization',
    'glossary',
    'chat-toc-toggle',
    'tutorial-manager',
    'debug-tray',
    'theme'                      // Base theme component
  ];
  
  console.log(`🚀 Loading ${critical.length} critical components...`);
  
  // Register critical components first
  return Promise.all(critical.map(name => {
    console.log(`🔧 Loading critical component: ${name}`);
    return loadComponent(name);
  }))
    .then((criticalResults) => {
      console.log(`✅ Critical components loaded:`, criticalResults.filter(r => r).length);
      console.log(`🔄 Loading ${secondary.length} secondary components...`);
      
      // Load secondary components in background
      const secondaryPromises = secondary.map(name => {
        console.log(`🔧 Loading secondary component: ${name}`);
        return loadComponent(name);
      });
      
      return Promise.allSettled(secondaryPromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled' && r.value);
        console.log(`✅ Secondary components loaded:`, successful.length);
        return [...criticalResults.filter(r => r), ...successful.map(r => r.value)];
      });
    });
}