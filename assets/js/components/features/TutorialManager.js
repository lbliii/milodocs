/**
 * Tutorial Manager Component
 * TODO: Migrate from tutorial-manager.js (610 lines)
 */

import { Component } from '../../core/ComponentManager.js';

export class TutorialManager extends Component {
  constructor(config = {}) {
    super({
      name: 'tutorial-manager',
      selector: config.selector || '[data-tutorial-step]',
      ...config
    });
  }

  async onInit() {
    console.log('TutorialManager component - using legacy implementation');
    
    // Legacy implementation loads automatically via tutorial-manager.js
    // This is a large component (610 lines) that will need careful migration
    // No additional action needed for now
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('tutorial-manager', TutorialManager);