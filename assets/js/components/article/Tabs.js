/**
 * Article Tabs Component
 * Handles tab switching with button state management and content visibility
 */

import { Component } from '../../core/Component.js';

export class ArticleTabs extends Component {
  constructor(config = {}) {
    super({
      name: 'article-tabs',
      selector: config.selector || '[data-component="tabs"], [data-component="article-tabs"]',
      ...config
    });
    
    this.tabContainers = [];
  }

  async onInit() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }
    
    this.tabContainers = Array.from(document.querySelectorAll('[data-component="tabs"], [data-component="article-tabs"]'));
    
    if (this.tabContainers.length === 0) {
      console.warn('ArticleTabs: No tab containers found');
      return;
    }

    this.initializeAllTabs();
    
    console.log(`ArticleTabs: Initialized ${this.tabContainers.length} tab containers`);
  }

  /**
   * Initialize all tab containers
   */
  initializeAllTabs() {
    this.tabContainers.forEach(tabContainer => {
      this.initializeTabContainer(tabContainer);
    });
  }

  /**
   * Initialize a single tab container
   */
  initializeTabContainer(tabContainer) {
    const options = tabContainer.querySelectorAll('[data-tab-id]');
    const optionContent = tabContainer.querySelectorAll('[data-tabcontent]');
    
    if (options.length === 0) {
      console.warn('ArticleTabs: No tab options found in container');
      return;
    }

    // Ensure at least one tab is active
    this.ensureActiveTab(tabContainer);
    
    // Setup event listeners for all buttons
    this.setupTabEventListeners(tabContainer, options);
    
    // Initial content update
    this.updateContent(tabContainer, optionContent);
    
    this.emit('tabs:containerInitialized', { 
      container: tabContainer, 
      optionsCount: options.length,
      contentCount: optionContent.length 
    });
  }

  /**
   * Ensure at least one tab is active initially
   */
  ensureActiveTab(tabContainer) {
    const activeButtons = tabContainer.querySelectorAll('button.bg-brand');
    
    if (activeButtons.length === 0) {
      const firstButton = tabContainer.querySelector('button[data-tab-option]');
      if (firstButton) {
        this.activateButton(firstButton);
        this.emit('tabs:defaultTabActivated', { button: firstButton });
      }
    }
  }

  /**
   * Setup event listeners for tab buttons
   */
  setupTabEventListeners(tabContainer, options) {
    options.forEach(option => {
      const buttons = option.querySelectorAll('button');
      
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          this.handleButtonClick(e, tabContainer);
        });
        
        // Add keyboard support
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleButtonClick(e, tabContainer);
          }
        });
      });
    });
  }

  /**
   * Handle button click events
   */
  handleButtonClick(e, tabContainer) {
    const clickedButton = e.target;
    const parentOption = clickedButton.closest('[data-tab-id]');
    
    if (!parentOption) return;
    
    // Get all buttons in the same option group
    const siblingButtons = parentOption.querySelectorAll('button');
    
    // Deactivate all sibling buttons
    siblingButtons.forEach(button => {
      if (button !== clickedButton) {
        this.deactivateButton(button);
      }
    });
    
    // Activate clicked button
    this.activateButton(clickedButton);
    
    // Update content visibility
    const optionContent = tabContainer.querySelectorAll('[data-tabcontent]');
    this.updateContent(tabContainer, optionContent);
    
    this.emit('tabs:buttonClicked', { 
      button: clickedButton, 
      container: tabContainer,
      option: clickedButton.getAttribute('data-tab-option')
    });
  }

  /**
   * Activate a button (make it selected)
   */
  activateButton(button) {
    button.classList.remove('bg-white', 'text-black');
    button.classList.add('bg-brand', 'text-white');
    button.setAttribute('aria-selected', 'true');
  }

  /**
   * Deactivate a button (make it unselected)
   */
  deactivateButton(button) {
    button.classList.remove('bg-brand', 'text-white');
    button.classList.add('bg-white', 'text-black');
    button.setAttribute('aria-selected', 'false');
  }

  /**
   * Update content visibility based on active buttons
   */
  updateContent(tabContainer, optionContent) {
    // Get all active buttons
    const activeButtons = tabContainer.querySelectorAll('button.bg-brand');
    
    // Get active button options
    const activeButtonOptions = [];
    activeButtons.forEach(button => {
      const tabOption = button.getAttribute('data-tab-option');
      if (tabOption) {
        activeButtonOptions.push(tabOption);
      }
    });
    
    // Convert to content identifier
    const convertedText = activeButtonOptions.join('/').toLowerCase();
    
    // Find content to show and hide
    let visibleContent = null;
    const contentToHide = [];
    const contentToShow = [];
    
    optionContent.forEach(content => {
      const contentValue = content.getAttribute('data-tabcontent');
      const isCurrentlyVisible = !content.classList.contains('hidden');
      
      if (contentValue === convertedText) {
        visibleContent = content;
        if (!isCurrentlyVisible) {
          contentToShow.push(content);
        }
      } else {
        if (isCurrentlyVisible) {
          contentToHide.push(content);
        }
      }
    });
    
    // Smooth crossfade: hide old content first, then show new
    if (contentToHide.length > 0 && contentToShow.length > 0) {
      // Hide current content
      contentToHide.forEach(content => {
        this.hideContent(content);
        content.setAttribute('aria-hidden', 'true');
      });
      
      // Show new content after a brief delay for crossfade effect
      setTimeout(() => {
        contentToShow.forEach(content => {
          this.showContent(content);
          content.setAttribute('aria-hidden', 'false');
        });
      }, 100);
    } else {
      // Simple show/hide for initial load or when no crossfade needed
      contentToHide.forEach(content => {
        this.hideContent(content);
        content.setAttribute('aria-hidden', 'true');
      });
      
      contentToShow.forEach(content => {
        this.showContent(content);
        content.setAttribute('aria-hidden', 'false');
      });
    }
    
    this.emit('tabs:contentUpdated', { 
      container: tabContainer,
      activeOptions: activeButtonOptions,
      visibleContent,
      contentIdentifier: convertedText
    });
  }

  /**
   * Get active tabs for a specific container
   */
  getActiveTabs(tabContainer) {
    const activeButtons = tabContainer.querySelectorAll('button.bg-brand');
    return Array.from(activeButtons).map(button => ({
      button,
      option: button.getAttribute('data-tab-option'),
      tabId: button.closest('[data-tab-id]')?.getAttribute('data-tab-id')
    }));
  }

  /**
   * Programmatically activate a tab option
   */
  activateTabOption(tabContainer, tabOption) {
    const button = tabContainer.querySelector(`button[data-tab-option="${tabOption}"]`);
    if (button) {
      button.click();
      return true;
    }
    return false;
  }

  /**
   * Reset all tabs in a container to default state
   */
  resetTabContainer(tabContainer) {
    // Deactivate all buttons
    const allButtons = tabContainer.querySelectorAll('button[data-tab-option]');
    allButtons.forEach(button => this.deactivateButton(button));
    
    // Hide all content
    const allContent = tabContainer.querySelectorAll('[data-tabcontent]');
    allContent.forEach(content => {
      content.classList.add('hidden');
      content.setAttribute('aria-hidden', 'true');
    });
    
    // Activate first tab
    this.ensureActiveTab(tabContainer);
    
    // Update content
    this.updateContent(tabContainer, allContent);
    
    this.emit('tabs:containerReset', { container: tabContainer });
  }

  /**
   * Show content with smooth crossfade transition
   */
  showContent(element) {
    // Remove hidden class and prepare for transition
    element.classList.remove('hidden');
    element.style.opacity = '0';
    element.style.transform = 'translateY(8px) scale(0.98)';
    element.style.filter = 'blur(1px)';
    element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Force reflow to ensure initial state is applied
    element.offsetHeight;
    
    // Animate to visible state
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) scale(1)';
      element.style.filter = 'blur(0px)';
    });
  }

  /**
   * Hide content with smooth fade out
   */
  hideContent(element) {
    element.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.6, 1)';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-4px) scale(1.02)';
    element.style.filter = 'blur(0.5px)';
    
    setTimeout(() => {
      element.classList.add('hidden');
      // Clean up styles
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('filter');
      element.style.removeProperty('transition');
    }, 250);
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('ArticleTabs: Component destroyed');
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-tabs', ArticleTabs);