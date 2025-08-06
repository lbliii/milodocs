/**
 * Centralized logging utility for MiloDocs
 * Provides configurable log levels and reduces console noise
 */

// Log levels in order of severity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

class Logger {
  constructor() {
    this.currentLevel = this.getLogLevel();
    this.prefix = '[MiloDocs]';
    this.colors = {
      ERROR: '#ff5f56',
      WARN: '#ffbd2e', 
      INFO: '#4ecdc4',
      DEBUG: '#79c0ff',
      TRACE: '#7c3aed'
    };
  }

  /**
   * Determine current log level based on environment
   */
  getLogLevel() {
    // Check for explicit log level setting
    if (window.MiloDocsLogLevel) {
      return LOG_LEVELS[window.MiloDocsLogLevel.toUpperCase()] ?? LOG_LEVELS.INFO;
    }
    
    // Check debug mode settings
    if (window.HugoEnvironment?.debug) {
      return LOG_LEVELS.DEBUG;
    }
    
    // Check if localhost (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return LOG_LEVELS.INFO;
    }
    
    // Production - only errors and warnings
    return LOG_LEVELS.WARN;
  }

  /**
   * Check if a log level should be output
   */
  shouldLog(level) {
    return LOG_LEVELS[level] <= this.currentLevel;
  }

  /**
   * Format log message with consistent styling
   */
  formatMessage(level, component, message, ...args) {
    const timestamp = new Date().toLocaleTimeString();
    const componentName = component ? `[${component}]` : '';
    const color = this.colors[level];
    
    return [
      `%c${this.prefix}%c ${componentName} %c${message}`,
      `color: ${color}; font-weight: bold;`,
      `color: #666; font-style: italic;`,
      `color: inherit;`,
      ...args
    ];
  }

  /**
   * Log methods for different levels
   */
  error(component, message, ...args) {
    if (this.shouldLog('ERROR')) {
      console.error(...this.formatMessage('ERROR', component, message, ...args));
    }
  }

  warn(component, message, ...args) {
    if (this.shouldLog('WARN')) {
      console.warn(...this.formatMessage('WARN', component, message, ...args));
    }
  }

  info(component, message, ...args) {
    if (this.shouldLog('INFO')) {
      console.log(...this.formatMessage('INFO', component, message, ...args));
    }
  }

  debug(component, message, ...args) {
    if (this.shouldLog('DEBUG')) {
      console.log(...this.formatMessage('DEBUG', component, message, ...args));
    }
  }

  trace(component, message, ...args) {
    if (this.shouldLog('TRACE')) {
      console.log(...this.formatMessage('TRACE', component, message, ...args));
    }
  }

  /**
   * Component-specific loggers
   */
  component(componentName) {
    return {
      error: (message, ...args) => this.error(componentName, message, ...args),
      warn: (message, ...args) => this.warn(componentName, message, ...args),
      info: (message, ...args) => this.info(componentName, message, ...args),
      debug: (message, ...args) => this.debug(componentName, message, ...args),
      trace: (message, ...args) => this.trace(componentName, message, ...args)
    };
  }

  /**
   * Performance logging helper
   */
  performance(metric, value, component = 'Performance') {
    if (this.shouldLog('DEBUG')) {
      console.log(...this.formatMessage('DEBUG', component, `${metric}: ${value}`));
    }
  }

  /**
   * Event logging helper
   */
  event(eventName, data, component = 'EventBus') {
    if (this.shouldLog('TRACE')) {
      console.log(...this.formatMessage('TRACE', component, `Event: ${eventName}`, data));
    }
  }

  /**
   * Success logging with emoji (only for important successes)
   */
  success(component, message, ...args) {
    if (this.shouldLog('INFO')) {
      console.log(...this.formatMessage('INFO', component, `✅ ${message}`, ...args));
    }
  }

  /**
   * Update log level at runtime
   */
  setLogLevel(level) {
    const newLevel = typeof level === 'string' ? level.toUpperCase() : level;
    if (LOG_LEVELS[newLevel] !== undefined) {
      this.currentLevel = LOG_LEVELS[newLevel];
      this.info('Logger', `Log level changed to ${newLevel}`);
    } else {
      this.warn('Logger', `Invalid log level: ${level}`);
    }
  }

  /**
   * Get current log level name
   */
  getCurrentLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.currentLevel);
  }
}

// Create global instance
export const logger = new Logger();

// Global utilities for debugging
if (typeof window !== 'undefined') {
  window.MiloLogger = {
    setLevel: (level) => logger.setLogLevel(level),
    getLevel: () => logger.getCurrentLevel(),
    levels: Object.keys(LOG_LEVELS)
  };
}