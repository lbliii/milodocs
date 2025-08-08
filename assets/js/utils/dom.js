/**
 * DOM utilities - Common DOM operations and helpers
 * Consolidates patterns from main.js, performance-optimizations.js and other files
 */
import { setSafeHTML } from './sanitize.js';

/**
 * DOM ready utility - single point for DOMContentLoaded handling
 */
export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Element selection with error handling
 */
export function $(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: "${selector}"`, error);
    return null;
  }
}

export function $$(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.warn(`Invalid selector: "${selector}"`, error);
    return [];
  }
}

/**
 * Create ripple effect - extracted from main.js
 */
export function createRipple(element, event) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    position: absolute;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.25;
    pointer-events: none;
    transform: scale(0);
    animation: ripple 0.6s linear;
  `;
  
  ripple.classList.add('ripple');
  element.style.position = element.style.position || 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  // Use CSS timing token for ripple duration
  const rippleDuration = getComputedStyle(document.documentElement).getPropertyValue('--timing-slow');
  const duration = parseFloat(rippleDuration) * 1000 || 500; // Default to 500ms if token unavailable
  setTimeout(() => ripple.remove(), duration);
}

/**
 * Smooth scrolling utility
 */
export function smoothScrollTo(target, offset = 0, behavior = 'smooth') {
  let element;
  
  if (typeof target === 'string') {
    element = $(target);
  } else if (target instanceof Element) {
    element = target;
  } else {
    console.warn('Invalid scroll target:', target);
    return;
  }
  
  if (!element) {
    console.warn('Scroll target not found:', target);
    return;
  }
  
  const targetPosition = element.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior
  });
}

/**
 * Debounce function for performance
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function for performance
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
}

/**
 * Wait for element to exist in DOM
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = $(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = $(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Add event listener with automatic cleanup
 */
export function addEventListenerWithCleanup(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  
  return {
    remove() {
      element.removeEventListener(event, handler, options);
    }
  };
}

/**
 * Delegate event handling
 */
export function delegate(parent, selector, event, handler) {
  const delegatedHandler = (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  };
  
  parent.addEventListener(event, delegatedHandler);
  
  return {
    remove() {
      parent.removeEventListener(event, delegatedHandler);
    }
  };
}

/**
 * Create element with attributes and content
 */
export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className' || key === 'class') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content) {
    if (typeof content === 'string') {
      // Use sanitized HTML when string content is provided
      try {
        setSafeHTML(element, content);
      } catch {
        // Fallback to textContent if sanitizer import fails unexpectedly
        element.textContent = content;
      }
    } else if (content instanceof Element) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }
  }
  
  return element;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  // Modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback:', err);
    }
  }
  
  // Fallback for older browsers
  try {
    const textArea = createElement('textarea', {
      value: text,
      style: 'position: fixed; opacity: 0; pointer-events: none;'
    });
    
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Clipboard fallback failed:', err);
    return false;
  }
}