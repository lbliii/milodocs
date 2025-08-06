/**
 * MiloCore - Central orchestrator for the MiloDocs JavaScript system
 * Handles environment detection, feature initialization, and component coordination
 */

import { eventBus } from './EventBus.js';
import ComponentManager from './ComponentManager.js';
import { ready } from '../utils/dom.js';
import { logger } from '../utils/Logger.js';

const log = logger.component('MiloCore');

export class MiloCore {
  constructor() {
    this.version = '2.0.0';
    this.environment = null;
    this.features = new Set();
    this.initialized = false;
    this.performance = {
      startTime: performance.now(),
      initTime: null,
      components: new Map()
    };
    
    // Bind methods
    this.handleError = this.handleError.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
    
    // Global error handling
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleError);
    window.addEventListener('beforeunload', this.handleUnload);
  }

  /**
   * Initialize the core system
   */
  async init() {
    if (this.initialized) {
      log.warn('MiloCore already initialized');
      return this;
    }

    const startTime = performance.now();
    
    try {
      log.info(`MiloDocs Core v${this.version} initializing...`);
      
      // Detect environment and capabilities
      this.environment = this.detectEnvironment();
      this.logEnvironment();
      
      // Initialize core features
      await this.initializeCoreFeatures();
      
      // Setup component system
      this.setupComponentSystem();
      
      // Load critical components
      await this.loadCriticalComponents();
      
      // Auto-discover page components
      await this.discoverAndLoadComponents();
      
      // Setup global events and shortcuts
      this.setupGlobalEvents();
      
      this.initialized = true;
      this.performance.initTime = performance.now() - startTime;
      
      // Emit ready event
      eventBus.emit('milo:ready', {
        version: this.version,
        environment: this.environment,
        performance: this.performance
      });
      
      log.info(`MiloDocs initialized in ${this.performance.initTime.toFixed(2)}ms`);
      
      return this;
      
    } catch (error) {
      log.error('MiloDocs initialization failed:', error);
      throw error;
    }
  }

  /**
   * Detect environment and capabilities
   */
  detectEnvironment() {
    const env = window.HugoEnvironment || {};
    
    return {
      // Hugo environment data
      hugo: {
        environment: env.environment || 'development',
        isProduction: env.isProduction || false,
        debug: env.debug || false,
        baseURL: env.baseURL || '',
        version: env.version || 'unknown',
        buildTime: env.buildTime ? new Date(parseInt(env.buildTime)) : new Date()
      },
      
      // Browser capabilities
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1'
      },
      
      // Feature detection
      features: {
        localStorage: this.testLocalStorage(),
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        webgl: this.testWebGL(),
        touchEvents: 'ontouchstart' in window,
        darkModeQuery: window.matchMedia('(prefers-color-scheme: dark)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches
      },
      
      // Device information
      device: {
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTablet: /Tablet|iPad/i.test(navigator.userAgent),
        isDesktop: !/Mobi|Android|Tablet|iPad/i.test(navigator.userAgent),
        pixelRatio: window.devicePixelRatio || 1,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
  }

  /**
   * Test localStorage availability
   */
  testLocalStorage() {
    try {
      const test = '__milo_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test WebGL availability
   */
  testWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  /**
   * Log environment information
   */
  logEnvironment() {
    log.debug('Environment Detection', {
      hugo: this.environment.hugo.environment,
      production: this.environment.hugo.isProduction,
      debug: this.environment.hugo.debug,
      device: {
        mobile: this.environment.device.isMobile,
        tablet: this.environment.device.isTablet,
        desktop: this.environment.device.isDesktop
      },
      features: this.environment.features
    });
  }

  /**
   * Initialize core features based on environment
   */
  async initializeCoreFeatures() {
    const features = [];
    
    // Always load core utilities
    features.push(this.loadCoreUtilities());
    
    // Performance monitoring in development
    if (!this.environment.hugo.isProduction) {
      features.push(this.initializePerformanceMonitoring());
    }
    
    // Debug features in debug mode
    if (this.environment.hugo.debug) {
      features.push(this.initializeDebugFeatures());
    }
    
    // Environment-specific features
    features.push(this.initializeEnvironmentFeatures());
    
    await Promise.all(features);
  }

  /**
   * Load core utilities
   */
  async loadCoreUtilities() {
    // Import and initialize core management utilities
    try {
      // Import utilities to trigger their initialization
      await Promise.all([
        import('../utils/ErrorHandler.js'),    // Sets up global error handlers
        import('../utils/NotificationManager.js'), // Sets up window.toast
        import('../utils/LoadingStateManager.js'), // Injects CSS styles
        import('../utils/CopyManager.js')      // Available for components
      ]);
      
      this.features.add('utilities');
      log.debug('Core utilities loaded and initialized');
    } catch (error) {
      log.warn('Failed to load core utilities:', error);
    }
  }

  /**
   * Initialize performance monitoring
   */
  async initializePerformanceMonitoring() {
    if (!this.environment.features.performanceObserver) return;
    
    try {
      // Core Web Vitals monitoring
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.performance.components.set(entry.name, entry);
          
          logger.performance(entry.name, `${entry.duration?.toFixed(2)}ms` || 'N/A', 'MiloCore');
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      this.features.add('performance-monitoring');
      
    } catch (error) {
      log.warn('Performance monitoring failed to initialize:', error);
    }
  }

  /**
   * Initialize debug features
   */
  async initializeDebugFeatures() {
    // Add debug utilities to global scope
    window.MiloDebug = {
      core: this,
      eventBus,
      ComponentManager,
      environment: this.environment,
      performance: this.performance,
      
      // Debug helpers
      listComponents: () => ComponentManager.getAllInstances(),
      getComponent: (id) => ComponentManager.getInstance(id),
      destroyComponent: (id) => ComponentManager.destroy(id),
      emit: (event, data) => eventBus.emit(event, data),
      
      // Performance helpers
      getMetrics: () => this.performance,
      measureComponent: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`📊 ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
      }
    };
    
    // Debug keyboard shortcuts
    this.setupDebugKeyboards();
    
    this.features.add('debug');
    log.debug('Debug features initialized');
  }

  /**
   * Setup debug keyboard shortcuts
   */
  setupDebugKeyboards() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case 'D':
            e.preventDefault();
            console.table(this.environment);
            break;
          case 'C':
            e.preventDefault();
            console.table(ComponentManager.getAllInstances().map(c => c.getState()));
            break;
          case 'P':
            e.preventDefault();
            console.table(this.performance);
            break;
          case 'E':
            e.preventDefault();
            console.log(eventBus.getEvents());
            break;
        }
      }
    });
  }

  /**
   * Initialize environment-specific features
   */
  async initializeEnvironmentFeatures() {
    const env = this.environment.hugo.environment;
    
    switch (env) {
      case 'nvidia':
        await this.initializeNvidiaFeatures();
        break;
      case 'enterprise':
        await this.initializeEnterpriseFeatures();
        break;
      case 'open-source':
        await this.initializeOpenSourceFeatures();
        break;
      default:
        await this.initializeDefaultFeatures();
    }
  }

  /**
   * NVIDIA-specific initialization
   */
  async initializeNvidiaFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#76b900');
    this.features.add('nvidia-branding');
  }

  /**
   * Enterprise-specific initialization
   */
  async initializeEnterpriseFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#6366f1');
    this.features.add('enterprise-features');
  }

  /**
   * Open source-specific initialization
   */
  async initializeOpenSourceFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#ff6b6b');
    this.features.add('open-source-features');
  }

  /**
   * Default feature initialization
   */
  async initializeDefaultFeatures() {
    document.documentElement.style.setProperty('--brand-primary', '#3b82f6');
    this.features.add('default-features');
  }

  /**
   * Setup component system
   */
  setupComponentSystem() {
    // Register core components here
    // This will be expanded as we migrate components
    
    // 🚀 Enable reactive DOM discovery for dynamic content
    const reactiveEnabled = ComponentManager.enableReactiveDiscovery();
    if (reactiveEnabled) {
      this.features.add('reactive-discovery');
      log.debug('✅ Reactive DOM discovery enabled');
    }
    
    log.debug('Component system ready');
  }

  /**
   * Load critical components that should always be available
   */
  async loadCriticalComponents() {
    const critical = [];
    
    // Theme system is critical for proper styling
    // Will be migrated in next phase
    
    await Promise.all(critical);
  }

  /**
   * Auto-discover and load components
   */
  async discoverAndLoadComponents() {
    // ComponentManager.autoDiscover() handles discovery and loading internally
    ComponentManager.autoDiscover();
    
    log.debug('Component auto-discovery initiated');
  }

  /**
   * Reinitialize components after page cache restoration
   * This method is exposed for external access and debugging
   */
  reinitializeComponents() {
    if (!this.initialized) {
      log.warn('Core system not initialized, cannot reinitialize components');
      return 0;
    }
    
    return ComponentManager.reinitializeAfterCacheRestore();
  }

  /**
   * Setup global events and shortcuts
   */
  setupGlobalEvents() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
            break;
          case 'h':
            e.preventDefault();
            // Navigate to home page using relative path that works in static deployments
            const homeLink = document.querySelector('a[href="/"], a[href="./"], a[href="./index.html"], a[href="index.html"]');
            if (homeLink) {
              window.location.href = homeLink.href;
            } else {
              // Fallback to current directory
              window.location.href = './';
            }
            break;
        }
      }
    });

    // Performance monitoring
    this.setupPerformanceTracking();
    
    // Online/offline detection
    window.addEventListener('online', () => {
      eventBus.emit('milo:online');
      log.info('Connection restored');
    });
    
    window.addEventListener('offline', () => {
      eventBus.emit('milo:offline');
      log.info('Connection lost');
    });
  }

  /**
   * Setup performance tracking
   */
  setupPerformanceTracking() {
    // Track component initialization times
    eventBus.on('component:ready', (data) => {
      const { component } = data;
      this.performance.components.set(component.id, {
        name: component.name,
        initTime: performance.now() - this.performance.startTime
      });
    });
  }

  /**
   * Handle global errors
   */
  handleError(event) {
    log.error('Global error caught:', event.error || event.reason);
    
    eventBus.emit('milo:error', {
      error: event.error || event.reason,
      type: event.type
    });
  }

  /**
   * Handle page unload
   */
  handleUnload() {
    ComponentManager.destroyAll();
    
    log.debug('Cleanup completed');
  }

  /**
   * Get system information
   */
  getInfo() {
    return {
      version: this.version,
      environment: this.environment,
      features: Array.from(this.features),
      performance: this.performance,
      initialized: this.initialized
    };
  }
}

// Create global instance
export const milo = new MiloCore();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.Milo = milo;
}