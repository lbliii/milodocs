/**
 * Article Header Component
 * 
 * Manages the article header with breadcrumbs and collapsible metadata.
 * Provides progressive disclosure for article metadata through an expandable panel.
 */

class ArticleHeader {
  constructor() {
    this.container = null;
    this.toggleBtn = null;
    this.metadataPanel = null;
    this.isExpanded = false;
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.container = document.querySelector('[data-component="article-header"]');
    
    if (!this.container) {
      return; // No article header on this page
    }

    this.toggleBtn = this.container.querySelector('[data-metadata-toggle]');
    this.metadataPanel = this.container.querySelector('[data-metadata-panel]');

    if (!this.toggleBtn || !this.metadataPanel) {
      return; // Missing required elements
    }

    this.bindEvents();
    this.initializeState();
  }

  bindEvents() {
    // Primary toggle interaction
    this.toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Keyboard support
    this.toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Close on escape key when expanded
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded && !this.isAnimating) {
        this.collapse();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.isExpanded) {
        this.adjustPanelHeight();
      }
    });
  }

  initializeState() {
    // Check if there's a stored preference
    const stored = localStorage.getItem('article-metadata-expanded');
    const shouldExpand = stored === 'true';
    
    if (shouldExpand) {
      // Expand without animation on page load
      this.expand(false);
    } else {
      // Ensure collapsed state
      this.collapse(false);
    }
  }

  toggle() {
    if (this.isAnimating) {
      return;
    }

    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand(animate = true) {
    if (this.isExpanded || this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.isExpanded = true;

    // Update ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.metadataPanel.setAttribute('aria-hidden', 'false');

    // Update button text for screen readers
    const buttonText = this.toggleBtn.querySelector('.article-header__toggle-text');
    if (buttonText) {
      buttonText.textContent = 'Hide Article Info';
    }

    if (animate) {
      // Add animation class
      this.container.classList.add('expanding');
      
      // Allow panel to expand
      this.metadataPanel.style.maxHeight = this.metadataPanel.scrollHeight + 'px';
      
      // Clean up after animation
      setTimeout(() => {
        this.container.classList.remove('expanding');
        this.metadataPanel.style.maxHeight = '200px'; // Match CSS max-height limit
        this.isAnimating = false;
      }, 400);
    } else {
      // Immediate expand
      this.metadataPanel.style.maxHeight = '200px'; // Match CSS max-height limit
      this.isAnimating = false;
    }

    // Store preference
    localStorage.setItem('article-metadata-expanded', 'true');

    // Dispatch custom event for other components
    this.container.dispatchEvent(new CustomEvent('article-header:metadata-expanded', {
      detail: { component: this }
    }));
  }

  collapse(animate = true) {
    if (!this.isExpanded || this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.isExpanded = false;

    // Update ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.metadataPanel.setAttribute('aria-hidden', 'true');

    // Update button text for screen readers
    const buttonText = this.toggleBtn.querySelector('.article-header__toggle-text');
    if (buttonText) {
      buttonText.textContent = 'Article Info';
    }

    if (animate) {
      // Add animation class
      this.container.classList.add('collapsing');
      
      // Get current height and then collapse
      const currentHeight = this.metadataPanel.scrollHeight;
      this.metadataPanel.style.maxHeight = currentHeight + 'px';
      
      // Force reflow
      this.metadataPanel.offsetHeight;
      
      // Collapse to 0
      this.metadataPanel.style.maxHeight = '0';
      
      // Clean up after animation
      setTimeout(() => {
        this.container.classList.remove('collapsing');
        this.isAnimating = false;
      }, 400);
    } else {
      // Immediate collapse
      this.metadataPanel.style.maxHeight = '0';
      this.isAnimating = false;
    }

    // Store preference
    localStorage.setItem('article-metadata-expanded', 'false');

    // Dispatch custom event for other components
    this.container.dispatchEvent(new CustomEvent('article-header:metadata-collapsed', {
      detail: { component: this }
    }));
  }

  adjustPanelHeight() {
    if (this.isExpanded && !this.isAnimating) {
      this.metadataPanel.style.maxHeight = 'none';
      const newHeight = this.metadataPanel.scrollHeight;
      this.metadataPanel.style.maxHeight = newHeight + 'px';
    }
  }

  // Public API methods
  getState() {
    return {
      isExpanded: this.isExpanded,
      isAnimating: this.isAnimating
    };
  }

  destroy() {
    // Clean up event listeners
    if (this.toggleBtn) {
      this.toggleBtn.removeEventListener('click', this.toggle);
      this.toggleBtn.removeEventListener('keydown', this.toggle);
    }
    
    // Reset state
    this.isExpanded = false;
    this.isAnimating = false;
    
    // Clear storage
    localStorage.removeItem('article-metadata-expanded');
  }
}

// Initialize when the script loads
const articleHeader = new ArticleHeader();

// Export for external use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArticleHeader;
}

// Make available globally for debugging
window.ArticleHeader = articleHeader;