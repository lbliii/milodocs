/**
 * Glossary Component
 * TODO: Migrate from layout-glossary.js
 */

import { Component } from '../../core/ComponentManager.js';

export class Glossary extends Component {
  constructor(config = {}) {
    super({
      name: 'glossary',
      selector: config.selector || '.glossary-entry',
      ...config
    });
  }

  async onInit() {
    console.log('Glossary component - using legacy implementation');
    
    // Legacy implementation loads automatically via layout-glossary.js
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('glossary', Glossary);