/**
 * Logging configuration utilities
 */
import { logger } from './Logger.js';

export function configureLogging() {
  try {
    const explicitLevel = window.HugoEnvironment?.logLevel || document.documentElement?.dataset?.logLevel;
    if (explicitLevel) {
      logger.setLogLevel(explicitLevel);
    }

    const isDebug = window.HugoEnvironment?.debug || /^(DEBUG|TRACE)$/i.test(document.documentElement?.dataset?.logLevel || '');
    if (isDebug && !window.__miloConsoleShimInstalled && !window.MiloDocsDisableConsoleShim) {
      const originalWarn = console.warn.bind(console);
      const originalError = console.error.bind(console);
      console.warn = (...args) => {
        const [message, ...rest] = args;
        const formatted =
          typeof message === 'string'
            ? logger.formatMessage('WARN', 'Console', message, ...rest)
            : logger.formatMessage('WARN', 'Console', 'Warning:', message, ...rest);
        originalWarn(...formatted);
      };
      console.error = (...args) => {
        const [message, ...rest] = args;
        const formatted =
          typeof message === 'string'
            ? logger.formatMessage('ERROR', 'Console', message, ...rest)
            : logger.formatMessage('ERROR', 'Console', 'Error:', message, ...rest);
        originalError(...formatted);
      };
      window.__miloConsoleShimInstalled = true;
    }
  } catch (e) {
    // Fail open; do not block initialization on logging config
  }
}

export default configureLogging;

