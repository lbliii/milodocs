console.log('🚀 MiloDocs theme loaded - optimized for stellar UX');

// Enhanced initialization system
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing MiloDocs UX enhancements...');
    
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
    
    // Copy code functionality is handled by article-clipboard.js
    
    console.log('✅ MiloDocs UX enhancements ready');
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
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Enhanced hover states for cards and links
    const interactiveElements = document.querySelectorAll('.tile, .card, .nav-link');
    interactiveElements.forEach(element => {
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

