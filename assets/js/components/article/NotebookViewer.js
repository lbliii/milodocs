/**
 * NotebookViewer Component
 * Modern, accessible Jupyter notebook viewer with interactive features
 * Integrates with the existing MiloDocs component system
 */

import { Component } from '../../core/ComponentManager.js';
import { copyToClipboard } from '../../utils/dom.js';
import { announceToScreenReader } from '../../utils/accessibility.js';

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
   * Setup individual cell
   */
  setupCell(cellElement, index) {
    const cellType = this.detectCellType(cellElement);
    const cellId = this.generateCellId(cellType, index);
    
    // Store cell data
    this.cells.set(cellId, {
      element: cellElement,
      type: cellType,
      index: index,
      collapsed: false,
      hasOutput: this.hasOutput(cellElement)
    });

    // Add necessary classes and attributes
    cellElement.classList.add('notebook-cell', `notebook-cell--${cellType}`);
    cellElement.setAttribute('data-cell-id', cellId);
    cellElement.setAttribute('data-cell-type', cellType);
    cellElement.setAttribute('data-cell-index', index);
    cellElement.style.setProperty('--cell-index', index);

    // Setup cell header if it doesn't exist
    this.ensureCellHeader(cellElement, cellType, cellId);
    
    // Setup cell content wrapper
    this.ensureCellContent(cellElement);
    
    // Setup code cells specifically
    if (cellType === 'code') {
      this.setupCodeCell(cellElement, cellId);
    }

    // Make collapsible if configured
    if (this.shouldMakeCollapsible(cellType)) {
      this.makeCollapsible(cellElement, cellId);
    }
  }

  /**
   * Detect cell type from element
   */
  detectCellType(element) {
    // Check data attribute first
    if (element.dataset.cellType) {
      return element.dataset.cellType;
    }

    // Check class names
    if (element.classList.contains('notebook-cell--markdown')) return 'markdown';
    if (element.classList.contains('notebook-cell--code')) return 'code';
    if (element.classList.contains('notebook-cell--raw')) return 'raw';

    // Detect from content
    if (element.querySelector('pre code, .highlight')) return 'code';
    if (element.querySelector('.raw-cell-content')) return 'raw';
    
    return 'markdown'; // Default fallback
  }

  /**
   * Check if cell has output
   */
  hasOutput(cellElement) {
    return !!(
      cellElement.querySelector('.code-outputs') ||
      cellElement.querySelector('.notebook-cell__outputs') ||
      cellElement.querySelector('[class*="output"]')
    );
  }

  /**
   * Generate unique cell ID
   */
  generateCellId(type, index) {
    return `${this.getNotebookId()}-${type}-${index}`;
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
   * Ensure cell has proper header structure
   */
  ensureCellHeader(cellElement, cellType, cellId) {
    let header = cellElement.querySelector('.notebook-cell__header');
    
    if (!header) {
      header = this.createElement('div', {
        class: 'notebook-cell__header',
        role: 'button',
        tabindex: '0',
        'aria-controls': `${cellId}-content`,
        'aria-expanded': 'true'
      });

      // Cell type indicator
      const typeIndicator = this.createElement('div', {
        class: 'notebook-cell__type'
      });
      
      const typeIcon = this.createElement('span', {
        class: 'notebook-cell__type-icon',
        'aria-hidden': 'true'
      });
      typeIcon.innerHTML = this.getCellTypeIcon(cellType);
      
      const typeText = this.createElement('span', {
        class: 'notebook-cell__type-text'
      });
      typeText.textContent = this.getCellTypeLabel(cellType);
      
      typeIndicator.appendChild(typeIcon);
      typeIndicator.appendChild(typeText);
      
      // Controls container
      const controls = this.createElement('div', {
        class: 'notebook-cell__controls'
      });
      
      header.appendChild(typeIndicator);
      header.appendChild(controls);
      
      // Insert header at the beginning
      cellElement.insertBefore(header, cellElement.firstChild);
    }

    return header;
  }

  /**
   * Ensure cell has proper content wrapper
   */
  ensureCellContent(cellElement) {
    let content = cellElement.querySelector('.notebook-cell__content');
    
    if (!content) {
      content = this.createElement('div', {
        class: 'notebook-cell__content',
        id: `${cellElement.dataset.cellId}-content`
      });
      
      // Move existing content (except header) into wrapper
      const header = cellElement.querySelector('.notebook-cell__header');
      const elementsToMove = Array.from(cellElement.children).filter(
        child => child !== header
      );
      
      elementsToMove.forEach(element => {
        content.appendChild(element);
      });
      
      cellElement.appendChild(content);
    }

    return content;
  }

  /**
   * Setup code cell specific features
   */
  setupCodeCell(cellElement, cellId) {
    const codeContent = cellElement.querySelector('pre, .highlight, .notebook-cell__code-content');
    
    if (codeContent) {
      // Wrap code content if needed
      if (!codeContent.closest('.notebook-cell__code-container')) {
        const codeContainer = this.createElement('div', {
          class: 'notebook-cell__code-container'
        });
        
        const parent = codeContent.parentNode;
        parent.insertBefore(codeContainer, codeContent);
        codeContainer.appendChild(codeContent);
      }

      // Add copy button
      this.addCopyButton(codeContent, cellId);
      
      // Setup execution count if present
      this.setupExecutionCount(cellElement);
    }

    // Setup outputs
    this.setupOutputs(cellElement);
  }

  /**
   * Add copy button to code content
   */
  addCopyButton(codeContent, cellId) {
    // Remove existing copy buttons to avoid duplicates
    const existingBtn = codeContent.parentNode.querySelector('.notebook-cell__copy-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    const copyBtn = this.createElement('button', {
      class: 'notebook-cell__copy-btn',
      type: 'button',
      'aria-label': 'Copy code to clipboard',
      'data-cell-id': cellId
    });

    const copyIcon = this.createElement('span', {
      class: 'notebook-cell__copy-icon',
      'aria-hidden': 'true'
    });
    copyIcon.innerHTML = this.getCopyIcon();

    const copyText = this.createElement('span', {
      class: 'notebook-cell__copy-text'
    });
    copyText.textContent = 'Copy';

    copyBtn.appendChild(copyIcon);
    copyBtn.appendChild(copyText);

    // Insert copy button into code container
    const container = codeContent.closest('.notebook-cell__code-container') || codeContent.parentNode;
    container.style.position = 'relative';
    container.appendChild(copyBtn);
  }

  /**
   * Setup execution count display
   */
  setupExecutionCount(cellElement) {
    const existingCount = cellElement.querySelector('.execution-count, .notebook-cell__execution-count');
    
    if (existingCount && !existingCount.classList.contains('notebook-cell__execution-count')) {
      existingCount.classList.add('notebook-cell__execution-count');
    }
  }

  /**
   * Setup cell outputs
   */
  setupOutputs(cellElement) {
    const outputsContainer = cellElement.querySelector('.code-outputs, .notebook-cell__outputs');
    
    if (outputsContainer) {
      outputsContainer.classList.add('notebook-cell__outputs');
      
      // Process individual outputs
      const outputs = outputsContainer.querySelectorAll('[class*="output"], .stream-output, .execute-result, .display-data, .error-output');
      
      outputs.forEach(output => {
        this.setupOutput(output);
      });
    }
  }

  /**
   * Setup individual output
   */
  setupOutput(output) {
    // Determine output type from classes
    let outputType = 'general';
    
    if (output.classList.contains('stream-output') || output.className.includes('stream')) {
      outputType = 'stream';
    } else if (output.classList.contains('execute-result') || output.className.includes('execute')) {
      outputType = 'execute-result';
    } else if (output.classList.contains('display-data') || output.className.includes('display')) {
      outputType = 'display-data';
    } else if (output.classList.contains('error-output') || output.className.includes('error')) {
      outputType = 'error';
    }

    output.classList.add('notebook-cell__output', `notebook-cell__output--${outputType}`);
  }

  /**
   * Make cell collapsible
   */
  makeCollapsible(cellElement, cellId) {
    cellElement.classList.add('notebook-cell--collapsible');
    
    const header = cellElement.querySelector('.notebook-cell__header');
    const controls = header.querySelector('.notebook-cell__controls');
    
    // Add toggle button
    const toggleBtn = this.createElement('button', {
      class: 'notebook-cell__toggle',
      type: 'button',
      'aria-label': 'Toggle cell visibility',
      'data-cell-id': cellId
    });

    const toggleIcon = this.createElement('span', {
      class: 'notebook-cell__toggle-icon',
      'aria-hidden': 'true'
    });
    toggleIcon.innerHTML = this.getToggleIcon();

    toggleBtn.appendChild(toggleIcon);
    controls.appendChild(toggleBtn);

    // Make header clickable
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'true');
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
   * Handle copy button click
   */
  async handleCopyClick(button) {
    const cellId = button.dataset.cellId;
    const cell = this.cells.get(cellId);
    
    if (!cell) {
      console.error('NotebookViewer: Cell not found for copy operation');
      return;
    }

    try {
      const codeContent = this.extractCodeContent(cell.element);
      const success = await copyToClipboard(codeContent);
      
      if (success) {
        this.showCopySuccess(button, codeContent.length);
        this.emit('notebook:copy-success', { cellId, content: codeContent });
      } else {
        throw new Error('Copy operation failed');
      }
      
    } catch (error) {
      console.error('NotebookViewer: Copy failed:', error);
      this.showCopyError(button);
      this.emit('notebook:copy-error', { cellId, error });
    }
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
   * Handle global keyboard shortcuts
   */
  handleGlobalKeydown(e) {
    // Ctrl/Cmd + Shift + C: Copy current cell
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      const focusedCell = this.getFocusedCell();
      if (focusedCell) {
        const copyBtn = focusedCell.querySelector('.notebook-cell__copy-btn');
        if (copyBtn) {
          this.handleCopyClick(copyBtn);
        }
      }
    }

    // Ctrl/Cmd + Shift + E: Expand/collapse all cells
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      this.toggleAllCells();
    }
  }

  /**
   * Extract code content from cell
   */
  extractCodeContent(cellElement) {
    const codeElement = cellElement.querySelector('pre code, .highlight code, code');
    
    if (codeElement) {
      // Get text content, preserving line breaks
      return codeElement.textContent || codeElement.innerText || '';
    }
    
    // Fallback: get text from pre element
    const preElement = cellElement.querySelector('pre');
    if (preElement) {
      return preElement.textContent || preElement.innerText || '';
    }
    
    return '';
  }

  /**
   * Show copy success feedback
   */
  showCopySuccess(button, contentLength) {
    if (!this.preferences.copyFeedback) return;

    const originalText = button.querySelector('.notebook-cell__copy-text').textContent;
    const originalClass = button.className;
    
    button.classList.add('notebook-cell__copy-btn--success');
    button.querySelector('.notebook-cell__copy-text').textContent = '✅ Copied!';
    
    announceToScreenReader(`Code copied to clipboard. ${contentLength} characters.`);

    setTimeout(() => {
      button.className = originalClass;
      button.querySelector('.notebook-cell__copy-text').textContent = originalText;
    }, this.options.copySuccessDuration);
  }

  /**
   * Show copy error feedback
   */
  showCopyError(button) {
    if (!this.preferences.copyFeedback) return;

    const originalText = button.querySelector('.notebook-cell__copy-text').textContent;
    const originalClass = button.className;
    
    button.classList.add('notebook-cell__copy-btn--error');
    button.querySelector('.notebook-cell__copy-text').textContent = '❌ Failed';
    
    announceToScreenReader('Failed to copy code to clipboard.');

    setTimeout(() => {
      button.className = originalClass;
      button.querySelector('.notebook-cell__copy-text').textContent = originalText;
    }, this.options.copyErrorDuration);
  }

  /**
   * Toggle cell collapsed state
   */
  toggleCell(cellId) {
    const cell = this.cells.get(cellId);
    if (!cell) return;

    const isCollapsed = cell.collapsed;
    
    if (isCollapsed) {
      this.expandCell(cellId);
    } else {
      this.collapseCell(cellId);
    }
  }

  /**
   * Collapse cell
   */
  collapseCell(cellId) {
    const cell = this.cells.get(cellId);
    if (!cell || cell.collapsed) return;

    cell.collapsed = true;
    this.preferences.collapsedCells.add(cellId);
    
    const { element } = cell;
    element.classList.add('notebook-cell--collapsed');
    
    const header = element.querySelector('.notebook-cell__header');
    header.setAttribute('aria-expanded', 'false');
    
    announceToScreenReader('Cell collapsed');
    this.saveState();
    this.emit('notebook:cell-collapsed', { cellId });
  }

  /**
   * Expand cell
   */
  expandCell(cellId) {
    const cell = this.cells.get(cellId);
    if (!cell || !cell.collapsed) return;

    cell.collapsed = false;
    this.preferences.collapsedCells.delete(cellId);
    
    const { element } = cell;
    element.classList.remove('notebook-cell--collapsed');
    
    const header = element.querySelector('.notebook-cell__header');
    header.setAttribute('aria-expanded', 'true');
    
    announceToScreenReader('Cell expanded');
    this.saveState();
    this.emit('notebook:cell-expanded', { cellId });
  }

  /**
   * Toggle all cells
   */
  toggleAllCells() {
    const hasCollapsed = this.preferences.collapsedCells.size > 0;
    
    if (hasCollapsed) {
      this.expandAllCells();
    } else {
      this.collapseAllCells();
    }
  }

  /**
   * Expand all cells
   */
  expandAllCells() {
    Array.from(this.cells.keys()).forEach(cellId => {
      this.expandCell(cellId);
    });
    
    announceToScreenReader('All cells expanded');
    this.emit('notebook:all-cells-expanded');
  }

  /**
   * Collapse all cells
   */
  collapseAllCells() {
    Array.from(this.cells.keys()).forEach(cellId => {
      if (this.shouldMakeCollapsible(this.cells.get(cellId).type)) {
        this.collapseCell(cellId);
      }
    });
    
    announceToScreenReader('All cells collapsed');
    this.emit('notebook:all-cells-collapsed');
  }

  /**
   * Determine if cell type should be collapsible
   */
  shouldMakeCollapsible(cellType) {
    // All cell types can be collapsible by default
    return true;
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    const cells = Array.from(this.cells.values()).map(cell => cell.element);
    
    cells.forEach((cell, index) => {
      const header = cell.querySelector('.notebook-cell__header');
      if (header) {
        header.setAttribute('tabindex', index === 0 ? '0' : '-1');
        
        const cleanup = this.addEventListener(header, 'keydown', (e) => {
          this.handleCellNavigation(e, index, cells);
        });
        this.eventCleanups.push(cleanup);
      }
    });
  }

  /**
   * Handle cell-to-cell navigation
   */
  handleCellNavigation(e, currentIndex, cells) {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, cells.length - 1);
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = cells.length - 1;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentIndex) {
      // Update tabindex
      cells[currentIndex].querySelector('.notebook-cell__header').setAttribute('tabindex', '-1');
      cells[newIndex].querySelector('.notebook-cell__header').setAttribute('tabindex', '0');
      
      // Focus new cell
      cells[newIndex].querySelector('.notebook-cell__header').focus();
    }
  }

  /**
   * Get currently focused cell
   */
  getFocusedCell() {
    const activeElement = document.activeElement;
    return activeElement?.closest('.notebook-cell');
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Add ARIA labels and landmarks
    this.element.setAttribute('role', 'main');
    this.element.setAttribute('aria-label', 'Jupyter Notebook');
    
    // Add cell count to screen readers
    const cellCount = this.cells.size;
    announceToScreenReader(`Notebook loaded with ${cellCount} cells`);
    
    // Add instructions for screen readers
    const instructions = this.createElement('div', {
      class: 'sr-only',
      'aria-live': 'polite'
    });
    instructions.textContent = 'Use arrow keys or j/k to navigate between cells. Press Enter or Space to toggle cell visibility. Press Ctrl+Shift+C to copy cell content.';
    this.element.insertBefore(instructions, this.element.firstChild);
  }

  /**
   * Setup entry animations
   */
  setupAnimations() {
    if (!this.preferences.animationsEnabled) return;

    // Stagger cell entrance animations
    Array.from(this.cells.values()).forEach((cell, index) => {
      cell.element.style.animationDelay = `${index * this.options.cellAnimationDelay}ms`;
    });
  }

  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      const state = {
        collapsedCells: Array.from(this.preferences.collapsedCells),
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('NotebookViewer: Failed to save state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadStoredState() {
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (!stored) return;
      
      const state = JSON.parse(stored);
      
      // Apply collapsed states
      if (state.collapsedCells) {
        state.collapsedCells.forEach(cellId => {
          if (this.cells.has(cellId)) {
            this.collapseCell(cellId);
          }
        });
      }
    } catch (error) {
      console.warn('NotebookViewer: Failed to load state:', error);
    }
  }

  /**
   * Utility: Create element with attributes
   */
  createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    return element;
  }

  /**
   * Get cell type icon SVG
   */
  getCellTypeIcon(type) {
    const icons = {
      markdown: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7.5L5.5 8.92 3.5 11H2l2.5-3.5L2 4h1.5l2 2.08L7.5 4H9l-2.5 3.5L9 11zm5 0h-1.5V6.25L11.25 8 10 6.25V11H8.5V4H10l1.25 1.75L12.5 4H14v7z"/></svg>`,
      code: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.72 9.47L1.25 6l3.47-3.47a.75.75 0 00-1.06-1.06L.19 4.94a1.25 1.25 0 000 1.76l3.47 3.47a.75.75 0 101.06-1.06zm6.56 0L14.75 6l-3.47-3.47a.75.75 0 111.06-1.06l3.47 3.47a1.25 1.25 0 010 1.76l-3.47 3.47a.75.75 0 01-1.06-1.06z"/></svg>`,
      raw: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.25A.75.75 0 018.75 4h.5a.75.75 0 01.75.75v2.5a.75.75 0 01-.75.75h-.5A.75.75 0 017 7.25v-3zm1 7.25a1 1 0 100-2 1 1 0 000 2z"/></svg>`
    };
    
    return icons[type] || icons.markdown;
  }

  /**
   * Get cell type label
   */
  getCellTypeLabel(type) {
    const labels = {
      markdown: 'Markdown',
      code: 'Code',
      raw: 'Raw'
    };
    
    return labels[type] || 'Cell';
  }

  /**
   * Get copy icon SVG
   */
  getCopyIcon() {
    return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>`;
  }

  /**
   * Get toggle icon SVG
   */
  getToggleIcon() {
    return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 00.707-.707l-4-4a.5.5 0 00-.707 0l-4 4a.5.5 0 10.707.707z"/></svg>`;
  }

  /**
   * Get component statistics
   */
  getStats() {
    return {
      cellCount: this.cells.size,
      collapsedCount: this.preferences.collapsedCells.size,
      cellTypes: Array.from(this.cells.values()).reduce((acc, cell) => {
        acc[cell.type] = (acc[cell.type] || 0) + 1;
        return acc;
      }, {}),
      notebookId: this.getNotebookId()
    };
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