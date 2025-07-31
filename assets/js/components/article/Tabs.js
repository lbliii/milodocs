/**
 * Article Tabs Component
 * Handles tab switching with button state management and content visibility
 */

import { Component } from '../../core/ComponentManager.js';

export class ArticleTabs extends Component {
  constructor(config = {}) {
    super({
      name: 'article-tabs',
      selector: config.selector || '[data-component="tabs"]',
      ...config
    });
    
    this.tabContainers = [];
  }

  async onInit() {
    this.tabContainers = Array.from(document.querySelectorAll('[data-component="tabs"]'));
    
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
    
    // Show/hide content based on matching identifier
    let visibleContent = null;
    optionContent.forEach(content => {
      const contentValue = content.getAttribute('data-tabcontent');
      
      if (contentValue === convertedText) {
        content.classList.remove('hidden');
        content.setAttribute('aria-hidden', 'false');
        visibleContent = content;
      } else {
        content.classList.add('hidden');
        content.setAttribute('aria-hidden', 'true');
      }
    });
    
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
   * Component cleanup
   */
  onDestroy() {
    console.log('ArticleTabs: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-tabs', ArticleTabs);