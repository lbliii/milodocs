/**
 * ErrorHandler - Unified error handling and recovery system
 * Provides consistent error processing, user feedback, and recovery mechanisms
 */

import { announceToScreenReader } from './accessibility.js';
import { hideLoading } from './LoadingStateManager.js';

/**
 * @typedef {Object} ErrorOptions
 * @property {string} [userMessage] - User-friendly error message
 * @property {string} [context] - Component or operation context
 * @property {boolean} [silent] - Whether to suppress user notifications
 * @property {boolean} [recoverable] - Whether error is recoverable
 * @property {Function} [onRetry] - Retry function for recoverable errors
 * @property {number} [maxRetries] - Maximum retry attempts
 * @property {Object} [metadata] - Additional error metadata
 * @property {string} [loaderId] - Loading state to hide on error
 * @property {boolean} [announce] - Whether to announce to screen readers
 */

/**
 * @typedef {Object} ErrorResult
 * @property {string} id - Unique error ID
 * @property {string} type - Error classification
 * @property {string} message - User message
 * @property {Error} originalError - Original error object
 * @property {boolean} handled - Whether error was handled
 * @property {Object} metadata - Error metadata
 */

export class ErrorHandler {
  static errorLog = [];
  static errorCallbacks = new Map();
  static retryAttempts = new Map();

  // Error type classifications
  static ErrorTypes = {
    NETWORK: 'network',
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    PERMISSION: 'permission',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    CLIENT: 'client',
    TIMEOUT: 'timeout',
    ABORT: 'abort',
    UNKNOWN: 'unknown'
  };

  // Default error messages
  static DefaultMessages = {
    [this.ErrorTypes.NETWORK]: 'Network connection failed. Please check your internet connection and try again.',
    [this.ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [this.ErrorTypes.AUTHENTICATION]: 'Authentication failed. Please log in and try again.',
    [this.ErrorTypes.PERMISSION]: 'You do not have permission to perform this action.',
    [this.ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
    [this.ErrorTypes.SERVER]: 'Server error occurred. Please try again later.',
    [this.ErrorTypes.CLIENT]: 'An error occurred in the application.',
    [this.ErrorTypes.TIMEOUT]: 'Request timed out. Please try again.',
    [this.ErrorTypes.ABORT]: 'Operation was cancelled.',
    [this.ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  /**
   * Handle an error with unified processing and user feedback
   * @param {Error|string} error - Error to handle
   * @param {ErrorOptions} options - Error handling options
   * @returns {Promise<ErrorResult>}
   */
  static async handle(error, options = {}) {
    const config = {
      userMessage: null,
      context: 'unknown',
      silent: false,
      recoverable: false,
      onRetry: null,
      maxRetries: 3,
      metadata: {},
      loaderId: null,
      announce: true,
      ...options
    };

    // Create error object if string provided
    const errorObj = error instanceof Error ? error : new Error(error);
    
    // Generate unique error ID
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Classify error type
    const errorType = this.classifyError(errorObj);
    
    // Determine user message
    const userMessage = config.userMessage || 
                       this.getUserMessage(errorType, errorObj) || 
                       this.DefaultMessages[errorType];

    // Create error result
    const errorResult = {
      id: errorId,
      type: errorType,
      message: userMessage,
      originalError: errorObj,
      handled: false,
      metadata: {
        context: config.context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...config.metadata
      }
    };

    // Log error for debugging
    this.logError(errorResult, config);

    // Hide loading state if provided
    if (config.loaderId) {
      hideLoading(config.loaderId);
    }

    // Handle error based on type and configuration
    if (!config.silent) {
      await this.showUserFeedback(errorResult, config);
    }

    // Handle retry logic for recoverable errors
    if (config.recoverable && config.onRetry) {
      await this.handleRetry(errorResult, config);
    }

    // Store error for analytics
    this.errorLog.push(errorResult);
    
    // Emit error event
    this.emitErrorEvent(errorResult, config);
    
    errorResult.handled = true;
    return errorResult;
  }

  /**
   * Classify error into standard types
   * @param {Error} error - Error to classify
   * @returns {string}
   */
  static classifyError(error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network-related errors
    if (name === 'aborterror' || message.includes('abort')) {
      return this.ErrorTypes.ABORT;
    }
    
    if (name === 'timeouterror' || message.includes('timeout')) {
      return this.ErrorTypes.TIMEOUT;
    }

    if (message.includes('network') || message.includes('fetch') || 
        message.includes('connection') || !navigator.onLine) {
      return this.ErrorTypes.NETWORK;
    }

    // HTTP status-based classification
    if (error.status) {
      if (error.status === 401) return this.ErrorTypes.AUTHENTICATION;
      if (error.status === 403) return this.ErrorTypes.PERMISSION;
      if (error.status === 404) return this.ErrorTypes.NOT_FOUND;
      if (error.status >= 400 && error.status < 500) return this.ErrorTypes.CLIENT;
      if (error.status >= 500) return this.ErrorTypes.SERVER;
    }

    // Validation errors
    if (name.includes('validation') || message.includes('invalid') || 
        message.includes('required') || message.includes('format')) {
      return this.ErrorTypes.VALIDATION;
    }

    return this.ErrorTypes.UNKNOWN;
  }

  /**
   * Get context-specific user message
   * @param {string} errorType - Classified error type
   * @param {Error} error - Original error
   * @returns {string|null}
   */
  static getUserMessage(errorType, error) {
    // Special handling for common error scenarios
    if (errorType === this.ErrorTypes.NETWORK && !navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    if (errorType === this.ErrorTypes.TIMEOUT) {
      return 'The request is taking longer than expected. Please try again.';
    }

    // For server errors, provide more specific guidance
    if (errorType === this.ErrorTypes.SERVER) {
      return 'Our servers are experiencing issues. Please try again in a few minutes.';
    }

    return null;
  }

  /**
   * Log error for debugging and analytics
   * @param {ErrorResult} errorResult - Error result object
   * @param {ErrorOptions} config - Configuration
   */
  static logError(errorResult, config) {
    const logLevel = this.getLogLevel(errorResult.type);
    
    const logMessage = `[${errorResult.type.toUpperCase()}] ${config.context}: ${errorResult.originalError.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, {
          errorId: errorResult.id,
          error: errorResult.originalError,
          metadata: errorResult.metadata
        });
        break;
      case 'warn':
        console.warn(logMessage, errorResult.metadata);
        break;
      case 'info':
        console.info(logMessage, errorResult.metadata);
        break;
    }

    // Log to external service if available
    if (window.errorLogger) {
      window.errorLogger.log(errorResult);
    }
  }

  /**
   * Get appropriate log level for error type
   * @param {string} errorType - Error type
   * @returns {string}
   */
  static getLogLevel(errorType) {
    switch (errorType) {
      case this.ErrorTypes.SERVER:
      case this.ErrorTypes.UNKNOWN:
        return 'error';
      case this.ErrorTypes.NETWORK:
      case this.ErrorTypes.TIMEOUT:
        return 'warn';
      case this.ErrorTypes.VALIDATION:
      case this.ErrorTypes.ABORT:
        return 'info';
      default:
        return 'warn';
    }
  }

  /**
   * Show user feedback for error
   * @param {ErrorResult} errorResult - Error result
   * @param {ErrorOptions} config - Configuration
   */
  static async showUserFeedback(errorResult, config) {
    // Screen reader announcement
    if (config.announce) {
      announceToScreenReader(`Error: ${errorResult.message}`);
    }

    // Toast notification if available
    if (window.toast) {
      const duration = this.getNotificationDuration(errorResult.type);
      window.toast(errorResult.message, 'error', duration);
    }

    // Console feedback for development
    if (window.MiloDebug) {
      console.group(`🚨 Error in ${config.context}`);
      console.error('Message:', errorResult.message);
      console.error('Type:', errorResult.type);
      console.error('Original:', errorResult.originalError);
      console.error('Metadata:', errorResult.metadata);
      console.groupEnd();
    }
  }

  /**
   * Get notification duration based on error severity
   * @param {string} errorType - Error type
   * @returns {number}
   */
  static getNotificationDuration(errorType) {
    switch (errorType) {
      case this.ErrorTypes.VALIDATION:
      case this.ErrorTypes.ABORT:
        return 3000; // Short duration for user-caused errors
      case this.ErrorTypes.NETWORK:
      case this.ErrorTypes.TIMEOUT:
        return 5000; // Medium duration for network issues
      case this.ErrorTypes.SERVER:
      case this.ErrorTypes.UNKNOWN:
        return 7000; // Longer duration for serious errors
      default:
        return 4000;
    }
  }

  /**
   * Handle retry logic for recoverable errors
   * @param {ErrorResult} errorResult - Error result
   * @param {ErrorOptions} config - Configuration
   */
  static async handleRetry(errorResult, config) {
    const retryKey = `${config.context}-${errorResult.type}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    if (currentAttempts >= config.maxRetries) {
      console.warn(`Max retries (${config.maxRetries}) exceeded for ${config.context}`);
      return;
    }

    // Calculate exponential backoff delay
    const baseDelay = 1000; // 1 second
    const delay = baseDelay * Math.pow(2, currentAttempts);
    
    console.log(`Retrying ${config.context} in ${delay}ms (attempt ${currentAttempts + 1}/${config.maxRetries})`);

    // Update retry count
    this.retryAttempts.set(retryKey, currentAttempts + 1);

    // Show retry notification
    if (window.toast) {
      window.toast(`Retrying... (${currentAttempts + 1}/${config.maxRetries})`, 'info', 2000);
    }

    // Execute retry after delay
    setTimeout(async () => {
      try {
        await config.onRetry();
        // Reset retry count on success
        this.retryAttempts.delete(retryKey);
      } catch (retryError) {
        // Handle retry failure
        await this.handle(retryError, {
          ...config,
          userMessage: `Retry failed: ${retryError.message}`
        });
      }
    }, delay);
  }

  /**
   * Emit error event for component tracking
   * @param {ErrorResult} errorResult - Error result
   * @param {ErrorOptions} config - Configuration
   */
  static emitErrorEvent(errorResult, config) {
    if (window.eventBus) {
      window.eventBus.emit('error:handled', {
        errorId: errorResult.id,
        type: errorResult.type,
        context: config.context,
        recoverable: config.recoverable,
        timestamp: errorResult.metadata.timestamp
      });
    }
  }

  /**
   * Create error boundary for component error handling
   * @param {Function} operation - Operation to wrap
   * @param {ErrorOptions} options - Error handling options
   * @returns {Function}
   */
  static createErrorBoundary(operation, options = {}) {
    return async (...args) => {
      try {
        return await operation(...args);
      } catch (error) {
        const errorResult = await this.handle(error, options);
        
        // Re-throw if error is critical and should bubble up
        if (options.critical) {
          throw errorResult.originalError;
        }
        
        return null;
      }
    };
  }

  /**
   * Register global error callback for specific error types
   * @param {string} errorType - Error type to handle
   * @param {Function} callback - Callback function
   */
  static onError(errorType, callback) {
    if (!this.errorCallbacks.has(errorType)) {
      this.errorCallbacks.set(errorType, []);
    }
    this.errorCallbacks.get(errorType).push(callback);
  }

  /**
   * Handle fetch errors with automatic classification
   * @param {Response} response - Fetch response
   * @param {ErrorOptions} options - Error handling options
   * @returns {Promise<ErrorResult>}
   */
  static async handleFetchError(response, options = {}) {
    let error;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      error = new Error(`HTTP ${response.status}: ${errorText}`);
      error.status = response.status;
      error.statusText = response.statusText;
    } else {
      error = new Error('Fetch operation failed');
    }

    return this.handle(error, {
      context: 'fetch',
      recoverable: response.status >= 500, // Server errors are recoverable
      ...options
    });
  }

  /**
   * Clear error log (for memory management)
   * @param {number} [maxAge] - Maximum age in milliseconds
   */
  static clearErrorLog(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    this.errorLog = this.errorLog.filter(error => 
      new Date(error.metadata.timestamp).getTime() > cutoff
    );
  }

  /**
   * Get error statistics
   * @param {number} [timeframe] - Timeframe in milliseconds
   * @returns {Object}
   */
  static getErrorStats(timeframe = 60 * 60 * 1000) { // 1 hour default
    const cutoff = Date.now() - timeframe;
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.metadata.timestamp).getTime() > cutoff
    );

    const stats = {
      total: recentErrors.length,
      byType: {},
      byContext: {},
      recoverable: 0
    };

    recentErrors.forEach(error => {
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Count by context
      const context = error.metadata.context;
      stats.byContext[context] = (stats.byContext[context] || 0) + 1;
    });

    return stats;
  }

  /**
   * Setup global error handlers
   */
  static setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, {
        context: 'unhandled-promise',
        userMessage: 'An unexpected error occurred.',
        silent: false
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handle(event.error || new Error(event.message), {
        context: 'javascript-error',
        userMessage: 'A script error occurred. Please refresh the page.',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    console.log('ErrorHandler: Global error handlers initialized');
  }
}

// Convenience functions for common error scenarios
export const handleError = (error, options) => ErrorHandler.handle(error, options);
export const handleNetworkError = (error, options = {}) => 
  ErrorHandler.handle(error, { ...options, context: 'network' });
export const handleValidationError = (error, options = {}) => 
  ErrorHandler.handle(error, { ...options, context: 'validation' });
export const createErrorBoundary = (operation, options) => 
  ErrorHandler.createErrorBoundary(operation, options);
export const handleFetchError = (response, options) => 
  ErrorHandler.handleFetchError(response, options);

// Initialize global handlers when module loads
if (typeof window !== 'undefined') {
  ErrorHandler.setupGlobalHandlers();
}