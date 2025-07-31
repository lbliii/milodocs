/**
 * Theme Toggle Component
 * Handles dark/light theme switching with safe localStorage and icon updates
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { localStorage } from '../../utils/storage.js';

export class ThemeToggle extends Component {
  constructor(config = {}) {
    super({
      name: 'theme-toggle',
      selector: config.selector || '#darkModeToggle',
      ...config
    });
    
    this.themeKey = 'theme-mode';
    this.defaultTheme = 'light';
    this.elements = {
      toggle: null,
      moon: null,
      sun: null,
      lightModeHome: null,
      darkModeHome: null
    };
    
    // Performance optimizations
    this.isToggling = false;
    this.debounceTimeout = null;
    this.pendingTheme = null;
  }

  async onInit() {
    // Apply theme immediately (this may run before DOM is ready)
    this.applyStoredTheme();
    
    if (!this.element) {
      console.warn('ThemeToggle: Toggle button not found');
      return;
    }

    this.cacheElements();
    this.setupEventListeners();
    this.updateUI();
    this.updateIconSources();
    
    console.log('ThemeToggle: Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements.toggle = this.element;
    this.elements.moon = document.getElementById('moon');
    this.elements.sun = document.getElementById('sun');
    this.elements.lightModeHome = document.getElementById('lightModeHome');
    this.elements.darkModeHome = document.getElementById('darkModeHome');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.elements.toggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Keyboard support
    this.elements.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Apply stored theme immediately (before DOM ready)
   * Note: This may be redundant if the head script already applied the theme
   */
  applyStoredTheme() {
    const savedTheme = localStorage.get(this.themeKey);
    const isDarkMode = savedTheme === 'dark';
    
    // Only apply if theme isn't already set (avoid redundant work)
    const currentlyDark = document.documentElement.classList.contains('dark');
    if (isDarkMode && !currentlyDark) {
      document.documentElement.classList.add('dark');
    } else if (!isDarkMode && currentlyDark) {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * Toggle between light and dark themes
   */
    toggleTheme() {
    // Prevent rapid toggles that can cause performance issues
    if (this.isToggling) {
      return;
    }
    
    this.isToggling = true;
    
    // Temporarily disable transitions for immediate feedback
    document.documentElement.classList.add('no-transitions');
    
    const isDarkMode = document.documentElement.classList.toggle('dark');
    
    // Save preference
    if (this.storage) {
      this.storage.set(this.themeKey, isDarkMode ? 'dark' : 'light');
    }
    
    // Update UI immediately for responsiveness
    this.updateUI();
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      this.updateIconSources();
      
      // Re-enable transitions after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
        this.isToggling = false;
      }, 50);
      
      // Emit events for other components
      this.emit('theme:changed', { isDarkMode, theme: isDarkMode ? 'dark' : 'light' });
      
      // Dispatch global custom event for backward compatibility
      document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { isDarkMode } 
      }));
      
      console.log(`🎨 Theme switched to: ${isDarkMode ? 'dark' : 'light'} (optimized)`);
    });
  }

  /**
   * Update button and UI elements based on current theme
   */
  updateUI() {
    const isDarkMode = this.isDarkMode();
    
    // Update theme toggle icons
    if (this.elements.moon && this.elements.sun) {
      if (isDarkMode) {
        this.elements.moon.classList.remove('hidden');
        this.elements.sun.classList.add('hidden');
      } else {
        this.elements.moon.classList.add('hidden');
        this.elements.sun.classList.remove('hidden');
      }
    }
    
    // Update home page specific elements
    if (this.elements.lightModeHome && this.elements.darkModeHome) {
      if (isDarkMode) {
        this.elements.lightModeHome.classList.add('hidden');
        this.elements.darkModeHome.classList.remove('hidden');
      } else {
        this.elements.lightModeHome.classList.remove('hidden');
        this.elements.darkModeHome.classList.add('hidden');
      }
    }

    // Update ARIA attributes
    if (this.elements.toggle) {
      this.elements.toggle.setAttribute('aria-label', 
        `Switch to ${isDarkMode ? 'light' : 'dark'} mode`
      );
      this.elements.toggle.setAttribute('aria-pressed', isDarkMode.toString());
    }
  }

  /**
   * Update icon sources based on theme
   */
  updateIconSources() {
    const isDarkMode = this.isDarkMode();
    const iconPath = isDarkMode ? '/icons/dark/' : '/icons/light/';
    
    // Update all icons with the .icon class
    document.querySelectorAll('.icon').forEach(icon => {
      const currentSrc = icon.getAttribute('src');
      if (currentSrc && currentSrc.includes('/icons/')) {
        const iconName = currentSrc.split('/').pop();
        icon.setAttribute('src', iconPath + iconName);
      }
    });
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.isDarkMode() ? 'dark' : 'light';
  }

  /**
   * Set theme programmatically
   */
  setTheme(theme) {
    const isDarkMode = theme === 'dark';
    const currentlyDark = this.isDarkMode();
    
    if (isDarkMode !== currentlyDark) {
      this.toggleTheme();
    }
  }

  /**
   * Set to light theme
   */
  setLightTheme() {
    this.setTheme('light');
  }

  /**
   * Set to dark theme
   */
  setDarkTheme() {
    this.setTheme('dark');
  }

  /**
   * Reset to default theme
   */
  resetTheme() {
    this.setTheme(this.defaultTheme);
    localStorage.remove(this.themeKey);
  }

  /**
   * Get theme state
   */
  getState() {
    return {
      theme: this.getCurrentTheme(),
      isDarkMode: this.isDarkMode(),
      hasToggle: !!this.elements.toggle,
      hasIcons: !!(this.elements.moon && this.elements.sun)
    };
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('ThemeToggle: Component destroyed');
  }
}

// Initialize theme immediately (before component registration)
const themeToggle = new ThemeToggle();
themeToggle.applyStoredTheme();

// Auto-register component
ComponentManager.register('theme-toggle', ThemeToggle);