/**
 * Theme Component
 * Manages dark/light mode switching with proper state management
 * Migrated and enhanced from layout-theme.js
 */

import { Component } from '../../core/ComponentManager.js';
import { createNamespacedStorage } from '../../utils/storage.js';
import { $ } from '../../utils/dom.js';

export class Theme extends Component {
  constructor(config = {}) {
    super({
      name: 'theme',
      selector: config.selector || '#darkModeToggle',
      ...config
    });
    
    this.storage = createNamespacedStorage('theme');
    this.currentTheme = 'light';
    this.options = {
      defaultTheme: 'light',
      storageKey: 'mode',
      ...this.options
    };
    
    // Initialize theme immediately (before DOM ready)
    this.initializeTheme();
  }

  /**
   * Initialize theme before DOM is ready to prevent flash
   */
  initializeTheme() {
    const savedTheme = this.storage.get(this.options.storageKey, this.options.defaultTheme);
    this.setTheme(savedTheme, false);
  }

  /**
   * Setup DOM elements
   */
  setupElements() {
    super.setupElements();
    
    // Find theme-related elements
    this.toggle = this.element || $('#darkModeToggle');
    this.moonIcon = $('#moon');
    this.sunIcon = $('#sun');
    this.lightModeHome = $('#lightModeHome');
    this.darkModeHome = $('#darkModeHome');
    
    // Update UI to match current theme
    this.updateUI();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.toggle) return;
    
    // Main toggle click
    this.addEventListener(this.toggle, 'click', () => {
      this.toggleTheme();
    });
    
    // Keyboard support
    this.addEventListener(this.toggle, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.addEventListener(mediaQuery, 'change', (e) => {
        this.handleSystemThemeChange(e);
      });
    }
    
    // Listen for external theme change events
    this.addEventListener(document, 'theme:set', (e) => {
      this.setTheme(e.detail.theme);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    
    this.emit('toggled', {
      from: this.currentTheme === 'light' ? 'dark' : 'light',
      to: newTheme
    });
  }

  /**
   * Set specific theme
   */
  setTheme(theme, save = true) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme: ${theme}. Using default.`);
      theme = this.options.defaultTheme;
    }
    
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update UI elements
    this.updateUI();
    
    // Update icon sources for theme-specific icons
    this.updateIconSources();
    
    // Save to storage
    if (save) {
      this.storage.set(this.options.storageKey, theme);
    }
    
    // Dispatch global theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { 
        theme,
        oldTheme,
        isDarkMode: theme === 'dark'
      }
    }));
    
    // Emit component event
    this.emit('changed', {
      theme,
      oldTheme,
      isDarkMode: theme === 'dark'
    });
    
    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Switched to ${theme} mode`);
    }
    
    console.log(`🎨 Theme changed to ${theme} mode`);
  }

  /**
   * Update UI elements to match current theme
   */
  updateUI() {
    const isDarkMode = this.currentTheme === 'dark';
    
    // Update toggle button icons
    if (this.moonIcon && this.sunIcon) {
      if (isDarkMode) {
        this.moonIcon.classList.remove('hidden');
        this.sunIcon.classList.add('hidden');
      } else {
        this.moonIcon.classList.add('hidden');
        this.sunIcon.classList.remove('hidden');
      }
    }
    
    // Update home page theme-specific elements
    if (this.lightModeHome && this.darkModeHome) {
      if (isDarkMode) {
        this.lightModeHome.classList.add('hidden');
        this.darkModeHome.classList.remove('hidden');
      } else {
        this.lightModeHome.classList.remove('hidden');
        this.darkModeHome.classList.add('hidden');
      }
    }
    
    // Update toggle button aria-label
    if (this.toggle) {
      const label = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
      this.toggle.setAttribute('aria-label', label);
      this.toggle.setAttribute('title', label);
    }
  }

  /**
   * Update theme-specific icon sources
   */
  updateIconSources() {
    const isDarkMode = this.currentTheme === 'dark';
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
   * Handle system theme preference changes
   */
  handleSystemThemeChange(e) {
    // Only respond if user hasn't manually set a preference
    const hasManualPreference = this.storage.get(this.options.storageKey) !== null;
    
    if (!hasManualPreference) {
      const systemTheme = e.matches ? 'dark' : 'light';
      this.setTheme(systemTheme, false);
      
      this.emit('system-change', {
        theme: systemTheme,
        matches: e.matches
      });
    }
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  /**
   * Check if light mode is active
   */
  isLightMode() {
    return this.currentTheme === 'light';
  }

  /**
   * Reset to system preference
   */
  resetToSystem() {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = systemPrefersDark ? 'dark' : 'light';
    
    // Clear stored preference
    this.storage.remove(this.options.storageKey);
    
    this.setTheme(systemTheme, false);
    
    this.emit('reset-to-system', {
      theme: systemTheme,
      systemPrefersDark
    });
  }

  /**
   * Get theme statistics
   */
  getStats() {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hasManualPreference = this.storage.get(this.options.storageKey) !== null;
    
    return {
      current: this.currentTheme,
      isDarkMode: this.isDarkMode(),
      systemPrefersDark,
      hasManualPreference,
      supportsSystemDetection: !!window.matchMedia
    };
  }

  /**
   * Custom initialization
   */
  async onInit() {
    // Emit initial state
    this.emit('initialized', {
      theme: this.currentTheme,
      isDarkMode: this.isDarkMode()
    });
  }

  /**
   * Custom cleanup
   */
  onDestroy() {
    // Theme cleanup is minimal since it's a global state
    // The theme setting should persist even after component destruction
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('theme', Theme);

// Export for global access
export default Theme;