/**
 * FormValidationMixin - Example mixin using MixinBase utilities
 * Provides standardized form validation functionality
 */

import { MixinUtilities, MixinPatterns, validateMixinInterface } from './MixinBase.js';

/**
 * Mixin that adds form validation functionality to components
 * This demonstrates the MixinBase pattern in action
 */
export const FormValidationMixin = {
  
  /**
   * Initialize form validation using MixinBase utilities
   */
  initFormValidation: MixinUtilities.createInitFunction(
    'FormValidationMixin',
    {
      formSelector: 'form',
      fieldSelector: 'input, select, textarea',
      errorClass: 'error',
      validClass: 'valid',
      showErrorMessages: true,
      validateOnBlur: true,
      validateOnSubmit: true
    },
    function setupFormValidation() {
      this.setupFormElements();
      this.setupFormEvents();
      this.setupFormAccessibility();
    }
  ),

  /**
   * Setup form elements using standardized element setup
   */
  setupFormElements: MixinUtilities.createElementSetup({
    form: 'form', // Single form element
    fields: ['input, select, textarea'], // Multiple field elements
    submitButton: 'button[type="submit"], input[type="submit"]',
    errorContainers: ['.error-message'] // Multiple error containers
  }),

  /**
   * Setup form events using standardized event setup
   */
  setupFormEvents: MixinUtilities.createEventSetup({
    form: {
      'submit': 'handleFormSubmit'
    },
    fields: {
      'blur': 'handleFieldBlur',
      'input': 'handleFieldInput'
    }
  }),

  /**
   * Setup accessibility attributes
   */
  setupFormAccessibility() {
    if (!this.fields) return;
    
    this.fields.forEach(field => {
      if (!field.hasAttribute('aria-invalid')) {
        field.setAttribute('aria-invalid', 'false');
      }
    });
  },

  /**
   * Handle form submission
   */
  handleFormSubmit(e) {
    if (this.formvalidationOptions.validateOnSubmit) {
      const isValid = this.validateAllFields();
      if (!isValid) {
        e.preventDefault();
        this.emit('form-validation-failed', { form: this.form });
        return;
      }
    }
    
    this.emit('form-submitted', { form: this.form });
  },

  /**
   * Handle field blur events
   */
  handleFieldBlur(e) {
    if (this.formvalidationOptions.validateOnBlur) {
      this.validateField(e.target);
    }
  },

  /**
   * Handle field input events
   */
  handleFieldInput(e) {
    // Clear errors on input
    this.clearFieldError(e.target);
  },

  /**
   * Validate all fields in the form
   */
  validateAllFields() {
    if (!this.fields) return true;
    
    let allValid = true;
    this.fields.forEach(field => {
      const isValid = this.validateField(field);
      if (!isValid) allValid = false;
    });
    
    return allValid;
  },

  /**
   * Validate a specific field
   */
  validateField(field) {
    const value = field.value.trim();
    const rules = this.getFieldValidationRules(field);
    
    for (const rule of rules) {
      if (!rule.test(value, field)) {
        this.showFieldError(field, rule.message);
        return false;
      }
    }
    
    this.showFieldValid(field);
    return true;
  },

  /**
   * Get validation rules for a field
   */
  getFieldValidationRules(field) {
    const rules = [];
    
    // Required field
    if (field.hasAttribute('required')) {
      rules.push({
        test: (value) => value.length > 0,
        message: 'This field is required'
      });
    }
    
    // Email validation
    if (field.type === 'email') {
      rules.push({
        test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
      });
    }
    
    // Min length
    if (field.hasAttribute('minlength')) {
      const minLength = parseInt(field.getAttribute('minlength'));
      rules.push({
        test: (value) => !value || value.length >= minLength,
        message: `Must be at least ${minLength} characters`
      });
    }
    
    return rules;
  },

  /**
   * Show field error
   */
  showFieldError(field, message) {
    field.classList.add(this.formvalidationOptions.errorClass);
    field.classList.remove(this.formvalidationOptions.validClass);
    field.setAttribute('aria-invalid', 'true');
    
    if (this.formvalidationOptions.showErrorMessages) {
      this.displayErrorMessage(field, message);
    }
    
    this.emit('field-error', { field, message });
  },

  /**
   * Show field as valid
   */
  showFieldValid(field) {
    field.classList.remove(this.formvalidationOptions.errorClass);
    field.classList.add(this.formvalidationOptions.validClass);
    field.setAttribute('aria-invalid', 'false');
    
    this.clearErrorMessage(field);
    this.emit('field-valid', { field });
  },

  /**
   * Clear field error
   */
  clearFieldError(field) {
    field.classList.remove(this.formvalidationOptions.errorClass);
    field.setAttribute('aria-invalid', 'false');
    this.clearErrorMessage(field);
  },

  /**
   * Display error message for field
   */
  displayErrorMessage(field, message) {
    let errorElement = field.parentElement.querySelector('.error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  },

  /**
   * Clear error message for field
   */
  clearErrorMessage(field) {
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  },

  /**
   * Public API - validate the form programmatically
   */
  validateForm() {
    return this.validateAllFields();
  },

  /**
   * Public API - reset form validation
   */
  resetFormValidation() {
    if (!this.fields) return;
    
    this.fields.forEach(field => {
      this.clearFieldError(field);
      field.classList.remove(this.formvalidationOptions.validClass);
    });
  },

  /**
   * Health check using MixinBase utilities
   */
  isFormValidationHealthy: MixinUtilities.createHealthCheck([
    function() { return this.form !== null; },
    function() { return this.fields && this.fields.length > 0; },
    function() { return this.formvalidationOptions !== undefined; },
    function() {
      // Check if form has proper event listeners
      return this.form && this.form.dataset && 
             this.form.dataset.componentListeners &&
             this.form.dataset.componentListeners.includes(this.id);
    }
  ])
};

// Validate the mixin interface
validateMixinInterface(FormValidationMixin, {
  methods: ['initFormValidation', 'isFormValidationHealthy']
});
