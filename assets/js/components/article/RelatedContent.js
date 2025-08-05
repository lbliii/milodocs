/**
 * Enhanced Related Content Component
 * Handles view toggling (compact/cards) and collapse functionality
 */

import { Component } from '../../core/Component.js';
import { localStorage } from '../../utils/storage.js';
import { announceToScreenReader } from '../../utils/accessibility.js';
import { logger } from '../../utils/Logger.js';

const log = logger.component('RelatedContent');

export class ArticleRelatedContent extends Component {
  constructor(config = {}) {
    super({
      name: 'article-related-content',
      selector: '[data-component="article-related-content"]',
      ...config
    });
    
    this.options = {
      defaultView: 'compact',
      storageKey: 'related-content-preferences',
      animationDuration: 300,
      ...this.options
    };
    
    // Component state
    this.currentView = this.options.defaultView;
    this.isCollapsed = false;
    this.viewButtons = new Map();
  }

  /**
   * Setup DOM elements
   */
  setupElements() {
    super.setupElements();
    
    this.viewButtons.clear();
    this.element.querySelectorAll('.view-toggle-btn').forEach(btn => {
      const view = btn.getAttribute('data-view');
      this.viewButtons.set(view, btn);
    });
    
    this.collapseButton = this.element.querySelector('.collapse-toggle');
    this.contentContainer = this.element.querySelector('.related-content-container');
    
    if (!this.contentContainer) {
      log.warn('Related content container not found');
      return;
    }
    
    log.debug('Elements setup complete');
  }

  /**
   * Bind event listeners using component lifecycle methods
   */
  bindEvents() {
    // View toggle functionality - use this.addEventListener for auto-cleanup
    this.viewButtons.forEach((button, view) => {
      this.addEventListener(button, 'click', (e) => {
        e.preventDefault();
        this.switchView(view);
      });
    });

    // Collapse toggle functionality
    if (this.collapseButton) {
      this.addEventListener(this.collapseButton, 'click', (e) => {
        e.preventDefault();
        this.toggleCollapse();
      });
    }

    // Track usage analytics
    this.setupUsageTracking();
    
    log.debug('Event listeners bound');
  }

  /**
   * Initialize component
   */
  async onInit() {
    if (!this.element) {
      log.warn('Related content element not found');
      return;
    }

    // Restore user preferences
    this.restorePreferences();
    
    log.info('ArticleRelatedContent initialized');
  }

  /**
   * Switch between view modes (compact/cards)
   */
  switchView(view) {
    if (view === this.currentView) return;

    const prevView = this.currentView;
    this.currentView = view;
    
    // 🚀 NEW: Enhanced view switching with loading states
    this.updateComponentState('switching-view');
    this.setLoadingState(true);
    this.setCSSProperty('--view-switching', 'true');
    
    // Update button states
    this.viewButtons.forEach((btn, btnView) => {
      btn.classList.toggle('active', btnView === view);
    });

    // Hide all view containers first with fade-out
    const allViews = this.element.querySelectorAll('[data-view]');
    allViews.forEach(viewEl => {
      if (viewEl.classList.contains('view-toggle-btn')) return; // Skip buttons
      viewEl.style.opacity = '0';
      setTimeout(() => {
        viewEl.classList.add('hidden');
      }, 150);
    });

    // Show selected view with smooth fade-in
    const targetView = this.element.querySelector(`[data-view="${view}"]:not(.view-toggle-btn)`);
    if (targetView) {
      setTimeout(() => {
        targetView.classList.remove('hidden');
        requestAnimationFrame(() => {
          targetView.style.opacity = '1';
        });
      }, 150);
    }

    // 🚀 NEW: View switch complete
    setTimeout(() => {
      this.setLoadingState(false);
      this.updateComponentState('view-active');
      this.setCSSProperty('--view-switching', 'false');
    }, 300);

    // Save preference using existing storage utility
    this.savePreferences();
    
    // Announce to screen readers
    announceToScreenReader(`Switched to ${view} view`);
    
    // Emit component event
    this.emit('viewChanged', { 
      previousView: prevView,
      currentView: view 
    });
    
    log.debug(`View switched from ${prevView} to ${view}`);
  }

  /**
   * Toggle collapse state of the entire section
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    
    // Update button state and icon
    this.collapseButton.setAttribute('data-collapsed', this.isCollapsed);
    
    // Update content visibility with animation
    if (this.isCollapsed) {
      this.contentContainer.style.display = 'none';
    } else {
      this.contentContainer.style.display = 'block';
    }
    
    // Save preference
    this.savePreferences();
    
    // Announce to screen readers
    const status = this.isCollapsed ? 'collapsed' : 'expanded';
    announceToScreenReader(`Related content section ${status}`);
    
    // Emit component event
    this.emit('collapsed', { 
      collapsed: this.isCollapsed 
    });
    
    log.debug(`Section ${status}`);
  }

  /**
   * Save user preferences using existing storage utility
   */
  savePreferences() {
    const preferences = {
      view: this.currentView,
      collapsed: this.isCollapsed,
      timestamp: Date.now()
    };
    
    localStorage.set(this.options.storageKey, preferences);
  }

  /**
   * Restore user preferences from storage
   */
  restorePreferences() {
    const preferences = localStorage.get(this.options.storageKey, {});
    
    // Restore view preference
    if (preferences.view && ['compact', 'cards'].includes(preferences.view)) {
      this.currentView = preferences.view;
      // Update button states without triggering events
      this.viewButtons.forEach((btn, btnView) => {
        btn.classList.toggle('active', btnView === preferences.view);
      });
      // Show correct view
      const targetView = this.element.querySelector(`[data-view="${preferences.view}"]:not(.view-toggle-btn)`);
      if (targetView) {
        this.element.querySelectorAll('[data-view]:not(.view-toggle-btn)').forEach(v => v.classList.add('hidden'));
        targetView.classList.remove('hidden');
      }
    }

    // Restore collapse preference
    if (preferences.collapsed) {
      this.isCollapsed = !preferences.collapsed; // Set opposite so toggle works
      this.toggleCollapse();
    }
    
    log.debug('Preferences restored:', preferences);
  }

  /**
   * Setup usage tracking for analytics
   */
  setupUsageTracking() {
    // Track clicks on related content items
    const items = this.element.querySelectorAll('[data-related-article]');
    items.forEach(item => {
              this.addEventListener(item, 'click', (e) => {
        const articleUrl = item.getAttribute('data-related-article');
        const articleTitle = item.getAttribute('data-article-title');
        
        // Emit component event for tracking
        this.emit('itemClicked', {
          url: articleUrl,
          title: articleTitle,
          view: this.currentView,
          timestamp: Date.now()
        });
        
        log.debug('Related content item clicked:', { articleTitle, view: this.currentView });
      });
    });
  }

  /**
   * Public API: Get current preferences
   */
  getPreferences() {
    return {
      view: this.currentView,
      collapsed: this.isCollapsed
    };
  }

  /**
   * Public API: Set view mode
   */
  setView(view) {
    if (['compact', 'cards'].includes(view)) {
      this.switchView(view);
    }
  }

  /**
   * Public API: Expand section
   */
  expand() {
    if (this.isCollapsed) {
      this.toggleCollapse();
    }
  }

  /**
   * Public API: Collapse section
   */
  collapse() {
    if (!this.isCollapsed) {
      this.toggleCollapse();
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // Component manager handles event cleanup automatically
    log.debug('RelatedContent component destroyed');
  }
}

// Auto-register component with ComponentManager
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-related-content', ArticleRelatedContent);