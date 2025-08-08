/**
 * Article Table of Contents Component
 * Handles TOC highlighting based on scroll position and reading progress
 */

import { Component } from '../../core/Component.js';
import { throttle } from '../../utils/dom.js';

export class ArticleTOC extends Component {
  constructor(config = {}) {
    super({
      name: 'article-toc',
      selector: config.selector || '#TableOfContents',
      ...config
    });
    
    this.tocLinks = [];
    this.sections = [];
    this.scrollOffset = config.scrollOffset || 50;
    this.progressBar = null;
    this.progressText = null;
    this.throttledHighlighter = null;
    this.throttledProgressUpdater = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('ArticleTOC: No table of contents found');
      return;
    }

    this.tocLinks = Array.from(this.element.querySelectorAll('a'));
    this.sections = Array.from(document.querySelectorAll('h2, h3'));
    
    if (this.tocLinks.length === 0 || this.sections.length === 0) {
      console.warn('ArticleTOC: No TOC links or sections found');
      return;
    }

    // Initialize reading progress if elements exist
    this.initializeReadingProgress();
    
    // Create throttled scroll handlers for better performance
    this.throttledHighlighter = throttle(() => this.highlightInView(), 16);
    this.throttledProgressUpdater = throttle(() => this.updateProgress(), 16);
    
    // Setup scroll listeners
    this.setupScrollListeners();
    
    // Initial highlight
    this.highlightInView();
  }

  /**
   * Highlight the TOC link for the currently viewed section
   */
  highlightInView() {
    this.sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      
      // Check if section is in viewport with offset
      if (
        rect.top + this.scrollOffset >= 0 &&
        rect.bottom <= window.innerHeight + this.scrollOffset
      ) {
        const sectionId = section.id;
        if (!sectionId) return;
        
        // Find corresponding TOC link
        const activeLink = this.tocLinks.find(link => 
          link.getAttribute('href') === `#${sectionId}`
        );
        
        if (activeLink) {
          // Remove highlight from all links
          this.tocLinks.forEach(link => {
            link.classList.remove('text-brand', 'toc-active');
          });
          
          // Add highlight to active link
          activeLink.classList.add('text-brand', 'toc-active');
          
          // Emit event for other components
          this.emit('toc:sectionChanged', {
            sectionId,
            element: section,
            link: activeLink
          });
        }
      }
    });
  }

  /**
   * Initialize reading progress functionality
   */
  initializeReadingProgress() {
    this.progressBar = document.getElementById('progress-bar');
    this.progressText = document.getElementById('progress-text');
    
    if (this.progressBar && this.progressText) {
      // Initialize sequence
      this.updateComponentState('initializing-progress');
      
      // Start hidden for smooth reveal
      this.progressBar.style.opacity = '0';
      this.progressBar.style.transition = 'all var(--timing-medium) var(--easing-emphasized)';
      this.progressText.style.opacity = '0';
      this.progressText.style.transition = 'all var(--timing-medium) var(--easing-emphasized)';
      
      // Initialize after DOM is ready
      requestAnimationFrame(() => {
        this.updateProgress(); // Initial calculation
        
        // Smooth reveal after calculation with staggered timing
        setTimeout(() => {
          this.progressBar.style.opacity = '1';
          setTimeout(() => {
            this.progressText.style.opacity = '1';
            this.updateComponentState('progress-active');
          }, 100);
        }, 150);
      });
      
      
    }
  }

  /**
   * Update reading progress bar
   */
  updateProgress() {
    if (!this.progressBar || !this.progressText) return;
    
    const article = document.querySelector('#articleContent') || 
                   document.querySelector('.article-content') ||
                   document.querySelector('main');
    
    if (!article) return;
    
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // 🚀 NEW: Enhanced progress calculation with better accuracy
    const progress = Math.min(100, Math.max(0, 
      ((scrollTop + windowHeight - articleTop) / articleHeight) * 100
    ));
    
    // 🚀 NEW: Smooth progress updates with visual feedback
    const currentWidth = parseFloat(this.progressBar.style.width) || 0;
    const difference = Math.abs(progress - currentWidth);
    
    // Add updating class for smooth transitions during significant changes
    if (difference > 2) {
      this.progressBar.classList.add('updating');
      setTimeout(() => {
        this.progressBar.classList.remove('updating');
      }, 200);
    }
    
    // Update progress bar with enhanced timing
    this.progressBar.style.width = `${progress}%`;
    this.progressText.textContent = `${Math.round(progress)}%`;
    
    // 🚀 NEW: Update component state based on progress
    if (progress < 10) {
      this.setCSSProperty('--progress-stage', 'start');
    } else if (progress > 90) {
      this.setCSSProperty('--progress-stage', 'end');
    } else {
      this.setCSSProperty('--progress-stage', 'middle');
    }
    
    // Emit progress event
    this.emit('toc:progressChanged', { progress });
  }

  /**
   * Setup scroll event listeners using modern AbortController pattern
   */
  setupScrollListeners() {
    this.addEventListener(window, 'scroll', this.throttledHighlighter, { passive: true });
    
    if (this.progressBar && this.progressText) {
      this.addEventListener(window, 'scroll', this.throttledProgressUpdater, { passive: true });
    }
  }

  /**
   * Smooth scroll to section
   */
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -this.scrollOffset;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      this.emit('toc:scrollToSection', { sectionId, element: section });
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // Event listeners automatically cleaned up by AbortController in base Component
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-toc', ArticleTOC);