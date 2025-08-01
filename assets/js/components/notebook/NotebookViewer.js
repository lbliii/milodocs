/**
 * NotebookViewer Component - Main Orchestrator
 * Modern, accessible Jupyter notebook viewer with interactive features
 * Split into focused components for better maintainability
 */

import { Component } from '../../core/ComponentManager.js';
import { localStorage } from '../../utils/index.js';
import { NotebookCell } from './NotebookCell.js';
import { NotebookNavigation } from './NotebookNavigation.js';
import { NotebookState } from './NotebookState.js';

export class NotebookViewer extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-viewer',
      selector: config.selector || '.notebook',
      ...config
    });

    // Component state
    this.cells = new Map();
    this.preferences = {
      collapsedCells: new Set(),
      autoCollapse: config.autoCollapse || false,
      animationsEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      copyFeedback: config.copyFeedback !== false
    };

    // Configuration options
    this.options = {
      storageKey: 'notebook-viewer-state',
      copySuccessDuration: 2000,
      copyErrorDuration: 3000,
      cellAnimationDelay: 100,
      ...this.options
    };

    // Storage for cleanup functions
    this.eventCleanups = [];
    
    // Child components
    this.cellManager = null;
    this.navigationManager = null;
    this.stateManager = null;
  }

  /**
   * Initialize the notebook viewer
   */
  async onInit() {
    if (!this.element) {
      console.warn('NotebookViewer: No notebook element found');
      return;
    }

    await this.setupNotebook();
    this.cacheElements();
    this.setupEventListeners();
    this.loadStoredState();
    this.initializeAccessibility();
    this.setupAnimations();
    
    this.emit('notebook:initialized', { 
      cellCount: this.cells.size,
      notebookId: this.getNotebookId()
    });
  }

  /**
   * Setup the notebook structure and identify cells
   */
  async setupNotebook() {
    // Add notebook container classes
    this.element.classList.add('notebook');
    
    // Find and setup cells
    const cellElements = this.element.querySelectorAll('[data-cell-type], .notebook-cell');
    
    cellElements.forEach((cellElement, index) => {
      this.setupCell(cellElement, index);
    });

    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  }

  /**
   * Setup individual cell using NotebookCell component
   */
  setupCell(cellElement, index) {
    const { cellId, cellData } = NotebookCell.setupCell(cellElement, index, this);
    this.cells.set(cellId, cellData);
  }



  /**
   * Get notebook ID from element or generate one
   */
  getNotebookId() {
    return this.element.id || 
           this.element.dataset.notebookId || 
           `notebook-${Date.now()}`;
  }



  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.copyButtons = this.element.querySelectorAll('.notebook-cell__copy-btn');
    this.toggleButtons = this.element.querySelectorAll('.notebook-cell__toggle');
    this.cellHeaders = this.element.querySelectorAll('.notebook-cell__header[role="button"]');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Copy button events
    this.copyButtons.forEach(btn => {
      const cleanup = this.addEventListener(btn, 'click', (e) => {
        e.stopPropagation();
        this.handleCopyClick(btn);
      });
      this.eventCleanups.push(cleanup);
    });

    // Toggle button events
    this.toggleButtons.forEach(btn => {
      const cleanup = this.addEventListener(btn, 'click', (e) => {
        e.stopPropagation();
        this.handleToggleClick(btn);
      });
      this.eventCleanups.push(cleanup);
    });

    // Header click events for collapsible cells
    this.cellHeaders.forEach(header => {
      const cleanup = this.addEventListener(header, 'click', (e) => {
        if (e.target.closest('.notebook-cell__toggle, .notebook-cell__copy-btn')) {
          return; // Don't handle if clicking on buttons
        }
        this.handleHeaderClick(header);
      });
      this.eventCleanups.push(cleanup);

      // Keyboard events for headers
      const keyCleanup = this.addEventListener(header, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleHeaderClick(header);
        }
      });
      this.eventCleanups.push(keyCleanup);
    });

    // Global keyboard shortcuts
    const globalKeyCleanup = this.addEventListener(document, 'keydown', (e) => {
      if (this.element.contains(e.target)) {
        this.handleGlobalKeydown(e);
      }
    });
    this.eventCleanups.push(globalKeyCleanup);

    // Preference change listeners
    const motionCleanup = this.addEventListener(
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      'change',
      (e) => {
        this.preferences.animationsEnabled = !e.matches;
      }
    );
    this.eventCleanups.push(motionCleanup);
  }

  /**
   * Handle copy button click using NotebookCell component
   */
  async handleCopyClick(button) {
    const cellId = button.dataset.cellId;
    const cell = this.cells.get(cellId);
    
    return NotebookCell.handleCopyClick(
      button, 
      cell, 
      NotebookCell.cleanNotebookCode,
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Handle toggle button click
   */
  handleToggleClick(button) {
    const cellId = button.dataset.cellId;
    this.toggleCell(cellId);
  }

  /**
   * Handle header click for collapsible cells
   */
  handleHeaderClick(header) {
    const cellElement = header.closest('.notebook-cell');
    const cellId = cellElement.dataset.cellId;
    
    if (cellElement.classList.contains('notebook-cell--collapsible')) {
      this.toggleCell(cellId);
    }
  }

  /**
   * Handle global keyboard shortcuts using NotebookNavigation
   */
  handleGlobalKeydown(e) {
    NotebookNavigation.handleGlobalKeydown(
      e,
      () => NotebookNavigation.getFocusedCell(),
      (button) => this.handleCopyClick(button),
      () => this.toggleAllCells()
    );
  }



  /**
   * Toggle cell collapsed state using NotebookState
   */
  toggleCell(cellId) {
    NotebookState.toggleCell(
      cellId,
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Collapse cell using NotebookState
   */
  collapseCell(cellId) {
    NotebookState.collapseCell(
      cellId,
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Expand cell using NotebookState
   */
  expandCell(cellId) {
    NotebookState.expandCell(
      cellId,
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Toggle all cells using NotebookState
   */
  toggleAllCells() {
    NotebookState.toggleAllCells(
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Expand all cells using NotebookState
   */
  expandAllCells() {
    NotebookState.expandAllCells(
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data)
    );
  }

  /**
   * Collapse all cells using NotebookState
   */
  collapseAllCells() {
    NotebookState.collapseAllCells(
      this.cells,
      this.preferences,
      () => this.saveState(),
      (event, data) => this.emit(event, data),
      (cellType) => NotebookState.shouldMakeCollapsible(cellType)
    );
  }



  /**
   * Setup keyboard navigation using NotebookNavigation
   */
  setupKeyboardNavigation() {
    const cleanups = NotebookNavigation.setupKeyboardNavigation(
      this.element,
      this.cells,
      (element, event, handler) => this.addEventListener(element, event, handler)
    );
    
    // Store cleanups if returned
    if (cleanups && Array.isArray(cleanups)) {
      this.eventCleanups.push(...cleanups);
    }
  }

  /**
   * Initialize accessibility features using NotebookNavigation
   */
  initializeAccessibility() {
    NotebookNavigation.initializeAccessibility(this.element, this.cells.size);
  }

  /**
   * Setup entry animations using NotebookNavigation
   */
  setupAnimations() {
    NotebookNavigation.setupAnimations(
      this.cells,
      this.options.cellAnimationDelay,
      this.preferences.animationsEnabled
    );
  }

  /**
   * Save state using NotebookState
   */
  saveState() {
    NotebookState.saveState(this.options.storageKey, this.preferences.collapsedCells);
  }

  /**
   * Load state using NotebookState
   */
  loadStoredState() {
    NotebookState.loadStoredState(
      this.options.storageKey,
      this.cells,
      (cellId) => this.collapseCell(cellId)
    );
  }



  /**
   * Get component statistics using NotebookState
   */
  getStats() {
    return NotebookState.getStats(this.cells, this.preferences, this.getNotebookId());
  }

  /**
   * Cleanup on destroy
   */
  onDestroy() {
    // Save final state
    this.saveState();
    
    // Clean up event listeners
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    
    // Clear stored data
    this.cells.clear();
    this.preferences.collapsedCells.clear();
    
    this.emit('notebook:destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('notebook-viewer', NotebookViewer);