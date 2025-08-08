/**
 * Chat Manager - Main orchestrator for the chat system
 * Coordinates between UI, API, History, and Bubbles modules
 */

import { Component } from '../../core/Component.js';
import { ChatUI } from './ChatUI.js';
import { ChatAPI } from './ChatAPI.js';
import { ChatHistory } from './ChatHistory.js';
import { ChatBubbles } from './ChatBubbles.js';

export class ChatManager extends Component {
  constructor(config = {}) {
    super({
      name: 'article-chat',
      selector: config.selector || '#chatContainer',
      ...config
    });
    
    // Configuration
    this.chatEndpoint = config.chatEndpoint || 'https://chat-2-lc4762co7a-uc.a.run.app/';
    this.requestTimeout = config.requestTimeout || 30000;
    this.typingSpeed = config.typingSpeed || 20;
    
    // Core element references (will be cached by UI module)
    this.chatMessages = null;
    this.productFilter = null;
    
    // Initialize modules
    this.ui = new ChatUI(this);
    this.api = new ChatAPI(this, { 
      chatEndpoint: this.chatEndpoint, 
      requestTimeout: this.requestTimeout 
    });
    this.history = new ChatHistory(this);
    this.bubbles = new ChatBubbles(this);
  }

  /**
   * Initialize the chat component
   */
  async onInit() {
    if (!this.element) {
      console.warn('ChatManager: Chat container not found');
      return;
    }

    // Cache core DOM references
    this.cacheElements();
    
    if (!this.chatMessages) {
      console.warn('ChatManager: Chat messages container not found');
      return;
    }

    // Initialize UI module
    this.ui.cacheElements();
    
    if (!this.ui.validateElements()) {
      console.warn('ChatManager: Required UI elements not found');
      return;
    }

    // Setup event listeners through UI module
    this.ui.setupEventListeners();
    
    // Load chat history
    await this.history.loadChatHistory();

    // If there was a pending request from a previous page, show a system notice with retry
    try {
      const pending = (await import('../../utils/index.js')).localStorage.get('chat.pendingRequest', null);
      if (pending && pending.question) {
        const message = 'Previous response was interrupted. Would you like to retry?';
        const bubble = this.bubbles.createSystemMessage(message, 'info');
        this.bubbles.addChatBubble(bubble, 'bot');
        this.bubbles.addRetryButton(pending.question);
        // clear the marker so we do not duplicate on next load
        (await import('../../utils/index.js')).localStorage.remove('chat.pendingRequest');
      }
    } catch { /* no-op */ }
  }

  /**
   * Cache core DOM element references
   */
  cacheElements() {
    this.chatMessages = document.getElementById('chat-messages');
    this.productFilter = this.element.getAttribute('data-productFilter');
  }

  /**
   * Handle question submission from UI
   */
  async handleQuestionSubmit(questionText) {
    try {
      // Create and add user bubble
      const userBubble = this.bubbles.createChatBubble(questionText, 'user');
      this.bubbles.addChatBubble(userBubble, 'user');
      
      // Fetch AI response through API module
      await this.api.fetchAnswer(questionText);
      
      // Emit event for analytics/tracking
      this.emit('chat:questionSubmitted', { question: questionText });
      
    } catch (error) {
      console.error('ChatManager: Error handling question submission:', error);
      this.emit('chat:error', { question: questionText, error: error.message });
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    if (newConfig.chatEndpoint || newConfig.requestTimeout) {
      this.api.updateConfig(newConfig);
    }
    
    if (newConfig.typingSpeed) {
      this.typingSpeed = newConfig.typingSpeed;
      this.bubbles.setTypingSpeed(newConfig.typingSpeed);
    }
  }

  /**
   * Get chat statistics
   */
  getStats() {
    return {
      conversationCount: this.history.getConversationCount(),
      hasConversations: this.history.hasConversations(),
      lastConversation: this.history.getLastConversation(),
      isExpanded: this.element.classList.contains('chat-expanded')
    };
  }

  /**
   * Export chat data
   */
  exportData() {
    return {
      history: this.history.exportHistory(),
      stats: this.getStats(),
      config: {
        endpoint: this.chatEndpoint,
        timeout: this.requestTimeout,
        typingSpeed: this.typingSpeed
      }
    };
  }

  /**
   * Focus the chat input
   */
  focus() {
    this.ui.focusInput();
  }

  /**
   * Clear the chat input
   */
  clearInput() {
    this.ui.clearInput();
  }

  /**
   * Show the chat container
   */
  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
    }
  }

  /**
   * Hide the chat container
   */
  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
    }
  }

  /**
   * Toggle chat visibility
   */
  toggle() {
    if (this.element) {
      this.element.classList.toggle('hidden');
    }
  }

  /**
   * Check if chat is visible
   */
  isVisible() {
    return this.element && !this.element.classList.contains('hidden');
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    return await this.api.testConnection();
  }

  /**
   * Manually trigger a conversation save
   */
  saveConversation() {
    this.history.saveChatHistory();
  }

  /**
   * Get current conversation data
   */
  getCurrentConversation() {
    const messages = Array.from(this.chatMessages.children);
    return messages.map(pair => {
      const bubbles = Array.from(pair.children);
      return bubbles.map(bubble => ({
        text: bubble.innerText,
        sender: bubble.classList.contains('user') ? 'user' : 'bot',
        type: bubble.classList.contains('chat-bubble--error') ? 'error' : 'normal'
      }));
    }).flat();
  }

  /**
   * Add a system message
   */
  addSystemMessage(message, type = 'info') {
    const bubble = this.bubbles.createSystemMessage(message, type);
    const pair = document.createElement('div');
    pair.className = 'chat-pair';
    pair.appendChild(bubble);
    this.chatMessages.appendChild(pair);
    this.bubbles.scrollToBottom();
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // Save any pending chat history
    this.history.saveChatHistory();
    
    // Clean up any ongoing animations or timers
    // no-op
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('article-chat', ChatManager);