/**
 * Article Table of Contents Component
 * TODO: Migrate from article-toc.js
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleTOC extends Component {
  constructor(config = {}) {
    super({
      name: 'article-toc',
      selector: config.selector || '#TableOfContents',
      ...config
    });
  }

  async onInit() {
    console.log('ArticleTOC component - using legacy implementation');
    
    // Legacy implementation loads automatically via article-toc.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-toc', ArticleTOC);