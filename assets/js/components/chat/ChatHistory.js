/**
 * Chat History Module
 * Handles chat persistence, loading, and conversation management
 */

import { localStorage } from '../../utils/index.js';

export class ChatHistory {
  constructor(chatManager) {
    this.chat = chatManager;
    this.storageKey = 'chatHistory';
  }

  /**
   * Load chat history from localStorage
   */
  async loadChatHistory() {
    const chatHistory = localStorage.get(this.storageKey, []);
    this.chat.chatMessages.innerHTML = '';

    if (!chatHistory || chatHistory.length === 0) {
      // Add initial Q&A if no history exists
      this.addInitialQAPair(
        'How do I use this chat?',
        'Ask a question about the documentation. You can also toggle between chat and table of contents view using the navigation controls.'
      );
    } else {
      // Load existing chat history
      for (const pair of chatHistory) {
        if (pair.user && pair.bot) {
          const userBubble = this.chat.bubbles.createChatBubble(pair.user, 'user');
          this.chat.bubbles.addChatBubble(userBubble, 'user');
          const botBubble = this.chat.bubbles.createChatBubble(pair.bot, 'bot');
          this.chat.bubbles.addChatBubble(botBubble, 'bot');
        }
      }
    }

    // Scroll to bottom after loading
    this.scrollToBottom();
  }

  /**
   * Save chat history to localStorage
   */
  saveChatHistory() {
    try {
      const chatMessages = Array.from(this.chat.chatMessages.children);
      const chatHistory = chatMessages.map((pair) => {
        const bubbles = Array.from(pair.children);
        if (bubbles.length >= 2) {
          return { 
            user: bubbles[0].innerText,
            bot: bubbles[1].innerText,
            timestamp: Date.now()
          };
        }
        return null;
      }).filter(Boolean); // Remove null entries
      
      localStorage.set(this.storageKey, chatHistory);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  /**
   * Clear entire conversation
   */
  clearConversation() {
    this.chat.chatMessages.innerHTML = '';
    this.saveChatHistory();
    this.chat.emit('chat:conversationCleared');
    
    // Add initial guidance after clearing
    setTimeout(() => {
      this.addInitialQAPair(
        'How do I use this chat?',
        'Ask a question about the documentation. You can also toggle between chat and table of contents view using the navigation controls.'
      );
    }, 100);
  }

  /**
   * Add initial Q&A pair to show users how to use the chat
   */
  addInitialQAPair(question, answer) {
    const userBubble = this.chat.bubbles.createChatBubble(question, 'user');
    this.chat.bubbles.addChatBubble(userBubble, 'user');
    const botBubble = this.chat.bubbles.createChatBubble(answer, 'bot');
    this.chat.bubbles.addChatBubble(botBubble, 'bot');
  }

  /**
   * Export chat history as text
   */
  exportHistory() {
    const chatHistory = localStorage.get(this.storageKey, []);
    let exportText = `Chat History Export - ${new Date().toLocaleString()}\n`;
    exportText += '='.repeat(50) + '\n\n';
    
    chatHistory.forEach((pair, index) => {
      exportText += `Conversation ${index + 1}:\n`;
      exportText += `User: ${pair.user}\n`;
      exportText += `Assistant: ${pair.bot}\n`;
      if (pair.timestamp) {
        exportText += `Time: ${new Date(pair.timestamp).toLocaleString()}\n`;
      }
      exportText += '\n' + '-'.repeat(30) + '\n\n';
    });
    
    return exportText;
  }

  /**
   * Clear old history entries (keep only recent ones)
   */
  pruneHistory(maxEntries = 50) {
    const chatHistory = localStorage.get(this.storageKey, []);
    if (chatHistory.length > maxEntries) {
      const prunedHistory = chatHistory.slice(-maxEntries);
      localStorage.set(this.storageKey, prunedHistory);
    }
  }

  /**
   * Get conversation count
   */
  getConversationCount() {
    const chatHistory = localStorage.get(this.storageKey, []);
    return chatHistory.length;
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
   * Check if chat has any conversations
   */
  hasConversations() {
    const chatHistory = localStorage.get(this.storageKey, []);
    return chatHistory.length > 0;
  }

  /**
   * Get the last conversation
   */
  getLastConversation() {
    const chatHistory = localStorage.get(this.storageKey, []);
    return chatHistory[chatHistory.length - 1] || null;
  }
}