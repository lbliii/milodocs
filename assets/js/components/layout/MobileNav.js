/**
 * Mobile Navigation Component
 * Handles mobile navigation toggle with accessibility features
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';

export class MobileNav extends Component {
  constructor(config = {}) {
    super({
      name: 'navigation-mobile-toggle',
      selector: config.selector || '#mobileNavToggle',
      ...config
    });
    
    this.overlay = null;
    this.sidebarComponent = null;
    this.closeButton = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('MobileNav: Toggle button not found');
      return;
    }

    this.overlay = document.getElementById('mobileNavOverlay');
    this.sidebarComponent = ComponentManager.getInstances('navigation-sidebar-left')[0];
    this.closeButton = document.getElementById('closeMobileNav');
    
    if (!this.sidebarComponent) {
      console.warn('MobileNav: Sidebar component instance not found');
      return;
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.addEventListener(this.element, 'click', () => this.openMobileNav());
    
    if (this.closeButton) {
      this.addEventListener(this.closeButton, 'click', () => this.closeMobileNav());
    }
    
    if (this.overlay) {
      this.addEventListener(this.overlay, 'click', () => this.closeMobileNav());
    }
    
    this.addEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this.sidebarComponent.isOpen) {
        e.preventDefault();
        this.closeMobileNav();
      }
    });
  }

  openMobileNav() {
    if (this.sidebarComponent.isOpen) return;
    
    this.sidebarComponent.open();
    this.overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    this.closeButton?.focus();
    this.announceToScreenReader('Navigation menu opened');
    this.emit('mobileNav:opened');
  }

  closeMobileNav() {
    if (!this.sidebarComponent.isOpen) return;
    
    this.sidebarComponent.close();
    this.overlay?.classList.add('hidden');
    document.body.style.overflow = '';

    this.element.focus();
    this.announceToScreenReader('Navigation menu closed');
    this.emit('mobileNav:closed');
  }

  announceToScreenReader(message) {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  }

  onDestroy() {
    if (this.sidebarComponent && this.sidebarComponent.isOpen) {
      this.closeMobileNav();
    }
  }
}

ComponentManager.register('navigation-mobile-toggle', MobileNav);
