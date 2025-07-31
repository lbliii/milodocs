/**
 * Debug Tray Component
 * TODO: Migrate from debug.js
 */

import { Component } from '../../core/ComponentManager.js';

export class DebugTray extends Component {
  constructor(config = {}) {
    super({
      name: 'debug-tray',
      selector: config.selector || '#hugo-debug-terminal',
      ...config
    });
  }

  async onInit() {
    console.log('DebugTray component - using legacy implementation');
    
    // Legacy implementation loads automatically via debug.js
    // The DebugTray class should be available globally
    if (window.debugTray) {
      console.log('Legacy debug tray already initialized');
    }
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('debug-tray', DebugTray);