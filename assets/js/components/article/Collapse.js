/**
 * Article Collapse Component
 * Handles collapsible content sections with accessibility features
 * Migrated and enhanced from article-collapse.js
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { $$, aria } from '../../utils/index.js';
import { transitions } from '../../utils/animation.js';

export class ArticleCollapse extends Component {
  constructor(config = {}) {
    super({
      name: 'article-collapse',
      selector: config.selector || '.toggle-collapse',
      ...config
    });
    
    this.toggles = new Map();
    this.options = {
      animationDuration: 300,
      storeState: true,
      namespace: 'article-collapse',
      ...this.options
    };
  }

  /**
   * Setup elements and find all collapse toggles
   */
  setupElements() {
    super.setupElements();
    
    // Find all collapse toggles
    this.collapseToggles = $$('.toggle-collapse');
    
    if (this.collapseToggles.length === 0) {
      console.log('No collapse toggles found on page');
      return;
    }
    
    console.log(`Found ${this.collapseToggles.length} collapse toggles`);
    
    // Setup each toggle
    this.collapseToggles.forEach(toggle => this.setupToggle(toggle));
  }

  /**
   * Setup individual collapse toggle
   */
  setupToggle(toggle) {
    const listItem = toggle.closest('li') || toggle.closest('[data-collapse-container]');
    const content = this.findContent(toggle, listItem);
    const chevron = toggle.querySelector('.chevron, svg, [data-chevron]');
    
    if (!content) {
      console.warn('No collapsible content found for toggle:', toggle);
      return;
    }
    
    // Generate unique ID for content if it doesn't have one
    if (!content.id) {
      content.id = `collapse-content-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }
    
    // Setup ARIA attributes
    const ariaController = aria.setupExpandable(toggle, content, false);
    
    // Store toggle data
    this.toggles.set(toggle, {
      content,
      chevron,
      ariaController,
      listItem,
      isExpanded: false
    });
    
    // Load saved state if enabled
    if (this.options.storeState) {
      this.loadToggleState(toggle);
    }
    
    // Add component tracking
    toggle.setAttribute('data-collapse-component', this.id);
  }

  /**
   * Find the content element for a toggle
   */
  findContent(toggle, container) {
    // Strategy 1: Next sibling with specific class
    let content = toggle.nextElementSibling;
    if (content && (content.classList.contains('nested-content') || content.classList.contains('collapse-content'))) {
      return content;
    }
    
    // Strategy 2: Look for data-target attribute
    const targetSelector = toggle.getAttribute('data-target');
    if (targetSelector) {
      return document.querySelector(targetSelector);
    }
    
    // Strategy 3: Find in container
    if (container) {
      content = container.querySelector('.nested-content, .collapse-content, [data-collapse-content]');
      if (content) return content;
    }
    
    // Strategy 4: Next sibling (generic)
    return toggle.nextElementSibling;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Use event delegation for better performance
    this.addEventListener(document, 'click', (e) => {
      const toggle = e.target.closest('.toggle-collapse');
      if (toggle && this.toggles.has(toggle)) {
        e.preventDefault();
        this.handleToggleClick(toggle);
      }
    });
    
    // Keyboard support
    this.addEventListener(document, 'keydown', (e) => {
      const toggle = e.target.closest('.toggle-collapse');
      if (toggle && this.toggles.has(toggle)) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleToggleClick(toggle);
        }
      }
    });
  }

  /**
   * Handle toggle click
   */
  async handleToggleClick(toggle) {
    const toggleData = this.toggles.get(toggle);
    if (!toggleData) return;
    
    const { content, chevron, ariaController, isExpanded } = toggleData;
    
    // Update state
    toggleData.isExpanded = !isExpanded;
    
    try {
      if (toggleData.isExpanded) {
        await this.expand(toggle, toggleData);
      } else {
        await this.collapse(toggle, toggleData);
      }
      
      // Save state if enabled
      if (this.options.storeState) {
        this.saveToggleState(toggle);
      }
      
      // Emit events
      this.emit('toggle', {
        toggle,
        expanded: toggleData.isExpanded,
        content
      });
      
    } catch (error) {
      console.error('Toggle animation failed:', error);
      // Revert state on error
      toggleData.isExpanded = !toggleData.isExpanded;
    }
  }

  /**
   * Expand content
   */
  async expand(toggle, toggleData) {
    const { content, chevron, ariaController } = toggleData;
    
    // Show content immediately for screen readers
    content.style.display = 'block';
    
    // Update ARIA
    ariaController.expand();
    
    // Animate content expansion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      content.classList.add('expanding');
      await transitions.slideDown(content, this.options.animationDuration);
      content.classList.remove('expanding');
    }
    
    content.classList.add('expanded');
    
    // Rotate chevron
    if (chevron) {
      chevron.classList.add('rotate-90');
    }
    
    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader('Section expanded');
    }
    
    this.emit('expanded', { toggle, content });
  }

  /**
   * Collapse content
   */
  async collapse(toggle, toggleData) {
    const { content, chevron, ariaController } = toggleData;
    
    // Update ARIA
    ariaController.collapse();
    
    // Animate content collapse
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      content.classList.add('collapsing');
      await transitions.slideUp(content, this.options.animationDuration);
      content.classList.remove('collapsing');
    }
    
    content.classList.remove('expanded');
    content.style.display = 'none';
    
    // Rotate chevron back
    if (chevron) {
      chevron.classList.remove('rotate-90');
    }
    
    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader('Section collapsed');
    }
    
    this.emit('collapsed', { toggle, content });
  }

  /**
   * Expand specific toggle programmatically
   */
  async expandToggle(toggle) {
    const toggleData = this.toggles.get(toggle);
    if (!toggleData || toggleData.isExpanded) return;
    
    return this.handleToggleClick(toggle);
  }

  /**
   * Collapse specific toggle programmatically
   */
  async collapseToggle(toggle) {
    const toggleData = this.toggles.get(toggle);
    if (!toggleData || !toggleData.isExpanded) return;
    
    return this.handleToggleClick(toggle);
  }

  /**
   * Expand all toggles
   */
  async expandAll() {
    const expandPromises = Array.from(this.toggles.keys())
      .filter(toggle => !this.toggles.get(toggle).isExpanded)
      .map(toggle => this.expandToggle(toggle));
    
    await Promise.all(expandPromises);
    this.emit('expanded-all');
  }

  /**
   * Collapse all toggles
   */
  async collapseAll() {
    const collapsePromises = Array.from(this.toggles.keys())
      .filter(toggle => this.toggles.get(toggle).isExpanded)
      .map(toggle => this.collapseToggle(toggle));
    
    await Promise.all(collapsePromises);
    this.emit('collapsed-all');
  }

  /**
   * Save toggle state to storage
   */
  saveToggleState(toggle) {
    if (!this.options.storeState) return;
    
    const toggleData = this.toggles.get(toggle);
    const key = this.getStorageKey(toggle);
    
    try {
      localStorage.set(key, {
        expanded: toggleData.isExpanded,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to save collapse state:', error);
    }
  }

  /**
   * Load toggle state from storage
   */
  loadToggleState(toggle) {
    if (!this.options.storeState) return;
    
    const key = this.getStorageKey(toggle);
    
    try {
      const stored = localStorage.get(key);
      if (stored) {
        const { expanded } = stored; // SafeStorage already handles JSON parsing
        if (expanded) {
          // Expand without animation on page load
          const toggleData = this.toggles.get(toggle);
          toggleData.isExpanded = false; // Set to false so expand works
          this.expand(toggle, toggleData);
        }
      }
    } catch (error) {
      console.warn('Failed to load collapse state:', error);
    }
  }

  /**
   * Get storage key for toggle
   */
  getStorageKey(toggle) {
    const contentId = this.toggles.get(toggle).content.id;
    return `${this.options.namespace}.${contentId}`;
  }

  /**
   * Get component statistics
   */
  getStats() {
    const stats = {
      totalToggles: this.toggles.size,
      expanded: 0,
      collapsed: 0
    };
    
    this.toggles.forEach(data => {
      if (data.isExpanded) {
        stats.expanded++;
      } else {
        stats.collapsed++;
      }
    });
    
    return stats;
  }

  /**
   * Custom cleanup
   */
  onDestroy() {
    // Clean up toggle references
    this.toggles.forEach((data, toggle) => {
      toggle.removeAttribute('data-collapse-component');
    });
    this.toggles.clear();
  }
}

// Auto-register component
ComponentManager.register('article-collapse', ArticleCollapse);