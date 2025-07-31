/**
 * Mobile Navigation Component
 * TODO: Migrate from layout-mobile-nav.js
 */

import { Component } from '../../core/ComponentManager.js';

export class MobileNav extends Component {
  constructor(config = {}) {
    super({
      name: 'mobile-nav',
      selector: config.selector || '#mobileNavToggle',
      ...config
    });
  }

  async onInit() {
    console.log('MobileNav component - using legacy implementation');
    
    // Legacy implementation loads automatically via layout-mobile-nav.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('mobile-nav', MobileNav);