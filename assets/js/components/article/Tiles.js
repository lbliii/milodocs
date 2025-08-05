/**
 * Article Tiles Component
 * Handles interactive tiles with mouse-following gradient effects and staggered animations
 */

import { Component } from '../../core/Component.js';

export class ArticleTiles extends Component {
  constructor(config = {}) {
    super({
      name: 'article-tiles',
      selector: config.selector || '.tile',
      ...config
    });
    
    this.tiles = [];
    this.globalPosition = { x: 50, y: 50 }; // Default to center
    this.animationId = null;
    this.isAnimating = false;
  }

  async onInit() {
    this.tiles = Array.from(document.querySelectorAll('.tile'));
    
    if (this.tiles.length === 0) {
      console.warn('ArticleTiles: No tiles found');
      return;
    }

    this.setupEventListeners();
    this.setupStaggeredEntryAnimations();
    this.startGradientAnimation();
    
    console.log(`ArticleTiles: Initialized with ${this.tiles.length} tiles`);
  }

  /**
   * Setup event listeners for mouse tracking and tile interactions
   */
  setupEventListeners() {
    // Global mouse tracking for smooth gradient following
    this.addEventListener(document, 'mousemove', (e) => {
      this.globalPosition.x = e.clientX;
      this.globalPosition.y = e.clientY;
    }, { passive: true });

    // Setup individual tile hover effects
    this.tiles.forEach(tile => {
      this.addEventListener(tile, 'mouseenter', (e) => this.handleTileHover(e));
      this.addEventListener(tile, 'mouseleave', (e) => this.handleTileLeave(e));
      this.addEventListener(tile, 'focus', (e) => this.handleTileHover(e));
      this.addEventListener(tile, 'blur', (e) => this.handleTileLeave(e));
    });

    // Cleanup on page unload
    this.addEventListener(window, 'beforeunload', () => {
      this.stopGradientAnimation();
    });
  }

  /**
   * Handle tile hover effects
   */
  handleTileHover(e) {
    const tile = e.currentTarget;
    tile.style.transform = 'translateY(-8px) scale(1.02)';
    tile.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    tile.style.zIndex = '10';
    
    this.emit('tiles:tileHovered', { tile });
  }

  /**
   * Handle tile leave effects
   */
  handleTileLeave(e) {
    const tile = e.currentTarget;
    tile.style.transform = 'translateY(0) scale(1.0)';
    tile.style.zIndex = '';
    
    this.emit('tiles:tileUnhovered', { tile });
  }

  /**
   * Setup staggered entry animations for tiles
   */
  setupStaggeredEntryAnimations() {
    this.tiles.forEach((tile, index) => {
      // Set initial hidden state
      tile.style.opacity = '0';
      tile.style.transform = 'translateY(20px)';
      
      // Staggered animation with random delay
      const delay = Math.random() * 200;
      setTimeout(() => {
        tile.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        tile.style.opacity = '1';
        tile.style.transform = 'translateY(0)';
        
        this.emit('tiles:tileAnimatedIn', { tile, index, delay });
      }, delay);
    });
  }

  /**
   * Start gradient animation loop
   */
  startGradientAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.updateGradients();
  }

  /**
   * Stop gradient animation loop
   */
  stopGradientAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
  }

  /**
   * Update gradient positions for all tiles
   */
  updateGradients() {
    this.tiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      
      // Calculate relative mouse position for this tile
      const mouseX = Math.max(0, Math.min(100, 
        ((this.globalPosition.x - rect.left) / rect.width) * 100
      ));
      const mouseY = Math.max(0, Math.min(100, 
        ((this.globalPosition.y - rect.top) / rect.height) * 100
      ));
      
      // Enhanced gradient with 600px circle radius
      tile.style.background = `
        radial-gradient(
          600px circle at ${mouseX}% ${mouseY}%, 
          var(--primary-gradient-color, #3b82f6), 
          var(--secondary-gradient-color, #1e40af)
        )
      `;
    });
    
    if (this.isAnimating) {
      this.animationId = requestAnimationFrame(() => this.updateGradients());
    }
  }

  /**
   * Update gradient colors
   */
  updateGradientColors(primaryColor, secondaryColor) {
    document.documentElement.style.setProperty('--primary-gradient-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-gradient-color', secondaryColor);
    
    this.emit('tiles:colorsUpdated', { primaryColor, secondaryColor });
  }

  /**
   * Reset all tile styles
   */
  resetTiles() {
    this.tiles.forEach(tile => {
      tile.style.opacity = '';
      tile.style.transform = '';
      tile.style.transition = '';
      tile.style.background = '';
      tile.style.zIndex = '';
    });
    
    this.emit('tiles:tilesReset');
  }

  /**
   * Add new tiles dynamically
   */
  addTiles(newTiles) {
    const tilesToAdd = Array.isArray(newTiles) ? newTiles : [newTiles];
    
    tilesToAdd.forEach(tile => {
      if (tile && tile.classList.contains('tile')) {
        this.tiles.push(tile);
        
        // Setup events for new tile
        this.addEventListener(tile, 'mouseenter', (e) => this.handleTileHover(e));
        this.addEventListener(tile, 'mouseleave', (e) => this.handleTileLeave(e));
        this.addEventListener(tile, 'focus', (e) => this.handleTileHover(e));
        this.addEventListener(tile, 'blur', (e) => this.handleTileLeave(e));
        
        // Animate in new tile
        tile.style.opacity = '0';
        tile.style.transform = 'translateY(20px)';
        setTimeout(() => {
          tile.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          tile.style.opacity = '1';
          tile.style.transform = 'translateY(0)';
        }, 100);
      }
    });
    
    this.emit('tiles:tilesAdded', { addedTiles: tilesToAdd });
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    this.stopGradientAnimation();
    this.resetTiles();
    console.log('ArticleTiles: Component destroyed');
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-tiles', ArticleTiles);