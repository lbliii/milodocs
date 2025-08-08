/**
 * NotificationManager - Unified toast notification system
 * Provides consistent notifications with accessibility and customization
 */

import { announceToScreenReader, motion } from './accessibility.js';
import { animationBridge } from '../core/AnimationBridge.js';
import { sanitizeHTML, escapeHTML } from './sanitize.js';

/**
 * @typedef {Object} NotificationOptions
 * @property {string} [type] - Notification type ('success', 'error', 'warning', 'info')
 * @property {number} [duration] - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @property {string} [position] - Position ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center')
 * @property {boolean} [persistent] - Whether notification requires manual dismissal
 * @property {boolean} [dismissible] - Whether notification can be dismissed
 * @property {string} [action] - Action button text
 * @property {Function} [onAction] - Action button callback
 * @property {Function} [onDismiss] - Dismiss callback
 * @property {boolean} [announce] - Whether to announce to screen readers
 * @property {string} [icon] - Custom icon HTML or icon class
 * @property {Object} [metadata] - Additional metadata for tracking
 */

/**
 * @typedef {Object} NotificationInstance
 * @property {string} id - Unique notification ID
 * @property {HTMLElement} element - Notification DOM element
 * @property {NotificationOptions} options - Configuration options
 * @property {number} timestamp - Creation timestamp
 * @property {number} [timeoutId] - Auto-dismiss timeout ID
 */

export class NotificationManager {
  static notifications = new Map();
  static containers = new Map();
  static notificationId = 0;
  static maxNotifications = 5;
  static initialized = false;

  // Default durations by type (milliseconds)
  static DefaultDurations = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000
  };

  // Default icons by type
  static DefaultIcons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`
  };

  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string|NotificationOptions} typeOrOptions - Type string or full options object
   * @param {number} [duration] - Duration override
   * @returns {string} - Notification ID
   */
  static show(message, typeOrOptions = 'info', duration = null) {
    // Handle legacy API (message, type, duration)
    const options = typeof typeOrOptions === 'string' 
      ? { type: typeOrOptions, duration }
      : typeOrOptions;

    const config = {
      type: 'info',
      duration: null, // Will use default based on type
      position: 'top-right',
      persistent: false,
      dismissible: true,
      announce: true,
      icon: null,
      action: null,
      onAction: null,
      onDismiss: null,
      metadata: {},
      ...options
    };

    // Set default duration if not specified
    if (config.duration === null) {
      config.duration = config.persistent ? 0 : this.DefaultDurations[config.type];
    }

    // Initialize if needed
    if (!this.initialized) {
      this.initialize();
    }

    // Generate unique ID
    const notificationId = `notification-${++this.notificationId}`;
    
    // Create notification element
    const element = this.createElement(notificationId, message, config);
    
    // Get or create container for position
    const container = this.getContainer(config.position);
    
    // Manage notification queue
    this.manageQueue(config.position);
    
    // Add to container with animation
    this.addToContainer(container, element, config);
    
    // Setup auto-dismiss
    let timeoutId = null;
    if (config.duration > 0) {
      timeoutId = setTimeout(() => {
        this.dismiss(notificationId);
      }, config.duration);
    }
    
    // Store notification instance
    const notification = {
      id: notificationId,
      element,
      options: config,
      timestamp: Date.now(),
      timeoutId
    };
    
    this.notifications.set(notificationId, notification);
    
    // Announce to screen readers
    if (config.announce) {
      const announcement = `${config.type} notification: ${message}`;
      announceToScreenReader(announcement);
    }
    
    // Track notification for analytics
    this.trackNotification('show', notification);
    
    return notificationId;
  }

  /**
   * Dismiss a notification
   * @param {string} notificationId - Notification ID to dismiss
   * @param {boolean} [userTriggered] - Whether dismissal was user-triggered
   */
  static dismiss(notificationId, userTriggered = false) {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return;
    }

    const { element, options, timeoutId } = notification;

    // Clear auto-dismiss timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Call dismiss callback
    if (options.onDismiss) {
      options.onDismiss(notificationId, userTriggered);
    }

    // Animate out
    this.animateOut(element, () => {
      // Remove from DOM
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      // Clean up container if empty
      this.cleanupContainer(element.closest('.notification-container'));
    });

    // Remove from tracking
    this.notifications.delete(notificationId);
    
    // Track dismissal
    this.trackNotification('dismiss', notification, { userTriggered });
  }

  /**
   * Dismiss all notifications
   * @param {string} [position] - Specific position to clear (optional)
   */
  static dismissAll(position = null) {
    for (const [id, notification] of this.notifications) {
      if (!position || notification.options.position === position) {
        this.dismiss(id);
      }
    }
  }

  /**
   * Create notification element
   * @param {string} id - Notification ID
   * @param {string} message - Message text
   * @param {NotificationOptions} options - Configuration
   * @returns {HTMLElement}
   */
  static createElement(id, message, options) {
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification notification--${options.type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Add icon
    const icon = options.icon || this.DefaultIcons[options.type];
    
    // Add action button if specified
    const actionButton = options.action ? `
      <button class="notification__action" aria-label="${escapeHTML(options.action)}">
        ${escapeHTML(options.action)}
      </button>
    ` : '';

    // Add dismiss button if dismissible
    const dismissButton = options.dismissible ? `
      <button class="notification__dismiss" aria-label="Dismiss notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    ` : '';

    // Build inner content safely
    const contentHTML = `
      <div class="notification__content">
        <div class="notification__icon">${icon}</div>
        <div class="notification__message">${escapeHTML(message)}</div>
      </div>
      <div class="notification__actions">
        ${actionButton}
        ${dismissButton}
      </div>
    `;
    notification.innerHTML = sanitizeHTML(contentHTML);

    // Bind event handlers
    this.bindEventHandlers(notification, id, options);

    return notification;
  }

  /**
   * Bind event handlers to notification
   * @param {HTMLElement} element - Notification element
   * @param {string} id - Notification ID
   * @param {NotificationOptions} options - Configuration
   */
  static bindEventHandlers(element, id, options) {
    // Action button
    const actionButton = element.querySelector('.notification__action');
    if (actionButton && options.onAction) {
      actionButton.addEventListener('click', (e) => {
        e.preventDefault();
        options.onAction(id);
      });
    }

    // Dismiss button
    const dismissButton = element.querySelector('.notification__dismiss');
    if (dismissButton) {
      dismissButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.dismiss(id, true);
      });
    }

    // Pause auto-dismiss on hover
    if (options.duration > 0) {
      element.addEventListener('mouseenter', () => {
        this.pauseAutoDismiss(id);
      });

      element.addEventListener('mouseleave', () => {
        this.resumeAutoDismiss(id);
      });
    }

    // Keyboard navigation
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && options.dismissible) {
        this.dismiss(id, true);
      }
    });
  }

  /**
   * Get or create container for position
   * @param {string} position - Container position
   * @returns {HTMLElement}
   */
  static getContainer(position) {
    if (this.containers.has(position)) {
      return this.containers.get(position);
    }

    const container = document.createElement('div');
    container.className = `notification-container notification-container--${position}`;
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Notifications');

    // Position container
    this.positionContainer(container, position);

    document.body.appendChild(container);
    this.containers.set(position, container);

    return container;
  }

  /**
   * Position container based on position string
   * @param {HTMLElement} container - Container element
   * @param {string} position - Position identifier
   */
  static positionContainer(container, position) {
    const baseStyles = {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      padding: '1rem',
      maxWidth: '24rem'
    };

    const positionStyles = {
      'top-right': { top: '0', right: '0' },
      'top-left': { top: '0', left: '0' },
      'bottom-right': { bottom: '0', right: '0', flexDirection: 'column-reverse' },
      'bottom-left': { bottom: '0', left: '0', flexDirection: 'column-reverse' },
      'top-center': { top: '0', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '0', left: '50%', transform: 'translateX(-50%)', flexDirection: 'column-reverse' }
    };

    const styles = { ...baseStyles, ...positionStyles[position] };
    
    Object.assign(container.style, styles);
  }

  /**
   * Add notification to container with animation
   * @param {HTMLElement} container - Target container
   * @param {HTMLElement} element - Notification element
   * @param {NotificationOptions} options - Configuration
   */
  static addToContainer(container, element, options) {
    // Enable pointer events for the notification
    element.style.pointerEvents = 'auto';
    
    // Insert based on container order
    if (options.position.includes('bottom')) {
      container.insertBefore(element, container.firstChild);
    } else {
      container.appendChild(element);
    }

    // Animate in
    this.animateIn(element);
  }

  /**
   * Animate notification in
   * @param {HTMLElement} element - Notification element
   */
  static animateIn(element) {
    if (motion.prefersReduced()) {
      element.style.opacity = '1';
      return;
    }

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';
    // CSS handles transitions via animation tokens

    // Trigger animation
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    });
  }

  /**
   * Animate notification out
   * @param {HTMLElement} element - Notification element
   * @param {Function} callback - Completion callback
   */
  static animateOut(element, callback) {
    if (motion.prefersReduced()) {
      callback();
      return;
    }

    // CSS handles transitions via animation tokens
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';

    const duration = animationBridge.getTiming('medium');
    setTimeout(callback, duration);
  }

  /**
   * Manage notification queue to prevent overflow
   * @param {string} position - Container position
   */
  static manageQueue(position) {
    const container = this.containers.get(position);
    if (!container) return;

    const notifications = container.querySelectorAll('.notification');
    
    if (notifications.length >= this.maxNotifications) {
      // Remove oldest notification
      const oldest = notifications[0];
      const oldestId = oldest.id;
      this.dismiss(oldestId);
    }
  }

  /**
   * Pause auto-dismiss for notification
   * @param {string} notificationId - Notification ID
   */
  static pauseAutoDismiss(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.timeoutId) {
      clearTimeout(notification.timeoutId);
      notification.timeoutId = null;
    }
  }

  /**
   * Resume auto-dismiss for notification
   * @param {string} notificationId - Notification ID
   */
  static resumeAutoDismiss(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.options.duration > 0) {
      const elapsed = Date.now() - notification.timestamp;
      const remaining = notification.options.duration - elapsed;
      
      if (remaining > 0) {
        notification.timeoutId = setTimeout(() => {
          this.dismiss(notificationId);
        }, remaining);
      }
    }
  }

  /**
   * Clean up empty container
   * @param {HTMLElement} container - Container to check
   */
  static cleanupContainer(container) {
    if (container && container.children.length === 0) {
      const position = Array.from(this.containers.entries())
        .find(([, c]) => c === container)?.[0];
      
      if (position) {
        this.containers.delete(position);
        container.remove();
      }
    }
  }

  /**
   * Track notification events
   * @param {string} action - Action performed
   * @param {NotificationInstance} notification - Notification instance
   * @param {Object} [extra] - Additional data
   */
  static trackNotification(action, notification, extra = {}) {
    if (window.eventBus) {
      window.eventBus.emit('notification:tracked', {
        action,
        id: notification.id,
        type: notification.options.type,
        position: notification.options.position,
        timestamp: new Date().toISOString(),
        ...extra
      });
    }
  }

  /**
   * Initialize the notification system
   */
  static initialize() {
    if (this.initialized) return;

    // Add global styles
    this.injectStyles();
    
    // Setup global keyboard handlers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && e.ctrlKey) {
        this.dismissAll();
      }
    });

    this.initialized = true;
    console.log('NotificationManager: Initialized');
  }

  /**
   * Inject CSS styles for notifications
   */
  static injectStyles() {
    if (document.getElementById('notification-styles')) {
      return; // Already injected
    }

    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        min-width: 20rem;
        max-width: 24rem;
        border-left: 4px solid;
        transition: all var(--timing-medium) var(--easing-standard);
      }

      .notification:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
      }

      .notification--success {
        border-left-color: #10b981;
        background: #f0fdf4;
      }

      .notification--error {
        border-left-color: #ef4444;
        background: #fef2f2;
      }

      .notification--warning {
        border-left-color: #f59e0b;
        background: #fffbeb;
      }

      .notification--info {
        border-left-color: #3b82f6;
        background: #eff6ff;
      }

      .notification__content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        flex: 1;
      }

      .notification__icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .notification--success .notification__icon {
        color: #10b981;
      }

      .notification--error .notification__icon {
        color: #ef4444;
      }

      .notification--warning .notification__icon {
        color: #f59e0b;
      }

      .notification--info .notification__icon {
        color: #3b82f6;
      }

      .notification__message {
        font-size: 0.875rem;
        line-height: 1.5;
        color: #374151;
      }

      .notification__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: 0.75rem;
      }

      .notification__action {
        background: transparent;
        border: 1px solid currentColor;
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all var(--timing-fast) var(--easing-standard);
      }

      .notification__action:hover {
        background: currentColor;
        color: white;
      }

      .notification__dismiss {
        background: transparent;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        border-radius: 0.25rem;
        color: #6b7280;
        transition: all var(--timing-fast) var(--easing-standard);
      }

      .notification__dismiss:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #374151;
      }

      @media (prefers-reduced-motion: reduce) {
        .notification,
        .notification * {
          transition: none !important;
          animation: none !important;
        }
      }

      @media (max-width: 640px) {
        .notification-container {
          left: 0.5rem !important;
          right: 0.5rem !important;
          max-width: none !important;
          transform: none !important;
        }

        .notification {
          min-width: auto;
          max-width: none;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Get notification statistics
   * @returns {Object}
   */
  static getStats() {
    const stats = {
      active: this.notifications.size,
      byType: {},
      byPosition: {},
      containers: this.containers.size
    };

    for (const notification of this.notifications.values()) {
      const type = notification.options.type;
      const position = notification.options.position;
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byPosition[position] = (stats.byPosition[position] || 0) + 1;
    }

    return stats;
  }
}

// Convenience functions for common notification types
export const toast = (message, type = 'info', duration = null) => 
  NotificationManager.show(message, type, duration);

export const showSuccess = (message, options = {}) => 
  NotificationManager.show(message, { type: 'success', ...options });

export const showError = (message, options = {}) => 
  NotificationManager.show(message, { type: 'error', ...options });

export const showWarning = (message, options = {}) => 
  NotificationManager.show(message, { type: 'warning', ...options });

export const showInfo = (message, options = {}) => 
  NotificationManager.show(message, { type: 'info', ...options });

export const dismissNotification = (id) => NotificationManager.dismiss(id);
export const dismissAllNotifications = () => NotificationManager.dismissAll();

// Make toast function globally available for backward compatibility
// Only set if not already defined (avoid conflicts with existing Toast component)
if (typeof window !== 'undefined' && !window.toast) {
  window.toast = toast;
  console.log('NotificationManager: Global toast function registered');
} else if (typeof window !== 'undefined') {
  console.log('NotificationManager: Global toast already exists, skipping registration');
}

// Provide MiloUX.showNotification alias for compatibility
if (typeof window !== 'undefined') {
  if (!window.MiloUX) {
    window.MiloUX = {};
  }
  if (!window.MiloUX.showNotification) {
    window.MiloUX.showNotification = (message, type = 'info', duration = null) => 
      NotificationManager.show(message, type, duration);
  }
}