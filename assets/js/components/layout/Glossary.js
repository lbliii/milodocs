/**
 * Glossary Component
 * Handles interactive glossary cards with mouse-following gradient effects
 */

import { Component } from '../../core/Component.js';

export class Glossary extends Component {
  constructor(config = {}) {
    super({
      name: 'glossary',
      selector: config.selector || '.glossary-entry',
      ...config
    });
    
    this.cards = [];
    this.positions = { x: 50, y: 50 }; // Default to center
    this.animationId = null;
    this.isAnimating = false;
  }

  async onInit() {
    this.cards = Array.from(document.querySelectorAll('.glossary-entry'));
    
    if (this.cards.length === 0) {
      console.warn('Glossary: No glossary entries found');
      return;
    }

    this.setupEventListeners();
    this.startAnimation();
    
    console.log(`Glossary: Initialized with ${this.cards.length} entries`);
  }

  /**
   * Setup event listeners for cards
   */
  setupEventListeners() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      card.addEventListener('mouseover', (e) => this.handleMouseOver(e));
      card.addEventListener('mouseout', (e) => this.handleMouseOut(e));
      card.addEventListener('focus', (e) => this.handleFocus(e));
      card.addEventListener('blur', (e) => this.handleBlur(e));
    });
  }

  /**
   * Handle mouse movement for gradient following
   */
  handleMouseMove(e) {
    this.positions.x = e.clientX;
    this.positions.y = e.clientY;
    this.emit('glossary:mouseMove', { x: e.clientX, y: e.clientY });
  }

  /**
   * Handle mouse over effects
   */
  handleMouseOver(e) {
    const card = e.currentTarget;
    card.style.transform = 'translateY(-10px) scale(1.05)';
    card.style.boxShadow = '0 20px 30px rgba(0, 0, 0, 0.2)';
    card.style.zIndex = '10';
    
    this.emit('glossary:cardHovered', { card });
  }

  /**
   * Handle mouse out effects
   */
  handleMouseOut(e) {
    const card = e.currentTarget;
    card.style.transform = 'translateY(0) scale(1.0)';
    card.style.boxShadow = '';
    card.style.zIndex = '';
    
    this.emit('glossary:cardUnhovered', { card });
  }

  /**
   * Handle focus for keyboard accessibility
   */
  handleFocus(e) {
    this.handleMouseOver(e);
  }

  /**
   * Handle blur for keyboard accessibility
   */
  handleBlur(e) {
    this.handleMouseOut(e);
  }

  /**
   * Start the gradient animation
   */
  startAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animate();
  }

  /**
   * Stop the gradient animation
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
  }

  /**
   * Animation loop for gradient effects
   */
  animate() {
    this.cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const mouseX = (this.positions.x - rect.left) / rect.width * 100;
      const mouseY = (this.positions.y - rect.top) / rect.height * 100;
      
      // Apply gradient with CSS custom properties
      card.style.background = `radial-gradient(circle at ${mouseX}% ${mouseY}%, var(--primary-gradient-color, #3b82f6), var(--secondary-gradient-color, #1e40af))`;
    });
    
    if (this.isAnimating) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  /**
   * Update gradient colors
   */
  updateGradientColors(primaryColor, secondaryColor) {
    document.documentElement.style.setProperty('--primary-gradient-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-gradient-color', secondaryColor);
    
    this.emit('glossary:colorsUpdated', { primaryColor, secondaryColor });
  }

  /**
   * Reset card positions and effects
   */
  resetCards() {
    this.cards.forEach(card => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.zIndex = '';
      card.style.background = '';
    });
    
    this.emit('glossary:cardsReset');
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    this.stopAnimation();
    this.resetCards();
    console.log('Glossary: Component destroyed');
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('glossary', Glossary);