/**
 * Debug Tray Component
 * Interactive debug interface for Hugo development with expandable panels
 */

import { Component } from '../../core/ComponentManager.js';

export class DebugTray extends Component {
  constructor(config = {}) {
    super({
      name: 'debug-tray',
      selector: config.selector || '#hugo-debug-terminal, #hugo-template-info',
      ...config
    });
    
    this.state = {
      configExpanded: false,
      templateExpanded: false,
      bothExpanded: false,
      isVisible: true
    };
    
    this.elements = {
      config: null,
      template: null,
      configHeader: null,
      templateHeader: null
    };
    
    this.timeUpdateInterval = null;
  }

  async onInit() {
    // Cache debug elements
    this.cacheElements();
    
    if (!this.elements.config && !this.elements.template) {
      console.warn('DebugTray: No debug elements found');
      return;
    }

    this.setupEventListeners();
    this.startTimeUpdates();
    this.updateUI();
    this.setupGlobalAPI();
    
    console.log('DebugTray: Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements.config = document.getElementById('hugo-debug-terminal');
    this.elements.template = document.getElementById('hugo-template-info');
    this.elements.configHeader = this.elements.config?.querySelector('.debug-header');
    this.elements.templateHeader = this.elements.template?.querySelector('.debug-header');
  }

  /**
   * Setup event listeners for debug interactions
   */
  setupEventListeners() {
    // Config panel toggle
    if (this.elements.configHeader) {
      this.elements.configHeader.addEventListener('click', (e) => {
        if (!e.target.classList.contains('debug-button')) {
          this.toggleConfig();
        }
      });
    }

    // Template panel toggle
    if (this.elements.templateHeader) {
      this.elements.templateHeader.addEventListener('click', (e) => {
        if (!e.target.classList.contains('debug-button')) {
          this.toggleTemplate();
        }
      });
    }

    // Unified tray toggle buttons
    this.setupTrayButtons();
    
    // Close buttons
    this.setupCloseButtons();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Setup tray toggle buttons
   */
  setupTrayButtons() {
    const trayButtons = document.querySelectorAll('[data-debug-action="toggle-tray"]');
    trayButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTray();
      });
    });
  }

  /**
   * Setup close buttons
   */
  setupCloseButtons() {
    const closeButtons = document.querySelectorAll('[data-debug-action="close"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTray();
      });
    });
  }

  /**
   * Toggle config panel
   */
  toggleConfig() {
    this.state.configExpanded = !this.state.configExpanded;
    this.updateUI();
    this.emit('debug:configToggled', { expanded: this.state.configExpanded });
  }

  /**
   * Toggle template panel
   */
  toggleTemplate() {
    this.state.templateExpanded = !this.state.templateExpanded;
    this.updateUI();
    this.emit('debug:templateToggled', { expanded: this.state.templateExpanded });
  }

  /**
   * Toggle entire tray (both panels)
   */
  toggleTray() {
    // If both are collapsed, expand both
    if (!this.state.configExpanded && !this.state.templateExpanded) {
      this.state.configExpanded = true;
      this.state.templateExpanded = true;
    } 
    // If one or both are expanded, collapse both
    else {
      this.state.configExpanded = false;
      this.state.templateExpanded = false;
    }
    this.updateUI();
    this.emit('debug:trayToggled', { 
      configExpanded: this.state.configExpanded,
      templateExpanded: this.state.templateExpanded 
    });
  }

  /**
   * Close entire tray
   */
  closeTray() {
    this.state.configExpanded = false;
    this.state.templateExpanded = false;
    this.state.isVisible = false;
    
    this.updateUI();
    
    // Hide the entire tray
    if (this.elements.config) this.elements.config.style.display = 'none';
    if (this.elements.template) this.elements.template.style.display = 'none';
    
    this.emit('debug:trayClosed');
  }

  /**
   * Show tray and expand panels
   */
  showTray() {
    this.state.isVisible = true;
    
    if (this.elements.config) this.elements.config.style.display = 'block';
    if (this.elements.template) this.elements.template.style.display = 'block';
    
    this.toggleTray();
    this.emit('debug:trayShown');
  }

  /**
   * Update UI based on current state
   */
  updateUI() {
    // Update config panel
    if (this.elements.config) {
      this.elements.config.classList.toggle('expanded', this.state.configExpanded);
    }

    // Update template panel
    if (this.elements.template) {
      this.elements.template.classList.toggle('expanded', this.state.templateExpanded);
    }

    // Update both expanded state
    this.state.bothExpanded = this.state.configExpanded && this.state.templateExpanded;

    // Update button icons
    this.updateButtonIcons();
  }

  /**
   * Update button icons based on state
   */
  updateButtonIcons() {
    const trayButtons = document.querySelectorAll('[data-debug-action="toggle-tray"]');
    const icon = this.state.bothExpanded ? '⌄' : '⌃';
    
    trayButtons.forEach(button => {
      button.textContent = icon;
      button.setAttribute('aria-label', 
        this.state.bothExpanded ? 'Collapse debug tray' : 'Expand debug tray'
      );
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(e) {
    // Ctrl+Shift+D to toggle debug tray
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      
      // If hidden, show and expand
      if (!this.state.isVisible) {
        this.showTray();
      } else {
        this.toggleTray();
      }
      
      this.emit('debug:keyboardToggle');
    }
  }

  /**
   * Start time updates for debug timestamps
   */
  startTimeUpdates() {
    this.timeUpdateInterval = setInterval(() => {
      const timeElements = document.querySelectorAll('.debug-time');
      const now = new Date();
      const timeString = now.toTimeString().substr(0, 8);
      
      timeElements.forEach(el => {
        if (el.textContent.match(/\d{2}:\d{2}:\d{2}/)) {
          el.textContent = timeString;
        }
      });
    }, 1000);
  }

  /**
   * Stop time updates
   */
  stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  /**
   * Setup global API for backward compatibility
   */
  setupGlobalAPI() {
    // Store reference globally
    window.debugTray = this;
    
    // Global functions for backward compatibility and template access
    window.toggleDebugTerminal = () => this.toggleConfig();
    window.toggleTemplateInfo = () => this.toggleTemplate();
    window.toggleDebugTray = () => this.toggleTray();
  }

  /**
   * Expand both panels
   */
  expand() {
    this.state.configExpanded = true;
    this.state.templateExpanded = true;
    this.updateUI();
    this.emit('debug:expanded');
  }

  /**
   * Collapse both panels
   */
  collapse() {
    this.state.configExpanded = false;
    this.state.templateExpanded = false;
    this.updateUI();
    this.emit('debug:collapsed');
  }

  /**
   * Check if debug tray is expanded
   */
  isExpanded() {
    return this.state.bothExpanded;
  }

  /**
   * Get current debug tray state
   */
  getState() {
    return {
      ...this.state,
      hasConfig: !!this.elements.config,
      hasTemplate: !!this.elements.template
    };
  }

  /**
   * Toggle specific panel by name
   */
  togglePanel(panelName) {
    switch (panelName) {
      case 'config':
        this.toggleConfig();
        break;
      case 'template':
        this.toggleTemplate();
        break;
      default:
        console.warn(`DebugTray: Unknown panel "${panelName}"`);
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    this.stopTimeUpdates();
    
    // Clean up global references
    if (window.debugTray === this) {
      delete window.debugTray;
      delete window.toggleDebugTerminal;
      delete window.toggleTemplateInfo;
      delete window.toggleDebugTray;
    }
    
    console.log('DebugTray: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('debug-tray', DebugTray);