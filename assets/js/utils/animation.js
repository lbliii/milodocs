/**
 * Animation utilities - Common animation patterns and helpers
 * Consolidates animation logic from various components
 */

/**
 * CSS transition utilities
 */
export const transitions = {
  /**
   * Slide down animation
   */
  slideDown(element, duration = 300) {
    return new Promise(resolve => {
      element.style.height = '0';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.height = element.scrollHeight + 'px';
        
        setTimeout(() => {
          element.style.height = '';
          element.style.overflow = '';
          element.style.transition = '';
          resolve();
        }, duration);
      });
    });
  },

  /**
   * Slide up animation
   */
  slideUp(element, duration = 300) {
    return new Promise(resolve => {
      element.style.height = element.scrollHeight + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.height = '0';
        
        setTimeout(() => {
          element.style.height = '';
          element.style.overflow = '';
          element.style.transition = '';
          resolve();
        }, duration);
      });
    });
  },

  /**
   * Fade in animation
   */
  fadeIn(element, duration = 300) {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      });
    });
  },

  /**
   * Fade out animation
   */
  fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Scale in animation
   */
  scaleIn(element, duration = 300) {
    return new Promise(resolve => {
      element.style.transform = 'scale(0)';
      element.style.transition = `transform ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.transform = 'scale(1)';
        
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      });
    });
  }
};

/**
 * Typing animation utility
 */
export function typeWriter(element, text, speed = 50) {
  return new Promise(resolve => {
    element.textContent = '';
    let i = 0;
    
    const typeInterval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      
      if (i >= text.length) {
        clearInterval(typeInterval);
        resolve();
      }
    }, speed);
  });
}

/**
 * Stagger animation for multiple elements
 */
export function staggeredAnimation(elements, animationFn, delay = 100) {
  return Promise.all(
    elements.map((element, index) => {
      return new Promise(resolve => {
        setTimeout(async () => {
          await animationFn(element);
          resolve();
        }, index * delay);
      });
    })
  );
}

/**
 * Intersection Observer for scroll animations
 */
export class ScrollAnimationObserver {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -10% 0px',
      animationClass: options.animationClass || 'animate-in',
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.dataset.animation || this.options.animationClass;
        
        element.classList.add(animation);
        
        // Remove from observer if one-time animation
        if (!element.dataset.repeatAnimation) {
          this.observer.unobserve(element);
        }
      } else if (entry.target.dataset.repeatAnimation) {
        // Remove animation class if repeat is enabled
        const animation = entry.target.dataset.animation || this.options.animationClass;
        entry.target.classList.remove(animation);
      }
    });
  }

  observe(element) {
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

/**
 * Smooth counter animation
 */
export function animateCounter(element, endValue, duration = 1000, startValue = 0) {
  return new Promise(resolve => {
    const range = endValue - startValue;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (range * easeOut));
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(updateCounter);
  });
}

/**
 * Parallax effect utility
 */
export class ParallaxController {
  constructor() {
    this.elements = new Map();
    this.isRunning = false;
    this.handleScroll = this.handleScroll.bind(this);
  }

  add(element, speed = 0.5, direction = 'vertical') {
    this.elements.set(element, { speed, direction });
    
    if (!this.isRunning) {
      this.start();
    }
  }

  remove(element) {
    this.elements.delete(element);
    
    if (this.elements.size === 0) {
      this.stop();
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  stop() {
    this.isRunning = false;
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const scrollY = window.pageYOffset;
    
    this.elements.forEach((config, element) => {
      const { speed, direction } = config;
      const transform = direction === 'vertical' 
        ? `translateY(${scrollY * speed}px)`
        : `translateX(${scrollY * speed}px)`;
      
      element.style.transform = transform;
    });
  }
}

/**
 * Loading spinner utility
 */
export function createLoadingSpinner(size = 'medium', color = 'currentColor') {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  };
  
  const spinner = document.createElement('div');
  spinner.className = `animate-spin ${sizes[size]} border-2 border-transparent border-t-current rounded-full`;
  spinner.style.borderTopColor = color;
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Loading');
  
  return spinner;
}

/**
 * Progress bar animation
 */
export function animateProgressBar(element, targetPercent, duration = 1000) {
  return new Promise(resolve => {
    const startPercent = parseFloat(element.style.width) || 0;
    const range = targetPercent - startPercent;
    const startTime = performance.now();
    
    function updateProgress(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const currentPercent = startPercent + (range * easeOut);
      
      element.style.width = `${currentPercent}%`;
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(updateProgress);
  });
}