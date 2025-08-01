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
    console.log('💡 Debug utilities:');
    console.log('  - window.resetNavigation() - Reset sidebar state');
    console.log('  - window.debugSidebar() - Debug sidebar info + auto-fix');
    console.log('  - window.debugComponents() - Show all registered components');
    
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
  
  // Navigation debug utilities
  window.resetNavigation = () => {
    const { ComponentManager } = milo.core;
    const sidebar = ComponentManager.getInstances('navigation-sidebar-left')[0];
    if (sidebar && sidebar.reset) {
      sidebar.reset();
      console.log('🔧 Navigation reset successfully');
    } else {
      console.warn('⚠️ Sidebar component not found or reset method not available');
    }
  };
  
  // Enhanced debug utilities
  window.debugSidebar = () => {
    const { ComponentManager } = milo.core;
    const sidebar = ComponentManager.getInstances('navigation-sidebar-left')[0];
    const sidebarElement = document.getElementById('sidebar-left');
    const overlay = document.getElementById('mobileNavOverlay');
    const header = document.querySelector('.sidebar-header');
    
    console.group('🔍 Sidebar Debug Info');
    console.log('Window width:', window.innerWidth);
    console.log('Is mobile:', window.innerWidth < 768);
    console.log('Sidebar component:', sidebar);
    console.log('Sidebar isOpen:', sidebar?.isOpen);
    console.log('Sidebar element:', sidebarElement);
    console.log('Sidebar classes:', sidebarElement?.className);
    console.log('Header element:', header);
    console.log('Header display:', header ? getComputedStyle(header).display : 'not found');
    console.log('Overlay element:', overlay);
    console.log('Overlay classes:', overlay?.className);
    console.log('Body overflow:', document.body.style.overflow);
    console.groupEnd();
    
    // Auto-fix if needed
    if (sidebar && sidebar.checkAndSetProperState) {
      console.log('🔧 Auto-fixing sidebar state...');
      sidebar.checkAndSetProperState();
    }
  };
  
  // Component registration debug utility
  window.debugComponents = () => {
    const { ComponentManager } = milo.core;
    
    console.group('📦 Component Registration Status');
    console.log('Registered components:', Array.from(ComponentManager.components.keys()));
    console.log('Active instances:', Array.from(ComponentManager.instances.keys()).map(id => {
      const instance = ComponentManager.instances.get(id);
      return {
        id,
        name: instance.name,
        initialized: instance.isInitialized,
        element: instance.element?.tagName || 'none'
      };
    }));
    
    // Check for unregistered components in DOM
    const elementsWithComponents = document.querySelectorAll('[data-component]');
    const unregistered = [];
    elementsWithComponents.forEach(el => {
      const componentName = el.getAttribute('data-component');
      if (!ComponentManager.components.has(componentName)) {
        unregistered.push(componentName);
      }
    });
    
    if (unregistered.length > 0) {
      console.warn('⚠️ Unregistered components found:', [...new Set(unregistered)]);
    } else {
      console.log('✅ All DOM components are registered');
    }
    
    console.groupEnd();
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