/**
 * Article Header Component
 * TODO: Migrate from article-header.js
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleHeader extends Component {
  constructor(config = {}) {
    super({
      name: 'article-header',
      selector: config.selector || '[data-component="article-header"]',
      ...config
    });
  }

  async onInit() {
    console.log('ArticleHeader component - using legacy implementation');
    
    // Legacy implementation is already loaded globally
    // The ArticleHeader class from article-header.js should be available
    if (window.ArticleHeader) {
      console.log('Legacy article header already initialized');
    }
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-header', ArticleHeader);