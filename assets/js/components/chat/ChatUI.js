/**
 * Chat UI Module
 * Handles all user interface interactions and state management
 */

import { animationBridge } from '../../core/AnimationBridge.js';

export class ChatUI {
  constructor(chatManager) {
    this.chat = chatManager;
    
    // UI Element references
    this.form = null;
    this.questionInput = null;
    this.sendButton = null;
    this.clearAllButton = null;
    this.expandButton = null;
  }

  /**
   * Cache UI element references
   */
  cacheElements() {
    this.form = document.getElementById('chat-form');
    this.questionInput = document.getElementById('question');
    this.sendButton = document.getElementById('sendButton');
    this.clearAllButton = document.getElementById('clearAll');
    this.expandButton = document.getElementById('expandChat');
  }

  /**
   * Setup all UI event listeners
   */
  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    if (this.clearAllButton) {
      this.clearAllButton.addEventListener('click', () => this.chat.history.clearConversation());
    }

    if (this.expandButton) {
      this.expandButton.addEventListener('click', () => this.toggleExpanded());
    }

    if (this.questionInput) {
      // Auto-resize textarea
      this.questionInput.addEventListener('input', () => this.handleTextareaInput());
      
      // Enable/disable send button based on content
      this.questionInput.addEventListener('input', () => this.toggleSendButton());
      
      // Handle Enter key for submit (Shift+Enter for new line)
      this.questionInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // Handle window resize for expanded state
    window.addEventListener('resize', () => this.handleWindowResize());
  }

  /**
   * Handle window resize events
   */
  handleWindowResize() {
    const container = this.chat.element;
    if (container.classList.contains('chat-expanded')) {
      // Re-calculate position on resize
      this.repositionExpanded();
    }
  }

  /**
   * Reposition expanded chat after window resize
   */
  repositionExpanded() {
    const container = this.chat.element;
    
    // Get current positioning that should stay fixed
    const currentRight = container.style.right;
    const currentTop = container.style.top;
    const rightEdgeFromViewport = parseInt(currentRight) || 20; // fallback
    
    // Calculate new width based on window size with updated responsive logic
    const maxViewportWidth = window.innerWidth * 0.6;
    const maxFixedWidth = 650;
    const expandedWidth = Math.min(maxViewportWidth, maxFixedWidth);
    
    // Ensure it doesn't go off the left side of screen  
    const minLeftMargin = 20;
    const maxWidth = window.innerWidth - rightEdgeFromViewport - minLeftMargin;
    const finalWidth = Math.min(expandedWidth, maxWidth);
    
    // Update width while preserving all positioning
    container.style.width = `${finalWidth}px`;
    container.style.maxWidth = `${finalWidth}px`;
    container.style.right = currentRight; // Maintain right anchor
    container.style.top = currentTop; // Maintain top position
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    const questionText = this.questionInput.value.trim();
    if (!questionText) return;
    
    // Clear input and reset height
    this.questionInput.value = '';
    this.questionInput.style.height = '42px';
    
    // Update send button state
    this.toggleSendButton();
    
    // Let the main chat manager handle the submission
    await this.chat.handleQuestionSubmit(questionText);
  }

  /**
   * Handle textarea input for auto-resize and button state
   */
  handleTextareaInput() {
    const textarea = this.questionInput;
    
    // Reset height to calculate new height
    textarea.style.height = '42px';
    
    // Calculate new height based on content
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // max-height from CSS
    
    if (scrollHeight > 42) {
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }

  /**
   * Toggle send button enabled/disabled state
   */
  toggleSendButton() {
    if (this.sendButton && this.questionInput) {
      const hasContent = this.questionInput.value.trim().length > 0;
      this.sendButton.disabled = !hasContent;
      
      if (hasContent) {
        this.sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.sendButton.classList.add('hover:bg-primary/50', 'dark:hover:bg-primary-dark/50');
      } else {
        this.sendButton.classList.add('opacity-50', 'cursor-not-allowed');
        this.sendButton.classList.remove('hover:bg-primary/50', 'dark:hover:bg-primary-dark/50');
      }
    }
  }

  /**
   * Handle keydown events for textarea
   */
  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSubmit(event);
    }
  }

  /**
   * Toggle expanded state of chat
   */
  toggleExpanded() {
    const container = this.chat.element;
    const isExpanded = container.classList.contains('chat-expanded');
    
    if (isExpanded) {
      // Collapse back to normal size with smooth transition
              // Use data attributes instead of classes
      
      // Add a slight delay to let the scale animation finish, then restore original positioning
      setTimeout(() => {
        container.style.width = '';
        container.style.maxWidth = '';
        container.style.right = '';
        container.style.top = '';
        container.style.position = '';
        container.style.zIndex = '';
      }, 150); // Half of transition time
      
    } else {
      // Expand leftward while keeping right edge anchored
              animationBridge.setCollapseState(container, 'expanded');
      
      // Get current positioning
      const rect = container.getBoundingClientRect();
      const rightEdgeFromViewport = window.innerWidth - rect.right;
      const currentTop = rect.top;
      
      // Calculate expanded width with better responsive logic
      const maxViewportWidth = window.innerWidth * 0.6; // Use 60% for better UX
      const maxFixedWidth = 650; // Slightly larger max
      const expandedWidth = Math.min(maxViewportWidth, maxFixedWidth);
      
      // Ensure it doesn't go off the left side of screen  
      const minLeftMargin = 20; // Slightly more margin
      const maxWidth = window.innerWidth - rightEdgeFromViewport - minLeftMargin;
      const finalWidth = Math.min(expandedWidth, maxWidth);
      
      // Apply smooth expansion with preserved positioning
      container.style.position = 'fixed';
      container.style.top = `${currentTop}px`; // Preserve original top position
      container.style.right = `${rightEdgeFromViewport}px`; // Keep right edge anchored
      container.style.width = `${finalWidth}px`;
      container.style.maxWidth = `${finalWidth}px`;
      container.style.zIndex = '60'; // Ensure it's above other elements
    }
    
    // Update expand button icon with smooth transition
    this.updateExpandButtonIcon(!isExpanded);
    
    // Emit event for other components to respond
    this.chat.emit('chat:toggleExpanded', { expanded: !isExpanded });
  }

  /**
   * Update expand button icon based on state
   */
  updateExpandButtonIcon(isExpanded) {
    if (!this.expandButton) return;
    
    const img = this.expandButton.querySelector('img');
    if (!img) return;
    
    // Add smooth scale transition during state change
    img.style.transform = 'scale(0.8)';
    
    // Update icon source after a brief moment for smooth transition
    setTimeout(() => {
      // Get the current path structure to preserve relative paths
      const currentSrc = img.getAttribute('src') || '';
      const pathPrefix = currentSrc.includes('icons/') 
        ? currentSrc.substring(0, currentSrc.lastIndexOf('icons/'))
        : './';
      
      if (isExpanded) {
        // Show collapse icon
        this.expandButton.setAttribute('aria-label', 'Collapse chat');
        img.src = pathPrefix + 'icons/light/collapse.svg';
        img.alt = 'Collapse';
      } else {
        // Show expand icon
        this.expandButton.setAttribute('aria-label', 'Expand chat');
        img.src = pathPrefix + 'icons/light/expand.svg';
        img.alt = 'Expand';
      }
      
      // Reset transform for the new icon
      img.style.transform = 'scale(1)';
    }, 100);
  }

  /**
   * Check if all required UI elements are present
   */
  validateElements() {
    return !!(this.form && this.questionInput && this.sendButton);
  }

  /**
   * Focus the input field
   */
  focusInput() {
    if (this.questionInput) {
      this.questionInput.focus();
    }
  }

  /**
   * Clear the input field and reset its state
   */
  clearInput() {
    if (this.questionInput) {
      this.questionInput.value = '';
      this.questionInput.style.height = '42px';
      this.toggleSendButton();
    }
  }
}