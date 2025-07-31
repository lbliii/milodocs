/**
 * Search Component
 * TODO: Migrate from lunr.js and layout-search.js
 */

import { Component } from '../../core/ComponentManager.js';

export class Search extends Component {
  constructor(config = {}) {
    super({
      name: 'search',
      selector: config.selector || '#searchInput',
      ...config
    });
  }

  async onInit() {
    console.log('Search component - using legacy implementation');
    
    // Legacy implementation loads automatically via lunr.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('search', Search);