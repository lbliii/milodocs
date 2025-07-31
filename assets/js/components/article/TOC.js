/**
 * Article Table of Contents Component
 * Handles TOC highlighting based on scroll position and reading progress
 */

import { Component } from '../../core/ComponentManager.js';
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
    
    console.log(`ArticleTOC: Initialized with ${this.tocLinks.length} links and ${this.sections.length} sections`);
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
      this.updateProgress(); // Initial call
      console.log('ArticleTOC: Reading progress initialized');
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
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, 
      ((scrollTop + windowHeight - articleTop) / articleHeight) * 100
    ));
    
    // Update progress bar
    this.progressBar.style.width = `${progress}%`;
    this.progressText.textContent = `${Math.round(progress)}%`;
    
    // Emit progress event
    this.emit('toc:progressChanged', { progress });
  }

  /**
   * Setup scroll event listeners
   */
  setupScrollListeners() {
    window.addEventListener('scroll', this.throttledHighlighter, { passive: true });
    
    if (this.progressBar && this.progressText) {
      window.addEventListener('scroll', this.throttledProgressUpdater, { passive: true });
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
    if (this.throttledHighlighter) {
      window.removeEventListener('scroll', this.throttledHighlighter);
    }
    if (this.throttledProgressUpdater) {
      window.removeEventListener('scroll', this.throttledProgressUpdater);
    }
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-toc', ArticleTOC);