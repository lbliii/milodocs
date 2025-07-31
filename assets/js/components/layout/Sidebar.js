/**
 * Sidebar Component
 * TODO: Migrate from layout-sidebar-left.js
 */

import { Component } from '../../core/ComponentManager.js';

export class Sidebar extends Component {
  constructor(config = {}) {
    super({
      name: 'sidebar',
      selector: config.selector || '#linkTree',
      ...config
    });
  }

  async onInit() {
    console.log('Sidebar component - using legacy implementation');
    
    // Legacy implementation loads automatically via layout-sidebar-left.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('sidebar', Sidebar);