/**
 * Article Tabs Component
 * TODO: Migrate from article-tabs.js
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleTabs extends Component {
  constructor(config = {}) {
    super({
      name: 'article-tabs',
      selector: config.selector || '[data-component="tabs"]',
      ...config
    });
  }

  async onInit() {
    console.log('ArticleTabs component - using legacy implementation');
    
    // Legacy implementation loads automatically via article-tabs.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-tabs', ArticleTabs);