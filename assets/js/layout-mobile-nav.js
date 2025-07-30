// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const sidebarLeft = document.getElementById('sidebar-left');
    const closeMobileNav = document.getElementById('closeMobileNav');
    
    // Exit early if mobile nav elements don't exist
    if (!mobileNavToggle || !sidebarLeft) return;
    
    function openMobileNav() {
        sidebarLeft.classList.remove('-translate-x-full');
        mobileNavOverlay?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        closeMobileNav?.focus();
        
        // Announce to screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader('Navigation menu opened');
        }
    }
    
    function closeMobileNavMenu() {
        sidebarLeft.classList.add('-translate-x-full');
        mobileNavOverlay?.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        mobileNavToggle.focus();
        
        // Announce to screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader('Navigation menu closed');
        }
    }
    
    // Event listeners
    mobileNavToggle.addEventListener('click', openMobileNav);
    closeMobileNav?.addEventListener('click', closeMobileNavMenu);
    mobileNavOverlay?.addEventListener('click', closeMobileNavMenu);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sidebarLeft.classList.contains('-translate-x-full')) {
            e.preventDefault();
            closeMobileNavMenu();
        }
    });
    
    // Close on navigation (mobile only)
    const navLinks = sidebarLeft.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Use matchMedia for better performance than checking window.innerWidth
            if (window.matchMedia('(max-width: 767px)').matches) {
                // Small delay to allow navigation to complete
                setTimeout(closeMobileNavMenu, 100);
            }
        });
    });
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
        // Close mobile nav if it's open and we're now in landscape/desktop view
        setTimeout(() => {
            if (window.matchMedia('(min-width: 768px)').matches && 
                !sidebarLeft.classList.contains('-translate-x-full')) {
                closeMobileNavMenu();
            }
        }, 100);
    });
});