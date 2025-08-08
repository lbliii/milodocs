/**
 * Global error and rejection guards
 */
import { logger } from '../utils/Logger.js';

/**
 * Install global handlers for unhandled promise rejections and errors.
 * Safe to call multiple times; listeners will be duplicated by the browser,
 * so callers should guard against repeated calls if needed.
 */
export function installGlobalErrorGuards() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    try { logger.error('Global', 'Unhandled promise rejection', event.reason); } catch (_) {}
    // Prevent default console spam in production
    if (!window.HugoEnvironment?.debug) event.preventDefault();
  });

  // Uncaught errors
  window.addEventListener('error', (event) => {
    try { logger.error('Global', 'Unhandled error', event.error || event.message); } catch (_) {}
  });
}

export default installGlobalErrorGuards;

