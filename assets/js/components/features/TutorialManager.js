/**
 * Tutorial Manager Component
 * Enhanced tutorial system with progress tracking, step validation, and interactive elements
 */

import { Component } from '../../core/Component.js';
import { animationBridge } from '../../core/AnimationBridge.js';
import { localStorage } from '../../utils/storage.js';
import { debounce } from '../../utils/dom.js';

export class TutorialManager extends Component {
  constructor(config = {}) {
    super({
      name: 'tutorial-manager',
      selector: config.selector || '[data-component="tutorial-progress-enhanced"], .tutorial-overview, .tutorial-step-content',
      ...config
    });
    
    this.tutorialId = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.progressData = {};
    this.autoSaveInterval = null;
    this.intersectionObserver = null;
  }

  async onInit() {
    if (!this.element) {
      console.warn('TutorialManager: No tutorial elements found');
      return;
    }

    // Initialize tutorial data
    this.tutorialId = this.getCurrentTutorialId();
    this.currentStep = this.getCurrentStep();
    this.totalSteps = this.getTotalSteps();
    
    if (!this.tutorialId) {
      console.warn('TutorialManager: No tutorial ID found');
      return;
    }

    // Initialize all tutorial features
    await this.initializeTutorial();
    
    console.log(`TutorialManager: Initialized for tutorial "${this.tutorialId}" (Step ${this.currentStep}/${this.totalSteps})`);
  }

  /**
   * Initialize all tutorial functionality
   */
  async initializeTutorial() {
    // Load saved progress first
    this.loadProgress();
    
    // Setup all tutorial features
    this.setupEventListeners();
    this.updateProgressDisplay();
    this.initializeCodeBlocks();
    this.initializeCollapsibleSections();
    this.initializeStepValidation();
    this.setupAutoSave();
    this.setupScrollTracking();
    this.setupSmoothScrolling();
  }

  /**
   * Get tutorial ID from DOM
   */
  getCurrentTutorialId() {
    const progressElement = document.querySelector('[data-tutorial-id]');
    return progressElement ? progressElement.dataset.tutorialId : null;
  }

  /**
   * Get current step from DOM
   */
  getCurrentStep() {
    const progressElement = document.querySelector('[data-current-step]');
    return progressElement ? parseInt(progressElement.dataset.currentStep) : 0;
  }

  /**
   * Get total steps from DOM
   */
  getTotalSteps() {
    const progressElement = document.querySelector('[data-total-steps]');
    return progressElement ? parseInt(progressElement.dataset.totalSteps) : 0;
  }

  /**
   * Setup event listeners for tutorial interactions
   */
  setupEventListeners() {
    // Save progress button
    const saveBtn = document.querySelector('[data-action="save-progress"]');
    if (saveBtn) {
      this.addEventListener(saveBtn, 'click', () => this.saveProgress());
    }

    // Reset progress button
    const resetBtn = document.querySelector('[data-action="reset-progress"]');
    if (resetBtn) {
      this.addEventListener(resetBtn, 'click', () => this.resetProgress());
    }

    // Step validation checkboxes
    document.querySelectorAll('.validation-checkbox').forEach(checkbox => {
      this.addEventListener(checkbox, 'change', () => this.validateStep());
    });

    // Step completion button
    const validateBtn = document.querySelector('.validate-step');
    if (validateBtn) {
      this.addEventListener(validateBtn, 'click', () => this.completeStep());
    }

    // Copy code buttons are now handled by ArticleClipboard component
    // No need for duplicate implementation here

    // Collapsible sections
    document.querySelectorAll('[data-toggle="collapse"]').forEach(trigger => {
      this.addEventListener(trigger, 'click', (e) => this.toggleCollapse(e));
    });
  }

  /**
   * Save tutorial progress to localStorage
   */
  saveProgress() {
    if (!this.tutorialId) return;
    
    const progress = {
      tutorialId: this.tutorialId,
      currentStep: this.currentStep,
      completedSteps: this.getCompletedSteps(),
      checkedItems: this.getCheckedItems(),
      timestamp: Date.now(),
      lastVisitedStep: this.currentStep
    };
    
    localStorage.set(`tutorial-${this.tutorialId}`, progress);
    this.progressData = progress;
    
    // Show save confirmation
    this.showSaveConfirmation();
    
    // Emit save event
    this.emit('tutorial:progressSaved', { tutorialId: this.tutorialId, progress });
  }

  /**
   * Load tutorial progress from localStorage
   */
  loadProgress() {
    if (!this.tutorialId) return;
    
    const saved = localStorage.get(`tutorial-${this.tutorialId}`);
    if (saved) {
      try {
        this.progressData = saved; // SafeStorage already handles JSON parsing
        this.updateUIFromProgress(this.progressData);
        this.emit('tutorial:progressLoaded', { tutorialId: this.tutorialId, progress: this.progressData });
        console.log('TutorialManager: Loaded progress', this.progressData);
      } catch (error) {
        console.error('TutorialManager: Error loading progress:', error);
      }
    }
  }

  /**
   * Reset tutorial progress
   */
  resetProgress() {
    if (!this.tutorialId) return;
    
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      localStorage.remove(`tutorial-${this.tutorialId}`);
      this.progressData = {};
      
      // Reset UI
      document.querySelectorAll('.validation-checkbox').forEach(cb => cb.checked = false);
      this.validateStep();
      this.updateProgressDisplay();
      
      this.emit('tutorial:progressReset', { tutorialId: this.tutorialId });
      this.showNotification('Tutorial progress has been reset', 'info');
    }
  }

  /**
   * Update UI from loaded progress data
   */
  updateUIFromProgress(progress) {
    // Restore checked items
    if (progress.checkedItems) {
      progress.checkedItems.forEach(item => {
        const checkbox = document.querySelector(`[data-checklist-item="${item}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
      this.validateStep();
    }
  }

  /**
   * Get currently completed steps
   */
  getCompletedSteps() {
    return this.progressData.completedSteps || [];
  }

  /**
   * Get currently checked items
   */
  getCheckedItems() {
    const checkboxes = document.querySelectorAll('[data-checklist-item]');
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.checklistItem);
  }

  /**
   * Update progress display
   */
  updateProgressDisplay() {
    const completedSteps = this.getCompletedSteps();
    const progressPercentage = this.totalSteps > 0 ? Math.round((completedSteps.length / this.totalSteps) * 100) : 0;
    
    // Update progress bar
    const progressBar = document.querySelector('.tutorial-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.tutorial-progress-text');
    if (progressText) {
      progressText.textContent = `${completedSteps.length}/${this.totalSteps} steps completed (${progressPercentage}%)`;
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    // Auto-save every 30 seconds if there are changes
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveProgress();
      }
    }, 30000);
    
    // Save on page unload
    this.addEventListener(window, 'beforeunload', () => {
      this.saveProgress();
    });
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges() {
    const currentCheckedItems = this.getCheckedItems();
    const savedCheckedItems = this.progressData.checkedItems || [];
    
    return JSON.stringify(currentCheckedItems.sort()) !== JSON.stringify(savedCheckedItems.sort());
  }

  /**
   * Initialize step validation
   */
  initializeStepValidation() {
    // Initial validation check
    this.validateStep();
  }

  /**
   * Validate current step requirements
   */
  validateStep() {
    const checkboxes = document.querySelectorAll('.validation-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const continueBtn = document.querySelector('.validate-step');
    
    if (continueBtn) {
      continueBtn.disabled = !allChecked;
      continueBtn.classList.toggle('btn--primary', allChecked);
      continueBtn.classList.toggle('btn--secondary', !allChecked);
      
      if (allChecked) {
        continueBtn.classList.add('pulse-gentle');
        // Use CSS timing tokens for animations
        const duration = animationBridge.getTiming('slow') * 6;
        setTimeout(() => continueBtn.classList.remove('pulse-gentle'), duration);
      }
    }
    
    // Update validation progress
    const completedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    if (totalCount > 0) {
      const progressText = document.querySelector('.validation-progress-text');
      if (progressText) {
        progressText.textContent = `${completedCount}/${totalCount} completed`;
      }
    }
    
    this.emit('tutorial:stepValidated', { 
      allChecked, 
      completedCount, 
      totalCount 
    });
  }

  /**
   * Complete current step
   */
  async completeStep() {
    // Mark current step as completed
    this.progressData.completedSteps = this.progressData.completedSteps || [];
    if (!this.progressData.completedSteps.includes(this.currentStep)) {
      this.progressData.completedSteps.push(this.currentStep);
    }
    
    this.saveProgress();
    this.updateProgressDisplay();
    
    // Show completion animation
    await this.showStepCompletionAnimation();
    
    this.emit('tutorial:stepCompleted', { 
      step: this.currentStep, 
      tutorialId: this.tutorialId 
    });
    
    // Navigate to next step
    setTimeout(() => {
      this.navigateToNextStep();
    }, 2000);
  }

  /**
   * Show step completion animation
   */
  async showStepCompletionAnimation() {
    return new Promise((resolve) => {
      const celebration = document.createElement('div');
      celebration.className = 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none';
      celebration.innerHTML = `
        <div class="bg-green-500 text-white p-6 rounded-lg shadow-lg transform scale-0 transition-transform duration-500">
          <div class="flex items-center">
            <svg class="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <h3 class="font-bold text-lg">Step Completed!</h3>
              <p class="text-green-100">Great job! Moving to the next step...</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(celebration);
      
      // Trigger animation
      setTimeout(() => {
        celebration.querySelector('div').classList.add('scale-100');
      }, 100);
      
      // Remove after animation
      setTimeout(() => {
        celebration.remove();
        resolve();
      }, 3000);
    });
  }

  /**
   * Navigate to next step or completion
   */
  navigateToNextStep() {
    const nextStepBtn = document.querySelector('.btn--primary[href*="/"]');
    if (nextStepBtn && nextStepBtn.textContent.includes('Next:')) {
      window.location.href = nextStepBtn.href;
    } else {
      this.showTutorialCompletionModal();
    }
  }

  /**
   * Show tutorial completion modal
   */
  showTutorialCompletionModal() {
    this.showNotification('Tutorial completed! 🎉', 'success', 5000);
    this.emit('tutorial:completed', { tutorialId: this.tutorialId });
  }

  /**
   * Initialize code block copy functionality
   * Note: Copy functionality is now handled by the ArticleClipboard component
   */
  initializeCodeBlocks() {
    // Listen for copy events from ArticleClipboard component
    this.addEventListener(document, 'copy-success', (event) => {
      this.emit('tutorial:codeCopied', { 
        codeText: event.detail.text.substring(0, 50) + '...' 
      });
    });
  }

  /**
   * Initialize collapsible sections
   */
  initializeCollapsibleSections() {
    document.querySelectorAll('[data-toggle="collapse"]').forEach(trigger => {
      const targetId = trigger.dataset.target;
      const target = document.querySelector(targetId);
      
      if (target) {
        // Set initial state
        const isCollapsed = trigger.classList.contains('collapsed');
        target.style.display = isCollapsed ? 'none' : 'block';
      }
    });
  }

  /**
   * Toggle collapsible section
   */
  toggleCollapse(event) {
    const trigger = event.currentTarget;
    const targetId = trigger.dataset.target;
    const target = document.querySelector(targetId);
    
    if (!target) return;
    
    const isCollapsed = trigger.classList.contains('collapsed');
    
    if (isCollapsed) {
      target.style.display = 'block';
      trigger.classList.remove('collapsed');
    } else {
      target.style.display = 'none';
      trigger.classList.add('collapsed');
    }
    
    this.emit('tutorial:sectionToggled', { targetId, isCollapsed: !isCollapsed });
  }

  /**
   * Setup scroll tracking with IntersectionObserver
   */
  setupScrollTracking() {
    if (!('IntersectionObserver' in window)) return;
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId) {
            this.emit('tutorial:sectionViewed', { sectionId });
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });
    
    // Observe main content sections
    document.querySelectorAll('h2, h3, .tutorial-section').forEach(section => {
      if (section.id) {
        this.intersectionObserver.observe(section);
      }
    });
  }

  /**
   * Setup smooth scrolling for tutorial anchors
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
              this.addEventListener(anchor, 'click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Show save confirmation feedback
   */
  showSaveConfirmation() {
    const saveBtn = document.querySelector('[data-action="save-progress"]');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = `
        <svg class="btn__icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Saved!
      `;
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
      }, 2000);
    }
    
    this.showNotification('Progress saved successfully!', 'success');
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info', duration = 3000) {
    if (window.MiloUX && window.MiloUX.showNotification) {
      window.MiloUX.showNotification(message, type, duration);
    } else {
      console.log(`Notification (${type}): ${message}`);
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    console.log('TutorialManager: Component destroyed and cleaned up');
  }
}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('tutorial-manager', TutorialManager);