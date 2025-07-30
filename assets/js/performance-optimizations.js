// Performance and UX optimizations for MiloDocs
document.addEventListener('DOMContentLoaded', function() {
    initPerformanceOptimizations();
});

function initPerformanceOptimizations() {
    // Lazy load heavy features
    setupLazyLoading();
    
    // Enhanced loading states
    setupLoadingStates();
    
    // Performance monitoring
    setupPerformanceMonitoring();
    
    // Enhanced accessibility
    setupA11yEnhancements();
    
    // Mobile optimizations
    setupMobileOptimizations();
}

// Lazy loading for heavy features
function setupLazyLoading() {
    const lazyFeatures = {
        chat: () => import('./article-chat.js'),
        summarization: () => import('./article-summarization.js'),
        search: () => import('./layout-search.js')
    };

    // Intersection Observer for lazy loading content
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Lazy load images
                if (target.dataset.src) {
                    target.src = target.dataset.src;
                    target.removeAttribute('data-src');
                    observer.unobserve(target);
                }
                
                // Lazy load components
                if (target.dataset.lazyComponent) {
                    const component = target.dataset.lazyComponent;
                    if (lazyFeatures[component]) {
                        lazyFeatures[component]().then(() => {
                            target.classList.add('loaded');
                        });
                    }
                    observer.unobserve(target);
                }
            }
        });
    }, { 
        rootMargin: '100px',
        threshold: 0.1
    });

    // Observe lazy load candidates
    document.querySelectorAll('[data-src], [data-lazy-component]').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced loading states
function setupLoadingStates() {
    // Show skeleton while content loads
    const contentArea = document.getElementById('articleContent');
    if (contentArea && !contentArea.innerHTML.trim()) {
        showContentSkeleton(contentArea);
    }

    // Smooth page transitions
    setupPageTransitions();
}

function showContentSkeleton(container) {
    const skeleton = `
        <div class="content-skeleton space-y-4">
            <div class="h-8 bg-gray-200 rounded content-skeleton"></div>
            <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded content-skeleton"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6 content-skeleton"></div>
                <div class="h-4 bg-gray-200 rounded w-4/6 content-skeleton"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded w-3/4 content-skeleton"></div>
        </div>
    `;
    container.innerHTML = skeleton;
}

function setupPageTransitions() {
    // Add page transition classes on navigation
    const links = document.querySelectorAll('a[href^="/"], a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.href.includes('#')) return; // Skip hash links
            
            document.body.classList.add('page-transition-enter');
            setTimeout(() => {
                document.body.classList.remove('page-transition-enter');
                document.body.classList.add('page-transition-enter-active');
            }, 50);
        });
    });
}

// Performance monitoring
function setupPerformanceMonitoring() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({entryTypes: ['first-input']});
    }

    // Memory usage monitoring (development only)
    if (window.location.hostname === 'localhost' && 'memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            console.log('Memory usage:', {
                used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB'
            });
        }, 30000);
    }
}

// Enhanced accessibility
function setupA11yEnhancements() {
    // Keyboard navigation improvements
    setupKeyboardNavigation();
    
    // Focus management
    setupFocusManagement();
    
    // Screen reader optimizations
    setupScreenReaderOptimizations();
}

function setupKeyboardNavigation() {
    let currentFocusIndex = -1;
    const focusableElements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    document.addEventListener('keydown', (e) => {
        // Navigate with arrow keys in sidebar
        if (e.target.closest('#linkTree')) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                navigateSidebar(direction);
            }
        }

        // Quick navigation shortcuts
        if (e.altKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    document.getElementById('searchInput')?.focus();
                    break;
                case 'n':
                    e.preventDefault();
                    document.querySelector('.next-link')?.focus();
                    break;
                case 'p':
                    e.preventDefault();
                    document.querySelector('.prev-link')?.focus();
                    break;
            }
        }
    });
}

function navigateSidebar(direction) {
    const sidebarLinks = document.querySelectorAll('#linkTree a');
    const currentIndex = Array.from(sidebarLinks).indexOf(document.activeElement);
    const nextIndex = Math.max(0, Math.min(sidebarLinks.length - 1, currentIndex + direction));
    sidebarLinks[nextIndex]?.focus();
}

function setupFocusManagement() {
    // Focus trap for modals/overlays
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.modal:not(.hidden)');
            if (activeModal) {
                trapFocus(e, activeModal);
            }
        }
    });
}

function trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
}

function setupScreenReaderOptimizations() {
    // Announce dynamic content changes
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);

    window.announceToScreenReader = function(message) {
        announcer.textContent = message;
        setTimeout(() => announcer.textContent = '', 1000);
    };
}

// Mobile optimizations
function setupMobileOptimizations() {
    // Touch-friendly interactions
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Swipe gestures for navigation
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - go to previous page
                document.querySelector('.prev-link')?.click();
            } else {
                // Swipe left - go to next page
                document.querySelector('.next-link')?.click();
            }
        }
    });

    // Viewport height fix for mobile browsers
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
}

// Utility functions for enhanced UX
window.MiloUX = {
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button class="ml-4 text-lg" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    smoothScrollTo: function(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};