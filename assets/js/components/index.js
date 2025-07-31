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
  
  // Layout components
  'theme': () => import('./layout/Theme.js'),
  'mobile-nav': () => import('./layout/MobileNav.js'),
  'sidebar': () => import('./layout/Sidebar.js'),
  'search': () => import('./layout/Search.js'),
  'glossary': () => import('./layout/Glossary.js'),
  
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
    const module = await loader();
    console.log(`📦 Loaded component: ${name}`);
    return ComponentManager.create(name);
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
    'theme',
    'article-clipboard',
    'article-collapse'
  ];
  
  // Register critical components
  return Promise.all(critical.map(name => loadComponent(name)));
}