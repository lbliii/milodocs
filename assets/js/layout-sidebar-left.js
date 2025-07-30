// Initialize immediately when script loads (before DOMContentLoaded for faster init)
function initSidebarWhenReady() {
    const sidebar = document.getElementById('linkTree');
    if (!sidebar) {
        // If sidebar not ready yet, wait a bit and try again
        requestAnimationFrame(initSidebarWhenReady);
        return;
    }
    
    const toggles = sidebar.querySelectorAll('.expand-toggle');
    const currentPath = window.location.pathname;

    /**
     * Toggle the display of nested content and rotate the SVG icon.
     * @param {HTMLElement} toggle - The toggle button element.
     * @param {boolean} expand - Whether to expand or collapse.
     */
    function toggleContent(toggle, expand) {
        const listItem = toggle.closest('li');
        const nestedContent = listItem.querySelector('.nested-content');
        const svg = toggle.querySelector('svg');

        if (nestedContent) {
            if (expand) {
                // Show content immediately for initialization, with animation if sidebar is initialized
                if (sidebar.classList.contains('initialized')) {
                    nestedContent.classList.add('expanding');
                    setTimeout(() => {
                        nestedContent.classList.remove('expanding');
                        nestedContent.classList.add('expanded');
                    }, 300);
                } else {
                    nestedContent.classList.add('expanded');
                }
                toggle.setAttribute('aria-expanded', 'true');
                svg.classList.add('rotate-90');
            } else {
                if (sidebar.classList.contains('initialized')) {
                    nestedContent.classList.add('collapsing');
                    setTimeout(() => {
                        nestedContent.classList.remove('collapsing', 'expanded');
                    }, 300);
                } else {
                    nestedContent.classList.remove('expanded');
                }
                toggle.setAttribute('aria-expanded', 'false');
                svg.classList.remove('rotate-90');
            }
        }
    }

    /**
     * Recursively expand all parent directories of the active link.
     * Also, if a parent section is active, expand its immediate children.
     * @param {HTMLElement} element - The active link element.
     */
    function expandParents(element) {
        let parentLi = element.closest('ul').closest('li');

        while (parentLi) {
            const toggle = parentLi.querySelector(':scope > div > .expand-toggle');
            if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
                toggleContent(toggle, true);

                // If the parent link is a section, expand its immediate children
                const parentLink = parentLi.querySelector('a[data-section="true"]');
                if (parentLink) {
                    const childToggles = parentLi.querySelectorAll(':scope > .nested-content .expand-toggle');
                    childToggles.forEach(childToggle => {
                        // Optionally, you can decide whether to auto-expand child toggles
                        // For this example, we'll keep them collapsed unless they are active
                        // toggleContent(childToggle, false);
                        // Uncomment the above line if you want to ensure children are collapsed
                    });
                }
            }
            parentLi = parentLi.closest('li').closest('ul').closest('li');
        }
    }

    /**
     * Initialize the sidebar by expanding necessary active paths only.
     */
    function initializeSidebar() {
        // Find the current active link first
        const currentLink = sidebar.querySelector(`a[data-current="true"]`);
        if (currentLink) {
            currentLink.classList.add('text-brand');

            // Expand all parent directories (no animation during init)
            expandParents(currentLink);

            // If any parent sections are active, expand their immediate children
            const activeSections = sidebar.querySelectorAll('a[data-section="true"].text-brand');
            activeSections.forEach(sectionLink => {
                const toggle = sectionLink.closest('li').querySelector('.expand-toggle');
                if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
                    toggleContent(toggle, true);
                }
            });
        }

        // Mark sidebar as initialized to enable animations
        sidebar.classList.add('initialized');

        // Smooth scroll to the active link after initialization
        if (currentLink) {
            setTimeout(() => {
                currentLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    /**
     * Setup click listeners for all toggle buttons.
     */
    function setupToggleListeners() {
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                toggleContent(this, !isExpanded);
            });
        });
    }

    // Initialize the sidebar and setup listeners
    initializeSidebar();
    setupToggleListeners();
}

// Start initialization as soon as script loads
initSidebarWhenReady();
