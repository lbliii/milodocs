// Enhanced MiloDocs initialization system
// Transitioning to new modular architecture

// Feature flag for new system
const USE_NEW_SYSTEM = window.location.search.includes('new-system') || 
                      localStorage.getItem('milo-use-new-system') === 'true';

// Environment-aware initialization system
document.addEventListener('DOMContentLoaded', async function() {
    // Get Hugo environment data
    const env = window.HugoEnvironment || {};
    const environment = env.environment || 'development';
    const isProduction = env.isProduction || false;
    const debug = env.debug || false;
    
    // Environment-specific console output
    if (debug) {
        console.group(`🚀 MiloDocs ${env.version || 'unknown'} - ${environment.toUpperCase()}`);
        console.log('🌍 Environment:', environment);
        console.log('⚡ Production Mode:', isProduction);
        console.log('🐛 Debug Mode:', debug);
        console.log('📍 Base URL:', env.baseURL);
        console.log('⏰ Build Time:', new Date(parseInt(env.buildTime)));
        console.groupEnd();
    } else if (!isProduction) {
        console.log(`📱 Initializing MiloDocs UX enhancements (${environment})...`);
    }
    
    // Try new modular system first, fallback to legacy
    if (USE_NEW_SYSTEM) {
        try {
            console.log('🚀 Loading new modular system...');
            const { initializeMiloDocs } = await import('./main-new.js');
            await initializeMiloDocs();
            return; // Exit early if new system succeeds
        } catch (error) {
            console.warn('⚠️ New system failed, falling back to legacy:', error);
        }
    }
    
    // Initialize performance optimizations
    if (typeof initPerformanceOptimizations === 'function') {
        initPerformanceOptimizations();
    }
    
    // Initialize SVG icon system
    initializeSVGIcons();
    
    // Add scroll-based enhancements
    initializeScrollEnhancements();
    
    // Initialize tooltips and micro-interactions
    initializeMicroInteractions();
    
    // Environment-specific features
    initializeEnvironmentFeatures(environment, debug);
    
    // Copy code functionality is handled by article-clipboard.js
    
    if (!isProduction) {
        console.log('✅ MiloDocs UX enhancements ready');
    }
});

function initializeSVGIcons() {
    const svgIcons = document.querySelectorAll('.svg-icon');
    console.log('🎨 Found', svgIcons.length, 'SVG icons');
    
    // Add hover effects to interactive SVG icons
    svgIcons.forEach(icon => {
        if (icon.closest('button, a')) {
            icon.classList.add('transition-transform', 'duration-200');
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.1)';
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1)';
            });
        }
    });
}

function initializeScrollEnhancements() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateScrollEffects() {
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
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

function initializeMicroInteractions() {
    // Add ripple effect to buttons and interactive elements
    const clickableElements = document.querySelectorAll(`
        button, .btn, .topbar__button,
        .nav-link, .breadcrumb__link, .toc-link,
        .quicklinks__link, .quicklinks__item,
        .tile, .card, .resource-card,
        .topbar__logo-link, .dropdown-link,
        .sidebar-item__link, .expand-toggle
    `);
    
    clickableElements.forEach(element => {
        element.addEventListener('click', createRippleEffect);
    });
    
    // Enhanced hover states for cards and interactive elements
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
    
    // Add loading states to forms
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
}

function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Copy code functionality is handled by article-clipboard.js
// This avoids duplicate copy buttons and conflicting event handlers

// Environment-specific feature initialization
function initializeEnvironmentFeatures(environment, debug) {
    // Add environment-specific CSS class
    document.body.classList.add(`env-${environment}`);
    
    // Environment-specific optimizations
    switch(environment) {
        case 'nvidia':
            initializeNvidiaFeatures();
            break;
        case 'open-source':
            initializeOpenSourceFeatures();
            break;
        case 'enterprise':
            initializeEnterpriseFeatures();
            break;
        default:
            initializeDefaultFeatures();
    }
    
    // Debug-specific features
    if (debug) {
        initializeDebugFeatures();
    }
}

// NVIDIA-specific features
function initializeNvidiaFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#76b900');
    
    if (window.HugoEnvironment?.isProduction) {
        console.log('🎯 NVIDIA features initialized');
    }
}

// Open Source-specific features  
function initializeOpenSourceFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#ff6b6b');
    initializeCommunityFeatures();
}

// Enterprise-specific features
function initializeEnterpriseFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#6366f1');
    initializeComplianceFeatures();
}

// Default features
function initializeDefaultFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#3b82f6');
}

// Debug-specific features
function initializeDebugFeatures() {
    window.hugoDebug = {
        environment: window.HugoEnvironment,
        performance: {
            getMetrics: () => performance.getEntriesByType('navigation')[0],
            getResources: () => performance.getEntriesByType('resource')
        },
        theme: {
            version: window.HugoEnvironment?.version,
            features: ['debug-panel', 'template-inspector', 'performance-monitor']
        }
    };
    
    // Debug keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey) {
            switch(e.key) {
                case 'P': // Performance metrics
                    console.table(window.hugoDebug.performance.getMetrics());
                    break;
                case 'R': // Resource timing
                    console.table(window.hugoDebug.performance.getResources());
                    break;
                case 'E': // Environment info
                    console.table(window.HugoEnvironment);
                    break;
            }
        }
    });
}

// Community features for open source
function initializeCommunityFeatures() {
    if (typeof window !== 'undefined') {
        window.communityFeatures = {
            githubIntegration: true,
            contributionGuide: true,
            issueTracking: true
        };
    }
}

// Enterprise compliance features
function initializeComplianceFeatures() {
    if (typeof window !== 'undefined') {
        window.enterpriseFeatures = {
            complianceTracking: true,
            auditLogging: window.HugoEnvironment?.isProduction,
            securityHeaders: true
        };
    }
}

