/**
 * NotebookProgressiveReveal Component
 * Simple progressive revelation of pre-rendered notebook cells
 * All cells are rendered by Hugo, JavaScript just shows/hides them
 */

import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';
import { animationBridge } from '../../core/AnimationBridge.js';

export class NotebookProgressiveReveal extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-progressive-reveal',
      selector: config.selector || '[data-component="notebook-progressive-reveal"]',
      ...config
    });

    this.options = {
      scrollThreshold: 400,     // Pixels from bottom to trigger loading (more eager)
      animationDelay: 30,       // Delay between cell animations (much faster)
      batchSize: 20,           // How many cells to reveal per batch (larger batches)
      animationDuration: 300,   // CSS animation duration
      ...this.options
    };

    // State management
    this.allCells = [];
    this.visibleCount = 0;
    this.metadata = null;
    this.isRevealing = false;
    this.observer = null;
    this.loadTrigger = null;
  }

  /**
   * Initialize the progressive reveal
   */
  async onInit() {
    if (!this.element) {
      console.warn('NotebookProgressiveReveal: No element found');
      return;
    }

    // 🚀 NEW: Enhanced initialization with loading states
    this.setLoadingState(true);
    this.updateComponentState('initializing');

    console.log('📓 NotebookProgressiveReveal: Starting initialization...');
    
    this.loadMetadata();
    this.collectCells();
    this.setupIntersectionObserver();
    this.setupLoadTrigger();
    
    // Count initially visible cells
    this.visibleCount = this.allCells.filter(cell => !cell.classList.contains('notebook-cell--hidden')).length;
    
    // 🚀 NEW: Initialization complete
    this.setLoadingState(false);
    this.updateComponentState('ready');
    
    console.log(`📓 Progressive reveal initialized: ${this.visibleCount}/${this.allCells.length} cells visible`);
    
    this.emit('notebook:initialized', { 
      visibleCells: this.visibleCount,
      totalCells: this.allCells.length
    });
  }

  /**
   * Load metadata from the page
   */
  loadMetadata() {
    const metadataScript = document.getElementById('notebook-metadata');
    if (!metadataScript) {
      console.warn('NotebookProgressiveReveal: No metadata found, using defaults');
      this.metadata = { totalCells: 0, initiallyVisible: 5, batchSize: 10 };
      return;
    }

    try {
      this.metadata = JSON.parse(metadataScript.textContent);
      console.log('📊 Metadata loaded:', this.metadata);
    } catch (error) {
      console.error('NotebookProgressiveReveal: Failed to parse metadata', error);
      this.metadata = { totalCells: 0, initiallyVisible: 5, batchSize: 10 };
    }
  }

  /**
   * Collect all cell wrapper elements
   */
  collectCells() {
    this.allCells = Array.from(this.element.querySelectorAll('.notebook-cell-wrapper'));
    console.log(`📊 Collected ${this.allCells.length} cell wrappers`);
    
    // Debug: Show how many are initially hidden
    const hiddenCount = this.allCells.filter(cell => cell.classList.contains('notebook-cell--hidden')).length;
    console.log(`📊 ${hiddenCount} cells are initially hidden`);
  }

  /**
   * Setup intersection observer for infinite scroll
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to scroll events');
      this.setupScrollFallback();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isRevealing) {
            this.revealNextBatch();
          }
        });
      },
      {
        rootMargin: `${this.options.scrollThreshold}px 0px`,
        threshold: 0.1
      }
    );
  }

  /**
   * Setup load trigger element
   */
  setupLoadTrigger() {
    const hiddenCells = this.allCells.filter(cell => cell.classList.contains('notebook-cell--hidden'));
    
    if (hiddenCells.length === 0) {
      return; // No more cells to reveal
    }

    const cellsContainer = this.element.querySelector('.notebook__cells');
    
    // Remove existing trigger
    if (this.loadTrigger) {
      this.loadTrigger.remove();
    }
    
    // Create new load trigger
    this.loadTrigger = document.createElement('div');
    this.loadTrigger.className = 'notebook-load-trigger';
    this.loadTrigger.style.cssText = `
      height: 20px;
      margin: 2rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    `;
    
    this.loadTrigger.innerHTML = `
      <div class="loading-indicator">
        <span>Loading more cells... (${hiddenCells.length} remaining)</span>
        <div class="loading-spinner ml-2"></div>
      </div>
    `;
    
    cellsContainer.appendChild(this.loadTrigger);
    
    // Start observing the trigger
    if (this.observer) {
      this.observer.observe(this.loadTrigger);
    }
  }

  /**
   * Reveal the next batch of hidden cells
   */
  async revealNextBatch() {
    const hiddenCells = this.allCells.filter(cell => cell.classList.contains('notebook-cell--hidden'));
    
    if (hiddenCells.length === 0 || this.isRevealing) {
      return;
    }

    this.isRevealing = true;
    
    // Remove the load trigger temporarily
    if (this.loadTrigger) {
      this.observer.unobserve(this.loadTrigger);
      this.loadTrigger.remove();
    }
    
    const batchSize = Math.min(this.options.batchSize, hiddenCells.length);
    const cellsToReveal = hiddenCells.slice(0, batchSize);
    
    console.log(`🔄 Revealing next batch: ${batchSize} cells`);
    
    // Reveal cells with fast staggered animation
    cellsToReveal.forEach((cell, index) => {
      setTimeout(() => {
        cell.classList.remove('notebook-cell--hidden');
        cell.classList.add('notebook-cell--revealing');
        
        // Clean up the revealing class after animation
        setTimeout(() => {
          cell.classList.remove('notebook-cell--revealing');
        }, 300); // Match CSS animation duration
        
      }, index * this.options.animationDelay);
    });
    
    // Update visible count
    this.visibleCount += cellsToReveal.length;
    
    // Much faster setup of next trigger
    const totalAnimationTime = (cellsToReveal.length * this.options.animationDelay) + this.options.animationDuration;
    setTimeout(() => {
      this.setupLoadTrigger();
      this.isRevealing = false;
      
      console.log(`✅ Revealed batch: ${cellsToReveal.length} cells (${this.visibleCount}/${this.allCells.length} total)`);
      
      this.emit('notebook:batch-revealed', { 
        batchSize: cellsToReveal.length,
        visibleCells: this.visibleCount,
        remainingCells: this.allCells.length - this.visibleCount,
        totalCells: this.allCells.length
      });
      
    }, totalAnimationTime);
  }

  /**
   * Fallback scroll event handler for browsers without IntersectionObserver
   */
  setupScrollFallback() {
    const handleScroll = () => {
      const hiddenCells = this.allCells.filter(cell => cell.classList.contains('notebook-cell--hidden'));
      
      if (this.isRevealing || hiddenCells.length === 0) {
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= documentHeight - this.options.scrollThreshold) {
        this.revealNextBatch();
      }
    };

    // Throttled scroll handler
    let scrollTimeout;
    const throttledScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      const throttleDelay = animationBridge.getTiming('fast') / 2;
      scrollTimeout = setTimeout(handleScroll, throttleDelay);
    };

            this.addEventListener(window, 'scroll', throttledScroll);
  }

  /**
   * Get reveal statistics
   */
  getStats() {
    return {
      visibleCells: this.visibleCount,
      hiddenCells: this.allCells.length - this.visibleCount,
      totalCells: this.allCells.length,
      revealProgress: this.allCells.length > 0 ? 
        ((this.visibleCount / this.allCells.length) * 100).toFixed(1) : 0
    };
  }

  /**
   * Manually reveal all remaining cells
   */
  async revealAllCells() {
    const hiddenCells = this.allCells.filter(cell => cell.classList.contains('notebook-cell--hidden'));
    
    if (hiddenCells.length === 0) {
      return;
    }
    
    console.log(`🚀 Revealing all ${hiddenCells.length} remaining cells...`);
    
    // Reveal all cells with very fast staggered animation
    hiddenCells.forEach((cell, index) => {
      setTimeout(() => {
        cell.classList.remove('notebook-cell--hidden');
        cell.classList.add('notebook-cell--revealing');
        
        // Clean up the revealing class after animation
        setTimeout(() => {
          cell.classList.remove('notebook-cell--revealing');
        }, 300);
        
      }, index * 20); // Much faster for bulk reveal
    });
    
    this.visibleCount = this.allCells.length;
    
    // Remove load trigger
    if (this.loadTrigger) {
      this.observer.unobserve(this.loadTrigger);
      this.loadTrigger.remove();
      this.loadTrigger = null;
    }
    
    this.emit('notebook:all-revealed', { totalCells: this.allCells.length });
  }

  /**
   * Hide cells that are far off-screen (performance optimization)
   */
  optimizeVisibility() {
    const viewportTop = window.pageYOffset;
    const viewportBottom = viewportTop + window.innerHeight;
    const buffer = window.innerHeight * 2; // Keep 2 viewport heights of buffer
    
    this.allCells.forEach((cell, index) => {
      if (cell.classList.contains('notebook-cell--hidden')) {
        return; // Skip cells that are intentionally hidden
      }
      
      const rect = cell.getBoundingClientRect();
      const cellTop = rect.top + viewportTop;
      const cellBottom = cellTop + rect.height;
      
      // Hide cells that are far above or below the viewport
      if (cellBottom < viewportTop - buffer || cellTop > viewportBottom + buffer) {
        cell.style.display = 'none';
      } else {
        cell.style.display = '';
      }
    });
  }

  /**
   * Cleanup on destroy
   */
  onDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.loadTrigger) {
      this.loadTrigger.remove();
    }
    
    this.emit('notebook:destroyed');
  }
}

// Auto-register component when module loads
ComponentManager.register('notebook-progressive-reveal', NotebookProgressiveReveal);