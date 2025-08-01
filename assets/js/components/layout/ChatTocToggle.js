/**
 * Chat TOC Toggle Component
 * Handles switching between chat and table of contents views
 */

import { Component } from '../../core/ComponentManager.js';
import { localStorage } from '../../utils/index.js';

export class ChatTocToggle extends Component {
  constructor(config = {}) {
    super({
      name: 'chat-toc-toggle',
      selector: config.selector || '#chatTocToggle',
      ...config
    });
    
    this.storageKey = 'chatTocSettings';
    this.defaultView = 'chat';
    
    // Read saved state immediately to prevent flicker
    this.initialState = localStorage.get(this.storageKey) || this.defaultView;
    
    this.elements = {
      container: null,
      chatButton: null,
      tocButton: null,
      chatContainer: null,
      tocContainer: null
    };
  }

  async onInit() {
    if (!this.element) {
      console.warn('ChatTocToggle: Toggle container not found');
      return;
    }

    if (!this.cacheElements()) {
      console.error('ChatTocToggle: Failed to cache required elements');
      return;
    }
    
    // Check if inline script already set the correct state
    const alreadyInitialized = this.element.classList.contains('initialized');
    
    if (!alreadyInitialized) {
      // Fallback: Set initial state if inline script didn't run
      this.setActiveMode(this.initialState, false);
      this.element.classList.add('initialized');
    } else {
      // Inline script already set the state, just sync our internal state
      const currentMode = this.getCurrentMode();
      console.log(`ChatTocToggle: Already initialized by inline script with mode: ${currentMode}`);
    }
    
    // Containers are optional - toggle will work without them
    if (!this.elements.chatContainer || !this.elements.tocContainer) {
      console.warn('ChatTocToggle: Chat/TOC containers not found, but toggle will work for state tracking');
    }

    this.setupEventListeners();
    
    console.log('ChatTocToggle: Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements.container = this.element;
    this.elements.chatButton = this.element.querySelector('[data-mode="chat"]');
    this.elements.tocButton = this.element.querySelector('[data-mode="toc"]');
    this.elements.chatContainer = document.getElementById('chatContainer');
    this.elements.tocContainer = document.getElementById('tocContainer');
    
    console.log('ChatTocToggle: Cached elements:', {
      container: !!this.elements.container,
      chatButton: !!this.elements.chatButton,
      tocButton: !!this.elements.tocButton,
      chatContainer: !!this.elements.chatContainer, 
      tocContainer: !!this.elements.tocContainer
    });
    
    // Verify we have both buttons
    if (!this.elements.chatButton || !this.elements.tocButton) {
      console.error('ChatTocToggle: Required toggle buttons not found!');
      console.log('Expected elements: [data-mode="chat"] and [data-mode="toc"]');
      console.log('Toggle container contents:', this.elements.container?.innerHTML);
      return false;
    }
    
    return true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Chat button click
    this.elements.chatButton.addEventListener('click', (e) => {
      console.log('ChatTocToggle: Chat button clicked');
      this.setActiveMode('chat');
    });

    // TOC button click
    this.elements.tocButton.addEventListener('click', (e) => {
      console.log('ChatTocToggle: TOC button clicked');
      this.setActiveMode('toc');
    });

    // Keyboard support for both buttons
    this.elements.chatButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('ChatTocToggle: Chat button keyboard activated');
        this.setActiveMode('chat');
      }
    });

    this.elements.tocButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('ChatTocToggle: TOC button keyboard activated');
        this.setActiveMode('toc');
      }
    });
    
    console.log('ChatTocToggle: Event listeners setup complete');
  }



  /**
   * Set active mode (chat or toc) and update visual state
   */
  setActiveMode(mode, shouldSave = true) {
    // Update button visual states
    this.elements.chatButton.classList.toggle('chat-toc-toggle__option--active', mode === 'chat');
    this.elements.tocButton.classList.toggle('chat-toc-toggle__option--active', mode === 'toc');
    
    // Update container visibility if they exist
    if (this.elements.chatContainer && this.elements.tocContainer) {
      if (mode === 'chat') {
        this.elements.chatContainer.classList.remove('hidden');
        this.elements.tocContainer.classList.add('hidden');
        this.elements.chatContainer.setAttribute('aria-hidden', 'false');
        this.elements.tocContainer.setAttribute('aria-hidden', 'true');
      } else {
        this.elements.chatContainer.classList.add('hidden');
        this.elements.tocContainer.classList.remove('hidden');
        this.elements.chatContainer.setAttribute('aria-hidden', 'true');
        this.elements.tocContainer.setAttribute('aria-hidden', 'false');
      }
    }
    
    // Save to localStorage if requested
    if (shouldSave) {
      localStorage.set(this.storageKey, mode);
    }
    
    // Emit change event
    this.emit('chatTocToggle:changed', { mode });
  }

  /**
   * Get current active mode
   */
  getCurrentMode() {
    if (this.elements.chatButton.classList.contains('chat-toc-toggle__option--active')) {
      return 'chat';
    } else if (this.elements.tocButton.classList.contains('chat-toc-toggle__option--active')) {
      return 'toc';
    }
    
    // Fallback to localStorage or default
    const savedSetting = localStorage.get(this.storageKey);
    return savedSetting || this.defaultView;
  }







  /**
   * Component cleanup
   */
  onDestroy() {
    console.log('ChatTocToggle: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('chat-toc-toggle', ChatTocToggle);

