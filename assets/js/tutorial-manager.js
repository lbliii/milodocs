/**
 * Tutorial Progress Manager - Enhanced tutorial system with modern UX patterns
 * Handles progress tracking, step validation, code copying, and interactive elements
 */

class TutorialProgressManager {
    constructor() {
        this.tutorialId = this.getCurrentTutorialId();
        this.currentStep = this.getCurrentStep();
        this.totalSteps = this.getTotalSteps();
        this.progressData = {};
        this.init();
    }
    
    init() {
        console.log('🎓 Initializing TutorialProgressManager');
        this.loadProgress();
        this.setupEventListeners();
        this.updateProgressDisplay();
        this.initializeCodeBlocks();
        this.initializeCollapsibleSections();
        this.initializeStepValidation();
        this.setupAutoSave();
    }
    
    getCurrentTutorialId() {
        const progressElement = document.querySelector('[data-tutorial-id]');
        return progressElement ? progressElement.dataset.tutorialId : null;
    }
    
    getCurrentStep() {
        const progressElement = document.querySelector('[data-current-step]');
        return progressElement ? parseInt(progressElement.dataset.currentStep) : 0;
    }
    
    getTotalSteps() {
        const progressElement = document.querySelector('[data-total-steps]');
        return progressElement ? parseInt(progressElement.dataset.totalSteps) : 0;
    }
    
    // ==========================================================================
    // Progress Management
    // ==========================================================================
    
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
        
        localStorage.setItem(`tutorial-${this.tutorialId}`, JSON.stringify(progress));
        this.progressData = progress;
        
        // Show notification
        this.showNotification('Progress saved successfully!', 'success');
        
        // Update save button visual feedback
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
    }
    
    loadProgress() {
        if (!this.tutorialId) return;
        
        const saved = localStorage.getItem(`tutorial-${this.tutorialId}`);
        if (saved) {
            try {
                this.progressData = JSON.parse(saved);
                this.updateUIFromProgress(this.progressData);
                console.log('📚 Loaded tutorial progress:', this.progressData);
            } catch (error) {
                console.error('Error loading tutorial progress:', error);
            }
        }
    }
    
    updateUIFromProgress(progress) {
        // Restore checked items
        if (progress.checkedItems) {
            progress.checkedItems.forEach(item => {
                const checkbox = document.querySelector(`[data-checklist-item="${item}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        // Update validation state
        this.validateStep();
    }
    
    getCompletedSteps() {
        // In a real implementation, this would track which steps are actually completed
        // For now, we'll consider all steps before current as completed
        const completed = [];
        for (let i = 0; i < this.currentStep; i++) {
            completed.push(i);
        }
        return completed;
    }
    
    getCheckedItems() {
        const checkedItems = [];
        document.querySelectorAll('.validation-checkbox:checked').forEach(checkbox => {
            const item = checkbox.dataset.checklistItem;
            if (item) {
                checkedItems.push(item);
            }
        });
        return checkedItems;
    }
    
    updateProgressDisplay() {
        const progressPercentage = this.totalSteps > 0 ? Math.round((this.currentStep / this.totalSteps) * 100) : 0;
        
        // Update progress line
        const progressLine = document.querySelector('.progress-line');
        if (progressLine) {
            progressLine.style.setProperty('--progress-width', `${progressPercentage}%`);
        }
        
        // Update mini progress bars
        document.querySelectorAll('.progress-bar-mini__fill').forEach(fill => {
            const progress = fill.closest('[data-step]')?.dataset.step === this.currentStep.toString() ? 100 : 0;
            fill.style.width = `${progress}%`;
        });
    }
    
    // ==========================================================================
    // Event Listeners
    // ==========================================================================
    
    setupEventListeners() {
        // Save progress button
        document.querySelectorAll('[data-action="save-progress"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProgress();
            });
        });
        
        // Complete step button
        document.querySelectorAll('[data-action="complete-step"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.completeStep();
            });
        });
        
        // Bookmark tutorial buttons
        document.querySelectorAll('.bookmark-tutorial').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleBookmark(btn);
            });
        });
        
        // Tutorial step navigation
        document.querySelectorAll('.tutorial-step:not(.disabled)').forEach(step => {
            step.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    const stepIndex = parseInt(step.dataset.step);
                    this.navigateToStep(stepIndex);
                }
            });
        });
        
        // Validation checkbox changes
        document.querySelectorAll('.validation-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.validateStep();
                this.saveProgress(); // Auto-save on validation changes
            });
        });
        
        // Toggle expanded progress view
        document.querySelectorAll('[data-action="toggle-progress"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleExpandedProgress(btn);
            });
        });
    }
    
    setupAutoSave() {
        // Auto-save every 30 seconds if there are changes
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.saveProgress();
            }
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }
    
    hasUnsavedChanges() {
        const currentCheckedItems = this.getCheckedItems();
        const savedCheckedItems = this.progressData.checkedItems || [];
        
        return JSON.stringify(currentCheckedItems.sort()) !== JSON.stringify(savedCheckedItems.sort());
    }
    
    // ==========================================================================
    // Step Validation
    // ==========================================================================
    
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
                setTimeout(() => continueBtn.classList.remove('pulse-gentle'), 3000);
            }
        }
        
        // Update checklist completion feedback
        const completedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        
        if (totalCount > 0) {
            const progressText = document.querySelector('.validation-progress-text');
            if (progressText) {
                progressText.textContent = `${completedCount}/${totalCount} completed`;
            }
        }
    }
    
    completeStep() {
        // Mark current step as completed
        this.progressData.completedSteps = this.progressData.completedSteps || [];
        if (!this.progressData.completedSteps.includes(this.currentStep)) {
            this.progressData.completedSteps.push(this.currentStep);
        }
        
        this.saveProgress();
        
        // Show completion animation
        this.showStepCompletionAnimation();
        
        // Navigate to next step or tutorial overview
        setTimeout(() => {
            const nextStepBtn = document.querySelector('.btn--primary[href*="/"]');
            if (nextStepBtn && nextStepBtn.textContent.includes('Next:')) {
                window.location.href = nextStepBtn.href;
            } else {
                // Show completion modal or navigate to overview
                this.showTutorialCompletionModal();
            }
        }, 2000);
    }
    
    showStepCompletionAnimation() {
        // Create celebration animation
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
        }, 3000);
    }
    
    // ==========================================================================
    // Code Block Enhancement
    // ==========================================================================
    
    initializeCodeBlocks() {
        // Code blocks are now enhanced via render-codeblock.html
        // Just add event listeners to existing copy buttons
        document.querySelectorAll('.copy-code').forEach(button => {
            button.addEventListener('click', (e) => this.copyCode(e));
        });
    }
    
    detectLanguage(codeBlock) {
        const className = codeBlock.className;
        const match = className.match(/language-(\w+)/);
        return match ? match[1] : 'text';
    }
    
    generateCodeId() {
        return 'code-' + Math.random().toString(36).substr(2, 9);
    }
    
    async copyCode(event) {
        const button = event.currentTarget;
        const targetId = button.dataset.clipboardTarget;
        const codeElement = document.querySelector(targetId);
        
        if (!codeElement) return;
        
        try {
            // Get the code content - handle both direct code elements and nested pre/code
            const codeText = codeElement.querySelector('code')?.textContent || codeElement.textContent;
            await navigator.clipboard.writeText(codeText);
            
            // Visual feedback
            button.classList.add('copied');
            const copyIcon = button.querySelector('.copy-icon');
            const checkIcon = button.querySelector('.check-icon');
            const copyText = button.querySelector('.copy-text');
            
            if (copyIcon) copyIcon.classList.add('hidden');
            if (checkIcon) checkIcon.classList.remove('hidden');
            if (copyText) copyText.textContent = 'Copied!';
            
            // Create ripple effect
            this.createRipple(button, event);
            
            // Reset after delay
            setTimeout(() => {
                button.classList.remove('copied');
                if (copyIcon) copyIcon.classList.remove('hidden');
                if (checkIcon) checkIcon.classList.add('hidden');
                if (copyText) copyText.textContent = 'Copy';
            }, 2000);
            
            // Track copy action
            this.trackUserAction('code_copied', { language: this.detectLanguage(codeElement) });
            
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.showNotification('Failed to copy code', 'error');
        }
    }
    
    // ==========================================================================
    // Collapsible Sections
    // ==========================================================================
    
    initializeCollapsibleSections() {
        document.querySelectorAll('.tutorial-section').forEach(section => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            
            if (header && content) {
                header.addEventListener('click', () => {
                    this.toggleSection(header, content);
                });
            }
        });
    }
    
    toggleSection(header, content) {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Update aria-expanded
        header.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle content visibility with animation
        if (isExpanded) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.offsetHeight; // Force reflow
            content.style.maxHeight = '0';
            content.addEventListener('transitionend', () => {
                content.hidden = true;
                content.classList.remove('expanded');
            }, { once: true });
        } else {
            content.hidden = false;
            content.classList.add('expanded');
            content.style.maxHeight = '0';
            content.offsetHeight; // Force reflow
            content.style.maxHeight = content.scrollHeight + 'px';
            content.addEventListener('transitionend', () => {
                content.style.maxHeight = 'none';
            }, { once: true });
        }
        
        // Rotate chevron
        const chevron = header.querySelector('.section-chevron');
        if (chevron) {
            chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
    
    // ==========================================================================
    // Bookmark System
    // ==========================================================================
    
    toggleBookmark(button) {
        const tutorialId = button.dataset.tutorialId;
        const bookmarks = JSON.parse(localStorage.getItem('tutorial-bookmarks') || '[]');
        
        const isBookmarked = bookmarks.includes(tutorialId);
        
        if (isBookmarked) {
            const index = bookmarks.indexOf(tutorialId);
            bookmarks.splice(index, 1);
            button.classList.remove('bookmarked');
            this.showNotification('Bookmark removed', 'info');
        } else {
            bookmarks.push(tutorialId);
            button.classList.add('bookmarked');
            this.showNotification('Tutorial bookmarked!', 'success');
        }
        
        localStorage.setItem('tutorial-bookmarks', JSON.stringify(bookmarks));
        
        // Update button icon
        const icon = button.querySelector('.bookmark-icon');
        if (icon) {
            icon.style.fill = isBookmarked ? 'none' : 'currentColor';
        }
    }
    
    // ==========================================================================
    // Navigation & Utility Functions
    // ==========================================================================
    
    navigateToStep(stepIndex) {
        // In a real implementation, this would navigate to the specific step
        console.log(`Navigating to step ${stepIndex + 1}`);
    }
    
    showTutorialCompletionModal() {
        // Show completion celebration
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-4 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tutorial Completed!</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6">Congratulations! You've successfully completed this tutorial.</p>
                <div class="space-y-3">
                    <button class="btn btn--primary w-full" onclick="this.closest('.fixed').remove()">
                        Continue Learning
                    </button>
                    <a href="/tutorials" class="btn btn--secondary w-full">
                        Browse More Tutorials
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 10000);
    }
    
    createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    toggleExpandedProgress(button) {
        const expanded = document.querySelector('.tutorial-progress-expanded');
        if (!expanded) return;
        
        const isHidden = expanded.hasAttribute('hidden');
        
        if (isHidden) {
            expanded.removeAttribute('hidden');
            button.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
            `;
            button.title = 'Hide Full Progress';
        } else {
            expanded.setAttribute('hidden', '');
            button.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            `;
            button.title = 'Show Full Progress';
        }
    }
    
    showNotification(message, type = 'info') {
        if (window.MiloUX && window.MiloUX.showNotification) {
            window.MiloUX.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    trackUserAction(action, data = {}) {
        // Analytics integration would go here
        console.log('Tutorial action:', action, data);
    }
}

// ==========================================================================
// Initialization
// ==========================================================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a tutorial page
    if (document.querySelector('[data-component="tutorial-progress-enhanced"]') || 
        document.querySelector('.tutorial-overview') ||
        document.querySelector('.tutorial-step-content')) {
        
        console.log('🎓 Tutorial page detected, initializing enhanced features...');
        new TutorialProgressManager();
    }
});

// Enhanced scroll behavior for tutorial pages
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to anchors in tutorial content
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
    
    // Add intersection observer for step tracking
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Track time spent on sections
                    const sectionId = entry.target.id;
                    if (sectionId) {
                        console.log('Section in view:', sectionId);
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
                observer.observe(section);
            }
        });
    }
});

// Export for external use
window.TutorialProgressManager = TutorialProgressManager;