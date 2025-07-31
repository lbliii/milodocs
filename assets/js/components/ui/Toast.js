/**
 * Toast Notification Component
 * Dedicated, clean toast notification system
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';

export class Toast extends Component {
  constructor(config = {}) {
    super({
      name: 'toast',
      selector: config.selector || 'body', // Use body as default container
      ...config
    });
    
    this.toasts = new Set();
    this.defaultDuration = 4000;
    this.maxToasts = 4;
  }

  async onInit() {
    // Set up global toast function
    if (!window.toast) {
      window.toast = (message, type = 'info', duration = this.defaultDuration) => {
        return this.show(message, type, duration);
      };
    }
    
    // Set up MiloUX global for backward compatibility
    if (!window.MiloUX) {
      window.MiloUX = {};
    }
    window.MiloUX.showNotification = (message, type = 'info', duration = this.defaultDuration) => {
      return this.show(message, type, duration);
    };
    
    console.log('Toast: Notification system ready');
  }

  /**
   * Show a toast notification
   */
  show(message, type = 'info', duration = this.defaultDuration) {
    // Limit maximum number of toasts
    if (this.toasts.size >= this.maxToasts) {
      const oldestToast = Array.from(this.toasts)[0];
      this.hide(oldestToast);
    }

    const toast = this.createToast(message, type, duration);
    this.toasts.add(toast);
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Trigger entrance animation with a slight delay to ensure DOM is ready
    setTimeout(() => {
      toast.classList.add('toast-notification--visible');
    }, 50);
    
    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast);
      }, duration);
    }
    
    this.emit('toast:shown', { message, type, duration });
    return toast;
  }

  /**
   * Hide a specific toast
   */
  hide(toast) {
    if (!toast || !this.toasts.has(toast)) return;
    
    toast.classList.add('toast-notification--hiding');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toast);
    }, 500);
    
    this.emit('toast:hidden', { toast });
  }

  /**
   * Create toast DOM element
   */
  createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-notification--${type}`;
    
    const icons = {
      success: `<svg class="toast-notification__icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
      </svg>`,
      error: `<svg class="toast-notification__icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
      </svg>`,
      warning: `<svg class="toast-notification__icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>`,
      info: `<svg class="toast-notification__icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
      </svg>`
    };
    
    toast.innerHTML = `
      <div class="toast-notification__content">
        ${icons[type] || icons.info}
        <div class="toast-notification__message">${message}</div>
        <button class="toast-notification__close" aria-label="Close notification">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    // Add close button functionality
    const closeButton = toast.querySelector('.toast-notification__close');
    closeButton.addEventListener('click', () => {
      this.hide(toast);
    });
    
    return toast;
  }

  /**
   * Hide all toasts
   */
  hideAll() {
    Array.from(this.toasts).forEach(toast => {
      this.hide(toast);
    });
  }

  /**
   * Convenience methods
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    this.hideAll();
    if (window.toast === this.show) {
      delete window.toast;
    }
    if (window.MiloUX && window.MiloUX.showNotification === this.show) {
      delete window.MiloUX.showNotification;
    }
  }
}

// Auto-register component
ComponentManager.register('toast', Toast);