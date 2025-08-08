/**
 * DOM Utilities
 * Reusable DOM manipulation and query utilities
 */

/**
 * Wait for DOM to be ready
 */
export function waitForDOM() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      resolve();
    }
  });
}

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Check if an element is visible in viewport
 */
export function isElementVisible(element, threshold = 0) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  const viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

  return (
    rect.bottom >= threshold &&
    rect.right >= threshold &&
    rect.top <= viewHeight - threshold &&
    rect.left <= viewWidth - threshold
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element, options = {}) {
  if (!element) return;

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options
  };

  element.scrollIntoView(defaultOptions);
}

/**
 * Get element's offset position relative to document
 */
export function getElementOffset(element) {
  if (!element) return { top: 0, left: 0 };

  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft
  };
}

/**
 * Check if element has any of the specified classes
 */
export function hasAnyClass(element, classNames) {
  if (!element || !classNames) return false;
  
  const classes = Array.isArray(classNames) ? classNames : [classNames];
  return classes.some(className => element.classList.contains(className));
}

/**
 * Toggle multiple classes on an element
 */
export function toggleClasses(element, classNames, force = undefined) {
  if (!element || !classNames) return;
  
  const classes = Array.isArray(classNames) ? classNames : [classNames];
  classes.forEach(className => {
    element.classList.toggle(className, force);
  });
}

/**
 * Find the closest scrollable parent
 */
export function findScrollableParent(element) {
  if (!element) return null;

  const overflowRegex = /(auto|scroll)/;
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
}

/**
 * Create element with attributes and content
 */
import { setSafeHTML } from '../../utils/sanitize.js';

export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content) {
    if (typeof content === 'string') {
      try {
        setSafeHTML(element, content);
      } catch {
        element.textContent = content;
      }
    } else {
      element.appendChild(content);
    }
  }
  
  return element;
}

/**
 * Remove element safely with cleanup
 */
export function removeElement(element) {
  if (!element || !element.parentNode) return;
  
  // Emit cleanup event for components
  element.dispatchEvent(new CustomEvent('element:removing', { bubbles: true }));
  
  // Remove from DOM
  element.parentNode.removeChild(element);
}

export default {
  waitForDOM,
  waitForElement,
  isElementVisible,
  scrollToElement,
  getElementOffset,
  hasAnyClass,
  toggleClasses,
  findScrollableParent,
  createElement,
  removeElement
};