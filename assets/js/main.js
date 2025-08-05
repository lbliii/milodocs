/**
 * MiloDocs Main Entry Point - New Architecture
 * Orchestrates the initialization of the entire JavaScript system
 */

import { milo } from './core/MiloCore.js';
import { ready } from './utils/dom.js';
import { registerAllComponents } from './components/index.js';
import { logger } from './utils/Logger.js';

const log = logger.component('MiloDocs');

/**
 * Initialize MiloDocs system
 */
async function initializeMiloDocs() {
  try {
    // Initialize core system
    await milo.init();
    
    // Register critical components
    await registerAllComponents();
    

    
    // Setup global utilities
    await setupGlobalUtilities();
    
    log.info('MiloDocs fully initialized');
    log.debug('Debug utilities available:');
    log.debug('  - window.resetNavigation() - Reset sidebar state');
    log.debug('  - window.debugSidebar() - Debug sidebar info + auto-fix');
    log.debug('  - window.debugComponents() - Show all registered components');
    
  } catch (error) {
    log.error('MiloDocs initialization failed:', error);

    throw error;
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
  
  const { showLoading, hideLoading } = await import('./utils/LoadingStateManager.js');
  
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
  
  // Form loading states using unified LoadingStateManager
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        
        // Store original content for restoration
        const originalContent = submitButton.innerHTML;
        submitButton.setAttribute('data-original-content', originalContent);
        
        // Show loading state using LoadingStateManager
        const loaderId = showLoading(submitButton, {
          type: 'dots',
          message: 'Processing...',
          size: 'small'
        });
        
        // Store loader ID for potential cleanup
        submitButton.setAttribute('data-loader-id', loaderId);
      }
    });
    
    // Handle form completion/error for cleanup
    form.addEventListener('reset', function() {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        const loaderId = submitButton.getAttribute('data-loader-id');
        const originalContent = submitButton.getAttribute('data-original-content');
        
        if (loaderId) {
          hideLoading(loaderId);
          submitButton.removeAttribute('data-loader-id');
        }
        
        if (originalContent) {
          submitButton.innerHTML = originalContent;
          submitButton.removeAttribute('data-original-content');
        }
        
        submitButton.disabled = false;
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
 * Start initialization when DOM is ready
 */
ready(() => {
  // Add environment class for styling
  const env = window.HugoEnvironment?.environment || 'development';
  document.body.classList.add(`env-${env}`);
  
  // Initialize the system
  initializeMiloDocs();
  
  // System ready
  console.log('🚀 MiloDocs enhanced system ready!');
});

// Export for external access
export { milo, initializeMiloDocs };