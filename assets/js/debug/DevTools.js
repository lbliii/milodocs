/**
 * Debug-only utilities exposed on window when in debug mode
 */
import { milo } from '../core/MiloCore.js';
import ComponentManager from '../core/ComponentManager.js';
import { logger } from '../utils/Logger.js';
import { isStaticDeployment, checkComponentHealth } from '../nav/StaticNavigation.js';

const log = logger.component('DevTools');

export function installDebugTools() {
  if (typeof window === 'undefined') return;
  if (!window.HugoEnvironment?.debug && !/^(DEBUG|TRACE)$/i.test(document.documentElement?.dataset?.logLevel || '')) {
    return;
  }

  window.reinitializeComponents = () => {
    log.info('Manual component reinitialization triggered');
    const count = milo.reinitializeComponents();
    log.info(`Reinitialized ${count} components`);
    return count;
  };

  window.testStaticNavigation = () => {
    log.info('Testing static navigation handling...');
    log.info(`Current URL: ${window.location.href}`);
    log.info(`Is static deployment: ${isStaticDeployment()}`);
    log.info(`Core initialized: ${milo.initialized}`);
    return checkComponentHealth();
  };

  window.checkComponentHealth = async () => {
    log.info('Checking component health...');
    const health = await checkComponentHealth();
    log.info(`Component health status: ${health}`);
    return health;
  };

  window.testSidebarFunctionality = () => {
    log.info('Testing sidebar functionality...');
    const sidebarElement = document.getElementById('sidebar-left');
    if (!sidebarElement) {
      log.error('Sidebar element not found');
      return false;
    }
    const style = window.getComputedStyle(sidebarElement);
    const isVisible = style.display !== 'none' && style.opacity !== '0';
    log.info(`Sidebar visibility: ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    return isVisible;
  };
}

export default installDebugTools;

