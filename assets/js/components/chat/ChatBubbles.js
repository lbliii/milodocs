/**
 * Chat Bubbles Module
 * Handles chat bubble creation, formatting, and animations
 */

import { showLoading, hideLoading } from '../../utils/index.js';

export class ChatBubbles {
  constructor(chatManager) {
    this.chat = chatManager;
    this.typingSpeed = chatManager.typingSpeed || 20;
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
   * Add chat bubble to the conversation
   */
  addChatBubble(bubble, sender) {
    let pair = this.chat.chatMessages.lastElementChild;
    if (!pair || !pair.classList.contains('chat-pair') || sender === 'user') {
      pair = document.createElement('div');
      pair.className = 'chat-pair group relative';
      this.chat.chatMessages.appendChild(pair);
    }
    pair.appendChild(bubble);
    
    this.handleAnimationsAndCleanup(bubble, sender, pair);
    this.chat.history.saveChatHistory();
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
    this.scrollToBottom();
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
        if (pair.parentNode === this.chat.chatMessages) {
          this.chat.chatMessages.removeChild(pair);
          this.chat.history.saveChatHistory();
        }
      }, 200);
    });

    pair.appendChild(deleteButton);
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
      
      // Handle code blocks (basic markdown-style)
      formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      formatted = formatted.replace(/`([^`]*)`/g, '<code>$1</code>');
      
      return formatted;
    }
    return this.escapeHtml(text); // User text should be escaped
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
      this.chat.api.fetchAnswer(question);
    });
    
    retryContainer.appendChild(retryButton);
    this.chat.chatMessages.appendChild(retryContainer);
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.chat.chatMessages) {
      this.chat.chatMessages.scrollTop = this.chat.chatMessages.scrollHeight;
    }
  }

  /**
   * Remove all bubbles
   */
  clearAllBubbles() {
    if (this.chat.chatMessages) {
      this.chat.chatMessages.innerHTML = '';
    }
  }

  /**
   * Create a system message bubble
   */
  createSystemMessage(message, type = 'info') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble system chat-bubble--${type}`;
    bubble.innerHTML = `<em>${this.escapeHtml(message)}</em>`;
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    return bubble;
  }

  /**
   * Add a typing indicator
   */
  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span>Assistant is typing</span>';
    indicator.id = 'typing-indicator';
    
    const pair = document.createElement('div');
    pair.className = 'chat-pair';
    pair.appendChild(indicator);
    
    this.chat.chatMessages.appendChild(pair);
    this.scrollToBottom();
    
    return indicator;
  }

  /**
   * Remove typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator && indicator.parentNode) {
      indicator.parentNode.remove();
    }
  }

  /**
   * Update typing speed
   */
  setTypingSpeed(speed) {
    this.typingSpeed = speed;
  }
}