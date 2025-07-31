/**
 * Accessibility utilities - A11y helpers and patterns
 * Consolidates accessibility features from performance-optimizations.js and other files
 */

/**
 * Screen reader announcements
 */
class ScreenReaderAnnouncer {
  constructor() {
    this.announcer = null;
    this.init();
  }

  init() {
    if (this.announcer) return;
    
    this.announcer = document.createElement('div');
    Object.assign(this.announcer, {
      id: 'sr-announcer',
      className: 'sr-only',
      setAttribute: (name, value) => this.announcer.setAttribute(name, value)
    });
    
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    
    // Visually hidden but accessible to screen readers
    Object.assign(this.announcer.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    });
    
    document.body.appendChild(this.announcer);
  }

  announce(message, priority = 'polite') {
    if (!this.announcer) this.init();
    
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  assertive(message) {
    this.announce(message, 'assertive');
  }
}

// Global instance
const announcer = new ScreenReaderAnnouncer();

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  announcer.announce(message, priority);
}

/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Focus trap for modals and overlays
   */
  trap(container, options = {}) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && options.onEscape) {
        options.onEscape();
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Focus first element
    firstElement?.focus();
    
    return {
      release() {
        container.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(selector))
      .filter(element => {
        return !element.disabled && 
               !element.hidden && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
      });
  },

  /**
   * Save and restore focus
   */
  save() {
    return document.activeElement;
  },

  restore(element) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboard = {
  /**
   * Arrow key navigation for lists/grids
   */
  setupArrowNavigation(container, options = {}) {
    const {
      itemSelector = '[role="option"], button, a',
      direction = 'both', // 'horizontal', 'vertical', 'both'
      wrap = true,
      onActivate = null
    } = options;
    
    const handleKeyDown = (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector));
      const currentIndex = items.indexOf(document.activeElement);
      
      if (currentIndex === -1) return;
      
      let nextIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            e.preventDefault();
            nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            e.preventDefault();
            nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            e.preventDefault();
            nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            e.preventDefault();
            nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          if (onActivate) {
            e.preventDefault();
            onActivate(items[currentIndex], currentIndex);
          }
          break;
      }
      
      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return {
      destroy() {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  },

  /**
   * Global keyboard shortcuts
   */
  addShortcut(key, callback, options = {}) {
    const {
      ctrl = false,
      alt = false,
      shift = false,
      meta = false,
      preventDefault = true
    } = options;
    
    const handleKeyDown = (e) => {
      if (e.key === key &&
          e.ctrlKey === ctrl &&
          e.altKey === alt &&
          e.shiftKey === shift &&
          e.metaKey === meta) {
        
        if (preventDefault) {
          e.preventDefault();
        }
        
        callback(e);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return {
      remove() {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }
};

/**
 * ARIA utilities
 */
export const aria = {
  /**
   * Update ARIA attributes
   */
  set(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      element.setAttribute(ariaKey, value);
    });
  },

  /**
   * Toggle ARIA state
   */
  toggle(element, attribute, value1 = 'true', value2 = 'false') {
    const ariaKey = attribute.startsWith('aria-') ? attribute : `aria-${attribute}`;
    const currentValue = element.getAttribute(ariaKey);
    const newValue = currentValue === value1 ? value2 : value1;
    element.setAttribute(ariaKey, newValue);
    return newValue;
  },

  /**
   * Setup expandable content ARIA
   */
  setupExpandable(trigger, content, expanded = false) {
    const contentId = content.id || `expandable-${Date.now()}`;
    content.id = contentId;
    
    trigger.setAttribute('aria-expanded', String(expanded));
    trigger.setAttribute('aria-controls', contentId);
    content.setAttribute('aria-hidden', String(!expanded));
    
    return {
      expand() {
        trigger.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
      },
      collapse() {
        trigger.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
      },
      toggle() {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        return isExpanded ? this.collapse() : this.expand();
      }
    };
  }
};

/**
 * Reduced motion utilities
 */
export const motion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Respect reduced motion preference
   */
  respectPreference(normalAnimation, reducedAnimation = null) {
    return this.prefersReduced() ? (reducedAnimation || (() => {})) : normalAnimation;
  }
};

/**
 * Color contrast utilities
 */
export const contrast = {
  /**
   * Check if user prefers high contrast
   */
  prefersHigh() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Get luminance of a color
   */
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(...color1);
    const l2 = this.getLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
};

/**
 * High contrast mode detection
 */
export function detectHighContrastMode() {
  // Create a test element to detect high contrast mode
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    border: 1px solid;
    border-color: red green;
    position: absolute;
    height: 5px;
    top: -999px;
    background-image: url("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
  `;
  
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const isHighContrast = computedStyle.borderTopColor === computedStyle.borderRightColor;
  
  document.body.removeChild(testElement);
  
  return isHighContrast;
}

// Make global announcer available
if (typeof window !== 'undefined') {
  window.announceToScreenReader = announceToScreenReader;
}