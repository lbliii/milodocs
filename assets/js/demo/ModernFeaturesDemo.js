/**
 * 🚀 Modern Vanilla JS Features Demo
 * Demonstrates the cutting-edge features implemented in MiloDocs
 */

import { modernFeatures, requestIdleTime, deepClone } from '../utils/FeatureDetection.js';
import { eventBus } from '../core/EventBus.js';
import { ComponentManager } from '../core/ComponentManager.js';
import { logger } from '../utils/Logger.js';

const log = logger.component('ModernFeaturesDemo');

/**
 * Demo: requestIdleCallback for Performance
 */
export function demoRequestIdleCallback() {
  log.info('🚀 Demo: requestIdleCallback Performance Enhancement');
  
  const heavyTask = () => {
    log.info('Executing heavy task during browser idle time...');
    // Simulate heavy computation
    const start = performance.now();
    let count = 0;
    while (performance.now() - start < 10) {
      count++;
    }
    log.info(`Heavy task completed: ${count} iterations in idle time`);
  };

  // This will run when the browser is idle
  requestIdleTime(heavyTask, { 
    timeout: 2000,
    priority: 'low' 
  });
  
  log.info('Heavy task scheduled for idle time - page remains responsive!');
}

/**
 * Demo: Reactive DOM Enhancement
 */
export function demoReactiveDOMEnhancement() {
  log.info('🚀 Demo: Reactive DOM Enhancement');
  
  // Listen for reactive enhancements
  eventBus.on('component-manager:reactive-enhanced', (data) => {
    log.info(`🔄 Reactively enhanced ${data.count} components automatically!`);
  });

  // Simulate adding new content (like Hugo shortcodes or API docs)
  setTimeout(() => {
    const newContent = document.createElement('div');
    newContent.innerHTML = `
      <div data-component="article-clipboard" class="demo-component">
        <button class="copy-btn">Copy This!</button>
        <code>console.log('Automatically enhanced!');</code>
      </div>
    `;
    
    document.body.appendChild(newContent);
    log.info('Added new DOM content - should be automatically enhanced!');
    
    // Clean up after demo
    setTimeout(() => {
      newContent.remove();
      log.info('Demo content cleaned up');
    }, 3000);
  }, 1000);
}

/**
 * Demo: Enhanced EventBus with structuredClone
 */
export function demoEnhancedEventBus() {
  log.info('🚀 Demo: Enhanced EventBus with Safe Data Handling');
  
  const complexData = {
    users: [
      { id: 1, name: 'Alice', settings: { theme: 'dark' } },
      { id: 2, name: 'Bob', settings: { theme: 'light' } }
    ],
    timestamp: new Date(),
    nested: {
      deep: {
        value: 'original'
      }
    }
  };

  // Listener 1: Tries to mutate data
  eventBus.on('demo:data-safety', (data) => {
    log.info('Listener 1: Attempting to mutate data...');
    if (data.nested) {
      data.nested.deep.value = 'mutated-by-listener-1';
    }
    log.info('Listener 1: Data mutation attempt completed');
  });

  // Listener 2: Checks if data was mutated
  eventBus.on('demo:data-safety', (data) => {
    log.info('Listener 2: Checking data integrity...');
    const isOriginal = data.nested?.deep?.value === 'original';
    if (isOriginal) {
      log.info('✅ Data integrity preserved! Each listener gets independent copy.');
    } else {
      log.warn('❌ Data was mutated between listeners!');
    }
  });

  // Emit with cloning enabled (default)
  log.info('Emitting data with cloning enabled...');
  eventBus.emit('demo:data-safety', complexData);

  // Demonstrate performance options
  setTimeout(() => {
    log.info('Demonstrating async emission...');
    eventBus.emitAsync('demo:async', { message: 'This runs asynchronously!' })
      .then(() => log.info('Async emission completed'));
  }, 1000);
}

/**
 * Demo: Feature Detection in Action
 */
export function demoFeatureDetection() {
  log.info('🚀 Demo: Modern Feature Detection');
  
  const supported = Object.entries(modernFeatures)
    .filter(([_, isSupported]) => isSupported)
    .map(([feature]) => feature);
    
  const unsupported = Object.entries(modernFeatures)
    .filter(([_, isSupported]) => !isSupported)
    .map(([feature]) => feature);

  log.info(`✅ Supported modern features (${supported.length}):`, supported);
  
  if (unsupported.length > 0) {
    log.info(`⚠️ Using fallbacks for (${unsupported.length}):`, unsupported);
  } else {
    log.info('🎉 All modern features supported! You have a cutting-edge browser.');
  }

  // Demo structured clone
  const testObject = {
    map: new Map([['key', 'value']]),
    set: new Set([1, 2, 3]),
    date: new Date(),
    regex: /test/gi
  };

  try {
    const cloned = deepClone(testObject);
    log.info('✅ Deep clone successful with complex objects');
    log.info('Original Map size:', testObject.map.size);
    log.info('Cloned Map size:', cloned.map?.size || 'fallback used');
  } catch (error) {
    log.warn('Clone failed, fallback used:', error.message);
  }
}

/**
 * Demo: Performance Benefits
 */
export function demoPerformanceBenefits() {
  log.info('🚀 Demo: Performance Benefits');
  
  // Measure component loading performance
  const startTime = performance.now();
  
  eventBus.on('components:secondary-loaded', (data) => {
    const totalTime = performance.now() - startTime;
    log.info(`📊 Performance Results:`);
    log.info(`  • ${data.count} components loaded via idle callback`);
    log.info(`  • Idle loading time: ${Math.round(data.loadTime)}ms`);
    log.info(`  • Total time: ${Math.round(totalTime)}ms`);
    log.info(`  • Critical components loaded immediately while secondary loaded during idle time`);
  });

  // Monitor reactive enhancements
  let reactiveCount = 0;
  eventBus.on('component-manager:reactive-enhanced', () => {
    reactiveCount++;
    log.info(`🔄 Reactive enhancement #${reactiveCount} - Zero manual intervention required!`);
  });
}

/**
 * Run all demos
 */
export function runAllDemos() {
  log.info('🎪 Starting Modern Vanilla JS Features Demo Suite...');
  
  demoFeatureDetection();
  
  setTimeout(() => demoRequestIdleCallback(), 500);
  setTimeout(() => demoEnhancedEventBus(), 1000);
  setTimeout(() => demoReactiveDOMEnhancement(), 1500);
  setTimeout(() => demoPerformanceBenefits(), 2000);
  
  log.info('🎯 All demos started! Check the console for results.');
}

// Auto-run demos in development
if (window.location.hostname === 'localhost' && 
    new URLSearchParams(window.location.search).has('demo')) {
  runAllDemos();
}

// Global access for manual testing
window.ModernFeaturesDemo = {
  runAll: runAllDemos,
  requestIdleCallback: demoRequestIdleCallback,
  reactiveDOM: demoReactiveDOMEnhancement,
  eventBus: demoEnhancedEventBus,
  featureDetection: demoFeatureDetection,
  performance: demoPerformanceBenefits
};