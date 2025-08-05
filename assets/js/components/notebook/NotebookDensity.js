/**
 * NotebookDensity Component
 * Handles density view switching (compact/normal/comfortable) for notebook cells
 * Follows existing pattern from RelatedContent.js view switching
 */

import { Component } from '../../core/Component.js';
import { announceToScreenReader } from '../../utils/accessibility.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('NotebookDensity');

export class NotebookDensity extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-density',
      selector: config.selector || '.notebook__toolbar',
      ...config
    });

    // Configuration options
    this.options = {
      defaultDensity: 'normal',
      storageKey: 'notebook-density-preference',
      ...this.options
    };

    // Component state
    this.currentDensity = this.options.defaultDensity;
    this.densityButtons = new Map();
    this.notebookElement = null;
  }

  /**
   * Initialize the density component
   */
  async onInit() {
    if (!this.element) {
      log.debug('No toolbar element found');
      return;
    }

    log.debug('Initializing notebook density controls');

    // Find the main notebook container
    this.notebookElement = document.querySelector('[data-component="notebook-progressive-reveal"]');
    if (!this.notebookElement) {
      log.warn('No notebook container found');
      return;
    }

    this.setupDensityButtons();
    this.loadPreferences();
    
    log.debug('NotebookDensity initialized successfully');
  }

  /**
   * Setup density toggle buttons
   */
  setupDensityButtons() {
    this.densityButtons.clear();
    
    // Find all density buttons
    this.element.querySelectorAll('.notebook__density-btn').forEach(btn => {
      const density = btn.getAttribute('data-density');
      if (density) {
        this.densityButtons.set(density, btn);
        
        // Use this.addEventListener for auto-cleanup
        this.addEventListenerSafe(btn, 'click', () => {
          this.switchDensity(density);
        });
      }
    });

    log.debug(`Found ${this.densityButtons.size} density buttons`);
  }

  /**
   * Switch between density modes (compact/normal/comfortable)
   */
  switchDensity(density) {
    if (density === this.currentDensity) return;

    const prevDensity = this.currentDensity;
    this.currentDensity = density;

    log.debug(`Switching density from ${prevDensity} to ${density}`);

    // Update button states
    this.densityButtons.forEach((btn, btnDensity) => {
      btn.classList.toggle('notebook__density-btn--active', btnDensity === density);
    });

    // Update the data-view attribute on the notebook container
    this.notebookElement.setAttribute('data-view', density);

    // Announce change for accessibility
    announceToScreenReader(`Notebook density changed to ${density}`);

    // Save preference
    this.savePreferences();

    // Emit event for other components
    this.emit('densityChanged', {
      previousDensity: prevDensity,
      currentDensity: density
    });

    log.debug(`Density switched from ${prevDensity} to ${density}`);
  }

  /**
   * Save density preference to localStorage
   */
  savePreferences() {
    try {
      const preferences = {
        density: this.currentDensity,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(preferences));
      log.trace('Density preference saved:', preferences);
    } catch (error) {
      log.warn('Failed to save density preference:', error);
    }
  }

  /**
   * Load density preference from localStorage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (!stored) return;

      const preferences = JSON.parse(stored);
      log.trace('Loaded density preference:', preferences);

      // Restore density preference
      if (preferences.density && ['compact', 'normal', 'comfortable'].includes(preferences.density)) {
        this.currentDensity = preferences.density;
        
        // Update button states
        this.densityButtons.forEach((btn, btnDensity) => {
          btn.classList.toggle('notebook__density-btn--active', btnDensity === preferences.density);
        });
        
        // Apply density to notebook
        this.notebookElement.setAttribute('data-view', preferences.density);
      }
    } catch (error) {
      log.warn('Failed to load density preference:', error);
    }
  }

  /**
   * Get current density state
   */
  getState() {
    return {
      density: this.currentDensity,
      availableDensities: Array.from(this.densityButtons.keys())
    };
  }

  /**
   * Public API: Set density mode
   */
  setDensity(density) {
    if (['compact', 'normal', 'comfortable'].includes(density)) {
      this.switchDensity(density);
    } else {
      log.warn(`Invalid density: ${density}`);
    }
  }

  /**
   * Public API: Get current density
   */
  getDensity() {
    return this.currentDensity;
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('notebook-density', NotebookDensity);