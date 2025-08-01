/**
 * Utilities index - Central export for all utility modules
 */

// DOM utilities
export {
  ready,
  $,
  $$,
  createRipple,
  smoothScrollTo,
  debounce,
  throttle,
  isInViewport,
  waitForElement,
  addEventListenerWithCleanup,
  delegate,
  createElement,
  copyToClipboard
} from './dom.js';

// Storage utilities
export {
  localStorage,
  sessionStorage,
  Storage,
  createNamespacedStorage
} from './storage.js';

// Animation utilities
export {
  transitions,
  typeWriter,
  staggeredAnimation,
  ScrollAnimationObserver,
  animateCounter,
  ParallaxController,
  createLoadingSpinner,
  animateProgressBar
} from './animation.js';

// Accessibility utilities
export {
  announceToScreenReader,
  focus,
  keyboard,
  aria,
  motion,
  contrast,
  detectHighContrastMode
} from './accessibility.js';

// Copy management utilities
export {
  CopyManager,
  copyText,
  copyFromElement,
  setupCopyButtons
} from './CopyManager.js';

// Loading state management utilities
export {
  LoadingStateManager,
  showLoading,
  hideLoading,
  showSpinner,
  showSkeleton,
  updateProgress
} from './LoadingStateManager.js';

// Error handling utilities
export {
  ErrorHandler,
  handleError,
  handleNetworkError,
  handleValidationError,
  createErrorBoundary,
  handleFetchError
} from './ErrorHandler.js';

// Notification management utilities
export {
  NotificationManager,
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  dismissNotification,
  dismissAllNotifications
} from './NotificationManager.js';

// 🚀 Modern Feature Detection utilities
export {
  modernFeatures,
  withFallback,
  requestIdleTime,
  deepClone,
  logFeatureSupport,
  initFeatureDetection
} from './FeatureDetection.js';

// Common utility patterns
export const utils = {
  // Generate unique IDs
  generateId(prefix = 'milo') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format dates consistently
  formatDate(date, options = {}) {
    const defaults = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(date);
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Parse query parameters
  parseQueryParams(url = window.location.search) {
    return new URLSearchParams(url);
  },

  // Clamp number between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Check if object is empty
  isEmpty(obj) {
    return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0);
  },

  // Deep merge objects
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  // Check if value is object
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Format file size
  formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};