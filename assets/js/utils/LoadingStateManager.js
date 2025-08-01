/**
 * LoadingStateManager - Unified loading states and skeleton screens
 * Provides consistent loading indicators with accessibility support
 */

import { motion } from './accessibility.js';

/**
 * @typedef {Object} LoadingOptions
 * @property {string} [type] - Type of loading indicator ('spinner', 'skeleton', 'progress', 'dots')
 * @property {string} [message] - Loading message
 * @property {string} [size] - Size ('small', 'medium', 'large')
 * @property {string} [variant] - Style variant ('primary', 'secondary', 'minimal')
 * @property {boolean} [overlay] - Whether to show as overlay
 * @property {boolean} [blocking] - Whether to block user interaction
 * @property {Object} [skeleton] - Skeleton configuration
 * @property {number} [progress] - Progress percentage (0-100)
 * @property {boolean} [animate] - Whether to animate (respects motion preferences)
 * @property {string} [ariaLabel] - Custom aria-label
 */

/**
 * @typedef {Object} SkeletonConfig
 * @property {number} [lines] - Number of skeleton lines
 * @property {string[]} [widths] - Width percentages for each line
 * @property {boolean} [avatar] - Include avatar placeholder
 * @property {boolean} [title] - Include title placeholder
 * @property {boolean} [paragraph] - Include paragraph placeholder
 * @property {string} [template] - Predefined template ('article', 'card', 'list')
 */

export class LoadingStateManager {
  static activeLoaders = new Map();
  static loaderId = 0;

  /**
   * Show loading state in container
   * @param {HTMLElement|string} container - Container element or selector
   * @param {LoadingOptions} options - Loading configuration
   * @returns {string} - Unique loader ID for later removal
   */
  static show(container, options = {}) {
    const element = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!element) {
      console.warn('LoadingStateManager: Container not found');
      return null;
    }

    const config = {
      type: 'spinner',
      message: 'Loading...',
      size: 'medium',
      variant: 'primary',
      overlay: false,
      blocking: false,
      animate: !motion.prefersReduced(),
      ariaLabel: 'Loading content',
      ...options
    };

    const loaderId = `loader-${++this.loaderId}`;
    const loaderElement = this.createLoader(config, loaderId);
    
    // Store original content for restoration
    const originalContent = element.innerHTML;
    const originalAriaAttributes = this.getAriaAttributes(element);
    
    // Apply loading state
    if (config.overlay) {
      this.showAsOverlay(element, loaderElement, config);
    } else {
      element.innerHTML = '';
      element.appendChild(loaderElement);
    }

    // Update accessibility attributes
    element.setAttribute('aria-busy', 'true');
    element.setAttribute('aria-live', 'polite');
    if (config.ariaLabel) {
      element.setAttribute('aria-label', config.ariaLabel);
    }

    // Store loader state
    this.activeLoaders.set(loaderId, {
      element,
      loaderElement,
      originalContent,
      originalAriaAttributes,
      config
    });

    // Track loading for analytics
    this.trackLoadingEvent('show', config);

    return loaderId;
  }

  /**
   * Hide loading state and restore content
   * @param {string} loaderId - Loader ID returned from show()
   * @param {HTMLElement} [newContent] - Optional new content to replace with
   */
  static hide(loaderId, newContent = null) {
    const loader = this.activeLoaders.get(loaderId);
    if (!loader) {
      return;
    }

    const { element, originalContent, originalAriaAttributes, config } = loader;

    // Restore content with optional animation
    if (config.animate && !motion.prefersReduced()) {
      this.animateContentRestore(element, originalContent, newContent);
    } else {
      if (newContent) {
        if (typeof newContent === 'string') {
          element.innerHTML = newContent;
        } else {
          element.innerHTML = '';
          element.appendChild(newContent);
        }
      } else {
        element.innerHTML = originalContent;
      }
    }

    // Restore accessibility attributes
    element.removeAttribute('aria-busy');
    element.removeAttribute('aria-live');
    this.restoreAriaAttributes(element, originalAriaAttributes);

    // Clean up
    this.activeLoaders.delete(loaderId);
    this.trackLoadingEvent('hide', config);
  }

  /**
   * Update loading progress for progress-type loaders
   * @param {string} loaderId - Loader ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} [message] - Optional message update
   */
  static updateProgress(loaderId, progress, message = null) {
    const loader = this.activeLoaders.get(loaderId);
    if (!loader || loader.config.type !== 'progress') {
      return;
    }

    const progressBar = loader.loaderElement.querySelector('.loading-progress-bar');
    const progressText = loader.loaderElement.querySelector('.loading-progress-text');
    const messageElement = loader.loaderElement.querySelector('.loading-message');

    if (progressBar) {
      progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }

    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }

    if (message && messageElement) {
      messageElement.textContent = message;
    }

    // Update loader state
    loader.config.progress = progress;
  }

  /**
   * Create loader element based on configuration
   * @param {LoadingOptions} config - Loading configuration
   * @param {string} loaderId - Unique loader ID
   * @returns {HTMLElement}
   */
  static createLoader(config, loaderId) {
    const wrapper = document.createElement('div');
    wrapper.className = `loading-state loading-state--${config.type} loading-state--${config.size}`;
    wrapper.setAttribute('data-loader-id', loaderId);
    wrapper.setAttribute('role', 'status');
    wrapper.setAttribute('aria-label', config.ariaLabel);

    switch (config.type) {
      case 'spinner':
        wrapper.appendChild(this.createSpinner(config));
        break;
      case 'skeleton':
        wrapper.appendChild(this.createSkeleton(config));
        break;
      case 'progress':
        wrapper.appendChild(this.createProgress(config));
        break;
      case 'dots':
        wrapper.appendChild(this.createDots(config));
        break;
      default:
        wrapper.appendChild(this.createSpinner(config));
    }

    return wrapper;
  }

  /**
   * Create spinner loading indicator
   * @param {LoadingOptions} config - Configuration
   * @returns {HTMLElement}
   */
  static createSpinner(config) {
    const container = document.createElement('div');
    container.className = `loading-spinner loading-spinner--${config.variant}`;

    const sizes = {
      small: '1rem',
      medium: '2rem',
      large: '3rem'
    };

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner__circle';
    spinner.style.cssText = `
      width: ${sizes[config.size]};
      height: ${sizes[config.size]};
      border: 2px solid var(--color-border-light, #e5e7eb);
      border-top: 2px solid var(--color-brand, #3b82f6);
      border-radius: 50%;
      ${config.animate ? 'animation: loading-spin 1s linear infinite;' : ''}
    `;

    container.appendChild(spinner);

    if (config.message) {
      const message = document.createElement('div');
      message.className = 'loading-message';
      message.textContent = config.message;
      message.style.cssText = `
        margin-top: 0.75rem;
        font-size: 0.875rem;
        color: var(--color-text-secondary, #6b7280);
        text-align: center;
      `;
      container.appendChild(message);
    }

    return container;
  }

  /**
   * Create skeleton loading screen
   * @param {LoadingOptions} config - Configuration
   * @returns {HTMLElement}
   */
  static createSkeleton(config) {
    const container = document.createElement('div');
    container.className = 'loading-skeleton';
    container.setAttribute('aria-label', 'Loading content structure');

    const skeleton = config.skeleton || {};
    
    // Use predefined template if specified
    if (skeleton.template) {
      return this.createSkeletonTemplate(skeleton.template, config);
    }

    // Avatar
    if (skeleton.avatar) {
      const avatar = document.createElement('div');
      avatar.className = 'skeleton-avatar';
      avatar.style.cssText = `
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: var(--skeleton-color, #e5e7eb);
        margin-bottom: 1rem;
        ${config.animate ? 'animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
      `;
      container.appendChild(avatar);
    }

    // Title
    if (skeleton.title) {
      const title = document.createElement('div');
      title.className = 'skeleton-title';
      title.style.cssText = `
        height: 1.5rem;
        background: var(--skeleton-color, #e5e7eb);
        border-radius: 0.25rem;
        margin-bottom: 0.75rem;
        width: 75%;
        ${config.animate ? 'animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
      `;
      container.appendChild(title);
    }

    // Paragraph lines
    const lines = skeleton.lines || 3;
    const widths = skeleton.widths || ['100%', '85%', '60%'];
    
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      line.style.cssText = `
        height: 1rem;
        background: var(--skeleton-color, #e5e7eb);
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
        width: ${widths[i] || '90%'};
        ${config.animate ? `animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;` : ''}
        animation-delay: ${i * 0.1}s;
      `;
      container.appendChild(line);
    }

    return container;
  }

  /**
   * Create predefined skeleton templates
   * @param {string} template - Template name
   * @param {LoadingOptions} config - Configuration
   * @returns {HTMLElement}
   */
  static createSkeletonTemplate(template, config) {
    const container = document.createElement('div');
    container.className = `loading-skeleton loading-skeleton--${template}`;

    switch (template) {
      case 'article':
        container.innerHTML = `
          <div class="skeleton-title skeleton-element"></div>
          <div class="skeleton-meta skeleton-element"></div>
          <div class="skeleton-line skeleton-element" style="width: 100%"></div>
          <div class="skeleton-line skeleton-element" style="width: 85%"></div>
          <div class="skeleton-line skeleton-element" style="width: 60%"></div>
          <div class="skeleton-heading skeleton-element" style="width: 40%; margin-top: 1.5rem;"></div>
          <div class="skeleton-line skeleton-element" style="width: 90%"></div>
          <div class="skeleton-line skeleton-element" style="width: 75%"></div>
        `;
        break;
      
      case 'card':
        container.innerHTML = `
          <div class="skeleton-image skeleton-element" style="height: 8rem; width: 100%; margin-bottom: 1rem;"></div>
          <div class="skeleton-title skeleton-element" style="width: 80%"></div>
          <div class="skeleton-line skeleton-element" style="width: 100%"></div>
          <div class="skeleton-line skeleton-element" style="width: 70%"></div>
        `;
        break;
      
      case 'list':
        for (let i = 0; i < 5; i++) {
          const item = document.createElement('div');
          item.className = 'skeleton-list-item';
          item.style.cssText = 'display: flex; align-items: center; margin-bottom: 1rem;';
          item.innerHTML = `
            <div class="skeleton-avatar skeleton-element" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; margin-right: 0.75rem;"></div>
            <div style="flex: 1;">
              <div class="skeleton-line skeleton-element" style="width: 60%; margin-bottom: 0.5rem;"></div>
              <div class="skeleton-line skeleton-element" style="width: 40%;"></div>
            </div>
          `;
          container.appendChild(item);
        }
        break;
    }

    // Apply animation if enabled
    if (config.animate) {
      container.querySelectorAll('.skeleton-element').forEach((el, index) => {
        el.style.animation = `skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`;
        el.style.animationDelay = `${index * 0.1}s`;
      });
    }

    return container;
  }

  /**
   * Create progress indicator
   * @param {LoadingOptions} config - Configuration
   * @returns {HTMLElement}
   */
  static createProgress(config) {
    const container = document.createElement('div');
    container.className = 'loading-progress';

    const progress = config.progress || 0;

    container.innerHTML = `
      <div class="loading-progress-track" style="
        width: 100%;
        height: 0.5rem;
        background-color: var(--color-border-light, #e5e7eb);
        border-radius: 0.25rem;
        overflow: hidden;
      ">
        <div class="loading-progress-bar" style="
          height: 100%;
          background-color: var(--color-brand, #3b82f6);
          width: ${progress}%;
          transition: width 0.3s ease;
          ${config.animate ? 'animation: progress-shimmer 2s infinite;' : ''}
        " role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      ${config.message ? `<div class="loading-message" style="margin-top: 0.75rem; text-align: center; font-size: 0.875rem;">${config.message}</div>` : ''}
      <div class="loading-progress-text" style="margin-top: 0.5rem; text-align: center; font-size: 0.75rem; color: var(--color-text-secondary);">${Math.round(progress)}%</div>
    `;

    return container;
  }

  /**
   * Create animated dots indicator
   * @param {LoadingOptions} config - Configuration
   * @returns {HTMLElement}
   */
  static createDots(config) {
    const container = document.createElement('div');
    container.className = 'loading-dots';
    container.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 0.25rem;';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      dot.style.cssText = `
        width: 0.5rem;
        height: 0.5rem;
        background-color: var(--color-brand, #3b82f6);
        border-radius: 50%;
        ${config.animate ? `animation: dot-bounce 1.4s infinite ease-in-out; animation-delay: ${i * 0.16}s;` : ''}
      `;
      container.appendChild(dot);
    }

    if (config.message) {
      const message = document.createElement('div');
      message.className = 'loading-message';
      message.textContent = config.message;
      message.style.cssText = 'margin-left: 0.75rem; font-size: 0.875rem;';
      container.appendChild(message);
    }

    return container;
  }

  /**
   * Show loader as overlay
   * @param {HTMLElement} element - Target element
   * @param {HTMLElement} loaderElement - Loader to show
   * @param {LoadingOptions} config - Configuration
   */
  static showAsOverlay(element, loaderElement, config) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      ${config.blocking ? 'pointer-events: auto;' : 'pointer-events: none;'}
    `;

    overlay.appendChild(loaderElement);
    
    // Ensure parent is positioned
    const position = getComputedStyle(element).position;
    if (position === 'static') {
      element.style.position = 'relative';
    }

    element.appendChild(overlay);
  }

  /**
   * Animate content restoration
   * @param {HTMLElement} element - Target element
   * @param {string} originalContent - Original HTML content
   * @param {HTMLElement|string} [newContent] - New content to show
   */
  static animateContentRestore(element, originalContent, newContent = null) {
    const content = newContent || originalContent;
    
    // Fade out current content
    element.style.transition = 'opacity 0.2s ease';
    element.style.opacity = '0';

    setTimeout(() => {
      // Update content
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else {
        element.innerHTML = '';
        element.appendChild(content);
      }

      // Fade in new content
      element.style.opacity = '1';
      
      // Clean up transition
      setTimeout(() => {
        element.style.transition = '';
      }, 200);
    }, 200);
  }

  /**
   * Get current ARIA attributes from element
   * @param {HTMLElement} element - Target element
   * @returns {Object}
   */
  static getAriaAttributes(element) {
    const attributes = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }

  /**
   * Restore ARIA attributes to element
   * @param {HTMLElement} element - Target element  
   * @param {Object} attributes - Attributes to restore
   */
  static restoreAriaAttributes(element, attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  }

  /**
   * Track loading events for analytics
   * @param {string} action - Action performed
   * @param {LoadingOptions} config - Configuration used
   */
  static trackLoadingEvent(action, config) {
    if (window.eventBus) {
      window.eventBus.emit('loading:tracked', {
        action,
        type: config.type,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Hide all active loaders
   */
  static hideAll() {
    for (const loaderId of this.activeLoaders.keys()) {
      this.hide(loaderId);
    }
  }

  /**
   * Get active loader count
   * @returns {number}
   */
  static getActiveCount() {
    return this.activeLoaders.size;
  }

  /**
   * Initialize CSS animations for loading states
   */
  static initializeStyles() {
    if (document.getElementById('loading-state-styles')) {
      return; // Already initialized
    }

    const styles = document.createElement('style');
    styles.id = 'loading-state-styles';
    styles.textContent = `
      @keyframes loading-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @keyframes progress-shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      @keyframes dot-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .loading-skeleton .skeleton-element {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
      }

      @media (prefers-reduced-motion: reduce) {
        .loading-state *,
        .skeleton-element {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(styles);
  }
}

// Initialize styles when module loads
LoadingStateManager.initializeStyles();

// Convenience functions for common patterns
export const showLoading = (container, options) => LoadingStateManager.show(container, options);
export const hideLoading = (loaderId, newContent) => LoadingStateManager.hide(loaderId, newContent);
export const showSpinner = (container, message) => LoadingStateManager.show(container, { type: 'spinner', message });
export const showSkeleton = (container, template) => LoadingStateManager.show(container, { type: 'skeleton', skeleton: { template } });
export const updateProgress = (loaderId, progress, message) => LoadingStateManager.updateProgress(loaderId, progress, message);