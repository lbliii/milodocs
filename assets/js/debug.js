/**
 * Debug Tray JavaScript
 * Handles the interactive debug interface for Hugo development
 */

class DebugTray {
  constructor() {
    this.state = {
      configExpanded: false,
      templateExpanded: false,
      bothExpanded: false
    };
    
    this.elements = {
      config: null,
      template: null,
      configButton: null,
      templateButton: null
    };
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Get elements
    this.elements.config = document.getElementById('hugo-debug-terminal');
    this.elements.template = document.getElementById('hugo-template-info');
    
    console.log('Debug Tray Setup:', {
      config: this.elements.config,
      template: this.elements.template
    });
    
    if (!this.elements.config && !this.elements.template) {
      console.warn('No debug elements found');
      return; // No debug elements found
    }

    // Setup event listeners
    this.setupEventListeners();
    
    // Start timestamp updates
    this.startTimeUpdates();
    
    // Initialize state - start collapsed
    this.updateUI();
    
    console.log('Debug Tray initialized successfully');
  }

  setupEventListeners() {
    // Config panel toggle
    const configHeader = this.elements.config?.querySelector('.debug-header');
    if (configHeader) {
      configHeader.addEventListener('click', (e) => {
        if (!e.target.classList.contains('debug-button')) {
          this.toggleConfig();
        }
      });
    }

    // Template panel toggle
    const templateHeader = this.elements.template?.querySelector('.debug-header');
    if (templateHeader) {
      templateHeader.addEventListener('click', (e) => {
        if (!e.target.classList.contains('debug-button')) {
          this.toggleTemplate();
        }
      });
    }

    // Unified tray toggle buttons
    const trayButtons = document.querySelectorAll('[data-debug-action="toggle-tray"]');
    trayButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTray();
      });
    });

    // Close buttons
    const closeButtons = document.querySelectorAll('[data-debug-action="close"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTray();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  toggleConfig() {
    this.state.configExpanded = !this.state.configExpanded;
    this.updateUI();
  }

  toggleTemplate() {
    this.state.templateExpanded = !this.state.templateExpanded;
    this.updateUI();
  }

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
  }

  closeTray() {
    this.state.configExpanded = false;
    this.state.templateExpanded = false;
    this.updateUI();
    
    // Hide the entire tray
    if (this.elements.config) this.elements.config.style.display = 'none';
    if (this.elements.template) this.elements.template.style.display = 'none';
  }

  showTray() {
    if (this.elements.config) this.elements.config.style.display = 'block';
    if (this.elements.template) this.elements.template.style.display = 'block';
    this.toggleTray();
  }

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

  updateButtonIcons() {
    const trayButtons = document.querySelectorAll('[data-debug-action="toggle-tray"]');
    const icon = this.state.bothExpanded ? '⌄' : '⌃';
    
    trayButtons.forEach(button => {
      button.textContent = icon;
    });
  }

  handleKeyboard(e) {
    // Ctrl+Shift+D to toggle debug tray
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      
      // If hidden, show and expand
      const isHidden = (this.elements.config?.style.display === 'none') || 
                      (this.elements.template?.style.display === 'none');
      
      if (isHidden) {
        this.showTray();
      } else {
        this.toggleTray();
      }
    }
  }

  startTimeUpdates() {
    setInterval(() => {
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

  // Public API
  expand() {
    this.state.configExpanded = true;
    this.state.templateExpanded = true;
    this.updateUI();
  }

  collapse() {
    this.state.configExpanded = false;
    this.state.templateExpanded = false;
    this.updateUI();
  }

  isExpanded() {
    return this.state.bothExpanded;
  }
}

// Global functions for backward compatibility and template access
window.toggleDebugTerminal = function() {
  if (window.debugTray) {
    window.debugTray.toggleConfig();
  }
};

window.toggleTemplateInfo = function() {
  if (window.debugTray) {
    window.debugTray.toggleTemplate();
  }
};

window.toggleDebugTray = function() {
  if (window.debugTray) {
    window.debugTray.toggleTray();
  }
};

// Initialize debug tray when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.debugTray = new DebugTray();
  });
} else {
  window.debugTray = new DebugTray();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugTray;
}