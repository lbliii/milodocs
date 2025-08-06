/**
 * Chat API Module
 * Handles all API interactions and response processing
 */

import { showLoading, hideLoading, handleError } from '../../utils/index.js';

export class ChatAPI {
  constructor(chatManager, config = {}) {
    this.chat = chatManager;
    this.chatEndpoint = config.chatEndpoint || 'https://chat-2-lc4762co7a-uc.a.run.app/';
    this.requestTimeout = config.requestTimeout || 30000;
  }

  /**
   * Fetch answer from AI endpoint
   */
  async fetchAnswer(question) {
    const loadingBubble = this.chat.bubbles.createLoadingBubble();
    this.chat.bubbles.addChatBubble(loadingBubble, 'bot');
    
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
      const botBubble = this.chat.bubbles.createChatBubble(answer, 'bot');
      this.chat.bubbles.addChatBubble(botBubble, 'bot');
      await this.chat.bubbles.animateTyping(botBubble);
      
      // Announce to screen readers
      this.announceToScreenReader(`AI response: ${answer.substring(0, 100)}...`);
      
      // Emit success event
      this.chat.emit('chat:responseReceived', { question, answer });
      
    } catch (error) {
      // Clean up loading bubble
      const loaderId = loadingBubble.getAttribute('data-loader-id');
      if (loaderId) {
        hideLoading(loaderId);
      }
      loadingBubble.remove();
      
      // Handle different error types
      await this.handleFetchError(error, question);
      
      // Emit error event
      this.chat.emit('chat:error', { question, error: error.message });
    }
  }

  /**
   * Handle fetch errors with user-friendly messages
   */
  async handleFetchError(error, question) {
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Server error. Please try again in a moment.';
    } else if (error.message.includes('404')) {
      errorMessage = 'Chat service temporarily unavailable. Please try again later.';
    }
    
    // Create error bubble
    const errorBubble = this.chat.bubbles.createChatBubble(errorMessage, 'bot', 'error');
    this.chat.bubbles.addChatBubble(errorBubble, 'bot');
    
    // Log detailed error for debugging
    console.error('Chat API Error:', {
      question,
      error: error.message,
      stack: error.stack,
      endpoint: this.chatEndpoint
    });
    
    // Use global error handler if available
    if (typeof handleError === 'function') {
      handleError(error, 'Chat API');
    }
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(this.chatEndpoint, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Chat API connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Update API configuration
   */
  updateConfig(config) {
    if (config.chatEndpoint) {
      this.chatEndpoint = config.chatEndpoint;
    }
    if (config.requestTimeout) {
      this.requestTimeout = config.requestTimeout;
    }
  }
}