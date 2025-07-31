/**
 * Article Chat Component
 * TODO: Migrate from article-chat.js
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleChat extends Component {
  constructor(config = {}) {
    super({
      name: 'article-chat',
      selector: config.selector || '#chatContainer',
      ...config
    });
  }

  async onInit() {
    // Temporary: Load legacy implementation
    console.log('ArticleChat component - using legacy implementation');
    
    // Import and run legacy code
    try {
      const legacyModule = await import('../../article-chat.js');
      console.log('Legacy chat module loaded');
    } catch (error) {
      console.warn('Legacy chat module not available:', error);
    }
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-chat', ArticleChat);