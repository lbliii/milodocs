/**
 * Article Tiles Component
 * TODO: Migrate from article-tiles.js
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleTiles extends Component {
  constructor(config = {}) {
    super({
      name: 'article-tiles',
      selector: config.selector || '.tile',
      ...config
    });
  }

  async onInit() {
    console.log('ArticleTiles component - using legacy implementation');
    
    // Legacy implementation loads automatically via article-tiles.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-tiles', ArticleTiles);