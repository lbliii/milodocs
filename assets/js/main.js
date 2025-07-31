/**
 * MiloDocs Main Entry Point - New Architecture
 * Orchestrates the initialization of the entire JavaScript system
 */

import { milo } from './core/MiloCore.js';
import { ready } from './utils/dom.js';
import { registerAllComponents } from './components/index.js';

/**
 * Initialize MiloDocs system
 */
async function initializeMiloDocs() {
  try {
    // Initialize core system
    await milo.init();
    
    // Register critical components
    await registerAllComponents();
    
    // Initialize legacy compatibility layer
    initializeLegacySupport();
    
    // Setup global utilities
    await setupGlobalUtilities();
    
    console.log('🎉 MiloDocs fully initialized');
    
  } catch (error) {
    console.error('❌ MiloDocs initialization failed:', error);
    
    // Fallback to legacy system if new system fails
    await initializeLegacyFallback();
  }
}

/**
 * Setup legacy support for existing code
 */
function initializeLegacySupport() {
  const environment = milo.environment;
  
  // Maintain backward compatibility with existing global variables
  window.HugoEnvironment = environment.hugo;
  
  // Legacy global functions that existing code might depend on
  window.createRippleEffect = async (element, event) => {
    const { createRipple } = await import('./utils/dom.js');
    createRipple(element, event);
  };
  
  // Legacy notification system
  if (!window.MiloUX) {
    window.MiloUX = {
      showNotification: (message, type = 'info', duration = 3000) => {
        console.log(`Notification (${type}): ${message}`);
        // This will be replaced with the proper notification system
      }
    };
  }
  
  // Legacy announcer
  if (!window.announceToScreenReader) {
    window.announceToScreenReader = (message) => {
      console.log(`Screen Reader: ${message}`);
      // This will be replaced with the proper accessibility system
    };
  }
}

/**
 * Setup global utilities and enhancements
 */
async function setupGlobalUtilities() {
  // Enhanced global utilities that replace the old main.js functionality
  const { 
    createRipple, 
    smoothScrollTo, 
    debounce, 
    throttle 
  } = await import('./utils/dom.js');
  
  // Global ripple effect setup (from old main.js)
  const clickableElements = document.querySelectorAll(`
    button, .btn, .topbar__button,
    .nav-link, .breadcrumb__link, .toc-link,
    .quicklinks__link, .quicklinks__item,
    .tile, .card, .resource-card,
    .topbar__logo-link, .dropdown-link,
    .sidebar-item__link, .expand-toggle
  `);
  
  clickableElements.forEach(element => {
    element.addEventListener('click', (e) => createRipple(element, e));
  });
  
  // Enhanced hover states (from old main.js)
  const hoverElements = document.querySelectorAll('.tile, .card, .quicklinks__item');
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = '';
    });
  });
  
  // Form loading states (from old main.js)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <div class="flex items-center">
            <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Processing...
          </div>
        `;
      }
    });
  });
  
  // Scroll enhancements (from old main.js)
  await setupScrollEnhancements();
}

/**
 * Setup scroll-based enhancements
 */
async function setupScrollEnhancements() {
  const { throttle } = await import('./utils/dom.js');
  
  let lastScrollY = window.scrollY;
  
  const updateScrollEffects = throttle(() => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    
    // Add scroll-based classes for CSS animations
    document.body.setAttribute('data-scroll-direction', scrollDirection);
    
    // Parallax effect for hero sections
    const heroElements = document.querySelectorAll('.hero-parallax');
    heroElements.forEach(hero => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      hero.style.transform = `translateY(${parallax}px)`;
    });
    
    // Fade in animation for elements in viewport
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    fadeElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        element.classList.add('visible');
      }
    });
    
    lastScrollY = currentScrollY;
  }, 16);
  
  window.addEventListener('scroll', updateScrollEffects, { passive: true });
}

/**
 * Fallback to legacy system if new system fails
 */
async function initializeLegacyFallback() {
  console.warn('🔄 Falling back to legacy initialization');
  
  try {
    // Try to load and run the original main.js functionality
    // This ensures the site still works even if the new system fails
    const originalMain = await import('./main-legacy.js');
    if (originalMain && typeof originalMain.init === 'function') {
      await originalMain.init();
    }
  } catch (error) {
    console.error('❌ Legacy fallback also failed:', error);
    
    // Last resort: basic functionality only
    initializeBasicFunctionality();
  }
}

/**
 * Minimal functionality as last resort
 */
function initializeBasicFunctionality() {
  console.log('⚠️ Running in basic mode');
  
  // Ensure theme switching works at minimum
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    });
  }
}

/**
 * Start initialization when DOM is ready
 */
ready(() => {
  // Add environment class for styling
  const env = window.HugoEnvironment?.environment || 'development';
  document.body.classList.add(`env-${env}`);
  
  // Initialize the system
  initializeMiloDocs();
});

// Export for external access
export { milo, initializeMiloDocs };