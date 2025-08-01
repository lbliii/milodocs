/**
 * Article Chat Component
 * Interactive AI chat functionality with history persistence and accessibility
 */

import { Component } from '../../core/ComponentManager.js';
import { localStorage, showLoading, hideLoading, handleError } from '../../utils/index.js';

export class ArticleChat extends Component {
  constructor(config = {}) {
    super({
      name: 'article-chat',
      selector: config.selector || '#chatContainer',
      ...config
    });
    
    this.chatEndpoint = config.chatEndpoint || 'https://chat-2-lc4762co7a-uc.a.run.app/';
    this.requestTimeout = config.requestTimeout || 30000;
    this.typingSpeed = config.typingSpeed || 20;
    
    // Element references
    this.form = null;
    this.questionInput = null;
    this.chatMessages = null;
    this.clearAllButton = null;
    this.productFilter = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('ArticleChat: Chat container not found');
      return;
    }

    // Cache DOM references
    this.cacheElements();
    
    if (!this.form || !this.questionInput || !this.chatMessages) {
      console.warn('ArticleChat: Required elements not found');
      return;
    }

    // Setup event listeners
    this.setupEventListeners();
    
    // Load chat history
    await this.loadChatHistory();
    
    console.log('ArticleChat: Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.form = document.getElementById('chat-form');
    this.questionInput = document.getElementById('question');
    this.chatMessages = document.getElementById('chat-messages');
    this.clearAllButton = document.getElementById('clearAll');
    this.productFilter = this.element.getAttribute('data-productFilter');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    if (this.clearAllButton) {
      this.clearAllButton.addEventListener('click', () => this.clearConversation());
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    const questionText = this.questionInput.value.trim();
    if (!questionText) return;
    
    // Clear input and add user message
    this.questionInput.value = '';
    const userBubble = this.createChatBubble(questionText, 'user');
    this.addChatBubble(userBubble, 'user');
    
    // Fetch AI response
    await this.fetchAnswer(questionText);
    
    // Emit event for analytics/tracking
    this.emit('chat:questionSubmitted', { question: questionText });
  }

  /**
   * Fetch answer from AI endpoint
   */
  async fetchAnswer(question) {
    const loadingBubble = this.createLoadingBubble();
    this.addChatBubble(loadingBubble, 'bot');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
      
      const response = await fetch(
        `${this.chatEndpoint}?query=${encodeURIComponent(question)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || 'Sorry, I could not fetch the answer.';
      
      // Clean up loading bubble
      const loaderId = loadingBubble.getAttribute('data-loader-id');
      if (loaderId) {
        hideLoading(loaderId);
      }
      loadingBubble.remove();
      
      // Add response with typing animation
      const botBubble = this.createChatBubble(answer, 'bot');
      this.addChatBubble(botBubble, 'bot');
      await this.animateTyping(botBubble);
      
      // Announce to screen readers
      this.announceToScreenReader(`AI response: ${answer.substring(0, 100)}...`);
      
      // Emit success event
      this.emit('chat:responseReceived', { question, answer });
      
    } catch (error) {
      // Clean up loading bubble
      const loaderId = loadingBubble.getAttribute('data-loader-id');
      if (loaderId) {
        hideLoading(loaderId);
      }
      loadingBubble.remove();
      
      // Use unified error handling
      const errorResult = await handleError(error, {
        context: 'chat-ai-request',
        recoverable: true,
        onRetry: () => this.fetchAnswer(question),
        maxRetries: 2,
        metadata: { question, endpoint: this.chatEndpoint },
        announce: false // We'll handle announcement via chat bubble
      });
      
      // Show error in chat interface
      const errorBubble = this.createChatBubble(errorResult.message, 'bot', 'error');
      this.addChatBubble(errorBubble, 'bot');
      
      // Add retry functionality
      this.addRetryButton(question);
      
      // Emit error event with standardized error
      this.emit('chat:error', { error: errorResult, question });
    }
  }

  /**
   * Create loading bubble using unified LoadingStateManager
   */
  createLoadingBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot p-2 rounded-lg text-black font-regular text-sm';
    
    // Use LoadingStateManager for consistent loading display
    const loaderId = showLoading(bubble, {
      type: 'dots',
      message: 'Thinking...',
      size: 'small',
      variant: 'minimal'
    });
    
    // Store loader ID for cleanup
    bubble.setAttribute('data-loader-id', loaderId);
    return bubble;
  }

  /**
   * Animate typing effect for messages
   */
  async animateTyping(bubble) {
    return new Promise((resolve) => {
      const text = bubble.innerText;
      bubble.innerText = '';
      let i = 0;
      
      const typeInterval = setInterval(() => {
        bubble.innerText += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(typeInterval);
          resolve();
        }
      }, this.typingSpeed);
    });
  }

  /**
   * Add retry button for failed requests
   */
  addRetryButton(question) {
    const retryContainer = document.createElement('div');
    retryContainer.className = 'flex justify-center my-2';
    
    const retryButton = document.createElement('button');
    retryButton.className = 'px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-1 transition duration-300';
    retryButton.innerText = 'Retry';
    retryButton.addEventListener('click', () => {
      retryContainer.remove();
      this.fetchAnswer(question);
    });
    
    retryContainer.appendChild(retryButton);
    this.chatMessages.appendChild(retryContainer);
  }

  /**
   * Format chat text for better readability
   */
  formatChatText(text, sender) {
    if (sender === 'bot') {
      // Add spaces after periods and commas if followed by an uppercase letter
      let formatted = text.replace(/\.([A-Z])/g, '. $1');
      formatted = formatted.replace(/,([A-Z])/g, ', $1');
      // Replace multiple newlines with paragraph tags
      formatted = formatted.split('\n\n').map(p => `<p>${p}</p>`).join('');
      return formatted;
    }
    return text; // User text doesn't need special formatting
  }

  /**
   * Create a chat bubble element
   */
  createChatBubble(text, sender, type = 'normal') {
    const bubble = document.createElement('div');
    let baseClasses = `chat-bubble ${sender}`;
    
    // Add appropriate styling based on type and sender
    if (type === 'error') {
      baseClasses += ' chat-bubble--error';
    } else if (sender === 'user') {
      baseClasses += ' chat-bubble--user';
    } else {
      baseClasses += ' chat-bubble--bot';
    }
    
    bubble.className = baseClasses;
    
    // Format the text properly for AI responses
    const formattedText = this.formatChatText(text, sender);
    bubble.innerHTML = formattedText;
    
    // Add accessibility attributes
    bubble.setAttribute('role', sender === 'bot' ? 'log' : 'status');
    bubble.setAttribute('aria-live', 'polite');
    
    return bubble;
  }

  /**
   * Add chat bubble to the conversation
   */
  addChatBubble(bubble, sender) {
    let pair = this.chatMessages.lastElementChild;
    if (!pair || !pair.classList.contains('chat-pair') || sender === 'user') {
      pair = document.createElement('div');
      pair.className = 'chat-pair group relative';
      this.chatMessages.appendChild(pair);
    }
    pair.appendChild(bubble);
    
    this.handleAnimationsAndCleanup(bubble, sender, pair);
    this.saveChatHistory();
  }

  /**
   * Handle animations and cleanup for chat bubbles
   */
  handleAnimationsAndCleanup(bubble, sender, pair) {
    if (sender === 'user') {
      bubble.classList.add('animate-pulse');
    } else {
      const userBubble = pair.querySelector('.user');
      userBubble?.classList.remove('animate-pulse');
      this.appendDeleteButton(pair);
    }
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  /**
   * Add delete button to conversation pair
   */
  appendDeleteButton(pair) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'chat-delete';
    deleteButton.innerHTML = '×';
    deleteButton.title = 'Delete this conversation';
    deleteButton.addEventListener('click', () => {
      // Add fade-out animation before removing
      pair.style.opacity = '0';
      pair.style.transform = 'translateX(20px)';
      setTimeout(() => {
        if (pair.parentNode === this.chatMessages) {
          this.chatMessages.removeChild(pair);
          this.saveChatHistory();
        }
      }, 200);
    });

    pair.appendChild(deleteButton);
  }

  /**
   * Clear entire conversation
   */
  clearConversation() {
    this.chatMessages.innerHTML = '';
    this.saveChatHistory();
    this.emit('chat:conversationCleared');
  }

  /**
   * Save chat history to localStorage
   */
  saveChatHistory() {
    const chatMessages = Array.from(this.chatMessages.children);
    const chatHistory = chatMessages.map((pair) => {
      const bubbles = Array.from(pair.children);
      const texts = bubbles.map((bubble) => bubble.innerText);
      return { user: texts[0], bot: texts[1] };
    });
    localStorage.set('chatHistory', chatHistory);
  }

  /**
   * Load chat history from localStorage
   */
  async loadChatHistory() {
    const chatHistory = localStorage.get('chatHistory', []);
    this.chatMessages.innerHTML = '';

    if (!chatHistory || chatHistory.length === 0) {
      // Add initial Q&A if no history exists
      this.addInitialQAPair(
        'How do I use this chat?',
        'Ask a question about the MiloDocs Hugo Theme. You can also toggle the Robot icon in the navigation bar to switch to a Table of Contents view.'
      );
    } else {
      // Load existing chat history
      for (const pair of chatHistory) {
        const userBubble = this.createChatBubble(pair.user, 'user');
        this.addChatBubble(userBubble, 'user');
        const botBubble = this.createChatBubble(pair.bot, 'bot');
        this.addChatBubble(botBubble, 'bot');
      }
    }
  }

  /**
   * Add initial Q&A pair to show users how to use the chat
   */
  addInitialQAPair(question, answer) {
    const userBubble = this.createChatBubble(question, 'user');
    this.addChatBubble(userBubble, 'user');
    const botBubble = this.createChatBubble(answer, 'bot');
    this.addChatBubble(botBubble, 'bot');
  }

  /**
   * Announce messages to screen readers
   */
  announceToScreenReader(message) {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    // No ongoing processes to clean up in this component
    console.log('ArticleChat: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('article-chat', ArticleChat);