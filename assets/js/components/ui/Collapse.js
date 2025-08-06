/**
 * Universal Collapse Component
 * Base component for all collapse/expand functionality across the theme
 * Follows ComponentManager patterns and provides consistent behavior
 */

import { Component } from '../../core/Component.js';
import { animationBridge } from '../../core/AnimationBridge.js';

class Collapse extends Component {
  constructor(config = {}) {
    super({
      name: 'collapse',
      selector: config.selector || '.collapse__header',
      ...config
    });

    this.options = {
      animationDuration: 300,
      storeState: false,
      namespace: 'collapse',
      autoInit: true,
      ...config
    };

    this.collapseElements = new Map();
  }

  /**
   * Initialize collapse functionality
   */
  async onInit() {
    if (this.options.autoInit) {
      this.setupCollapseElements();
    }
  }

  /**
   * Setup all collapse elements
   */
  setupCollapseElements() {
    const headers = this.findElements();
    
    console.log(`[${this.name}] Found ${headers.length} collapse headers`);

    headers.forEach(header => {
      this.initializeCollapseHeader(header);
    });
  }

  /**
   * Initialize a single collapse header
   */
  initializeCollapseHeader(header) {
    // Skip if already initialized
    if (header.hasAttribute('data-collapse-initialized')) {
      return;
    }

    const target = header.getAttribute('data-target');
    const targetElement = document.getElementById(target);

    if (!targetElement) {
      console.warn(`[${this.name}] Target element not found: ${target}`);
      return;
    }

    // Mark as initialized
    header.setAttribute('data-collapse-initialized', 'true');

    // Ensure target has collapse__body class
    if (!targetElement.classList.contains('collapse__body')) {
      targetElement.classList.add('collapse__body');
    }

    // Store collapse data
    const collapseData = {
      header,
      target: targetElement,
      targetId: target,
      isExpanded: header.getAttribute('aria-expanded') === 'true'
    };

    this.collapseElements.set(target, collapseData);

    // Set up event listeners
    this.bindCollapseEvents(header, collapseData);

    // Restore state if configured
    if (this.options.storeState) {
      this.restoreState(collapseData);
    }

    console.log(`[${this.name}] Initialized: ${target}`);
  }

  /**
   * Bind event listeners for collapse functionality
   */
  bindCollapseEvents(header, collapseData) {
    // Use the enhanced event listener methods for automatic cleanup
          this.addEventListener(header, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(collapseData);
    });

          this.addEventListener(header, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle(collapseData);
      }
    });
  }

  /**
   * Toggle collapse state
   */
  toggle(collapseData) {
    const newState = !collapseData.isExpanded;
    
    console.log(`[${this.name}] Toggle: ${collapseData.targetId} -> ${newState ? 'expanded' : 'collapsed'}`);

    if (newState) {
      this.expand(collapseData);
    } else {
      this.collapse(collapseData);
    }
  }

  /**
   * Expand a collapse element
   */
  async expand(collapseData) {
    const { header, target, targetId } = collapseData;

    // Update state using new animation bridge
    collapseData.isExpanded = true;
    
    // Use animation bridge for consistent state management
    await animationBridge.expand(target, { timing: 'medium' });

    // Store state if configured
    if (this.options.storeState) {
      this.saveState(targetId, true);
    }

    // Emit event
    this.emit('collapse:expanded', { targetId, header, target });
  }

  /**
   * Collapse a collapse element
   */
  async collapse(collapseData) {
    const { header, target, targetId } = collapseData;

    // Update state using new animation bridge
    collapseData.isExpanded = false;
    
    // Use animation bridge for consistent state management
    await animationBridge.collapse(target, { timing: 'medium' });

    // Store state if configured
    if (this.options.storeState) {
      this.saveState(targetId, false);
    }

    // Emit event
    this.emit('collapse:collapsed', { targetId, header, target });
  }

  /**
   * Apply expand animation and visual effects
   */
  applyExpandAnimation(target, header) {
    // Smooth height animation
    if (this.options.animationDuration > 0) {
      target.style.maxHeight = target.scrollHeight + 'px';
      target.style.transition = `max-height ${this.options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    // Rotate chevron/icon
    const icon = header.querySelector('.chevron, .collapse__icon, .response-toggle svg, .component-toggle svg');
    if (icon) {
      icon.style.transform = 'rotate(90deg)';
      icon.style.transition = `transform ${this.options.animationDuration}ms ease`;
    }
  }

  /**
   * Apply collapse animation and visual effects
   */
  applyCollapseAnimation(target, header) {
    // Smooth height animation
    if (this.options.animationDuration > 0) {
      target.style.maxHeight = null;
      target.style.transition = `max-height ${this.options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    // Reset chevron/icon
    const icon = header.querySelector('.chevron, .collapse__icon, .response-toggle svg, .component-toggle svg');
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
      icon.style.transition = `transform ${this.options.animationDuration}ms ease`;
    }
  }

  /**
   * Save collapse state to localStorage
   */
  saveState(targetId, isExpanded) {
    try {
      const key = `${this.options.namespace}-${targetId}`;
      localStorage.setItem(key, isExpanded ? 'expanded' : 'collapsed');
    } catch (error) {
      console.warn(`[${this.name}] Could not save state:`, error);
    }
  }

  /**
   * Restore collapse state from localStorage
   */
  restoreState(collapseData) {
    try {
      const key = `${this.options.namespace}-${collapseData.targetId}`;
      const savedState = localStorage.getItem(key);
      
      if (savedState === 'expanded' && !collapseData.isExpanded) {
        this.expand(collapseData);
      } else if (savedState === 'collapsed' && collapseData.isExpanded) {
        this.collapse(collapseData);
      }
    } catch (error) {
      console.warn(`[${this.name}] Could not restore state:`, error);
    }
  }

  /**
   * Public API: Expand specific element
   */
  expandElement(targetId) {
    const collapseData = this.collapseElements.get(targetId);
    if (collapseData && !collapseData.isExpanded) {
      this.expand(collapseData);
    }
  }

  /**
   * Public API: Collapse specific element
   */
  collapseElement(targetId) {
    const collapseData = this.collapseElements.get(targetId);
    if (collapseData && collapseData.isExpanded) {
      this.collapse(collapseData);
    }
  }

  /**
   * Public API: Expand all elements
   */
  expandAll() {
    this.collapseElements.forEach((collapseData) => {
      if (!collapseData.isExpanded) {
        this.expand(collapseData);
      }
    });
  }

  /**
   * Public API: Collapse all elements
   */
  collapseAll() {
    this.collapseElements.forEach((collapseData) => {
      if (collapseData.isExpanded) {
        this.collapse(collapseData);
      }
    });
  }

  /**
   * Cleanup when component is destroyed
   */
  destroy() {
    this.collapseElements.clear();
    super.destroy();
  }
}

// Export for use by other components
export { Collapse };
export default Collapse;