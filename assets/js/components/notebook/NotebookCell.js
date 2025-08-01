/**
 * NotebookCell Component
 * Handles individual cell management, setup, and rendering
 */

import { Component } from '../../core/ComponentManager.js';
import { CopyManager } from '../../utils/index.js';

export class NotebookCell extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-cell',
      selector: config.selector || '.notebook-cell',
      ...config
    });
  }

  /**
   * Setup individual cell with proper structure and features
   */
  static setupCell(cellElement, index, parentViewer) {
    const cellType = NotebookCell.detectCellType(cellElement);
    const cellId = NotebookCell.generateCellId(cellType, index, parentViewer.getNotebookId());
    
    // Store cell data
    const cellData = {
      element: cellElement,
      type: cellType,
      index: index,
      collapsed: false,
      hasOutput: NotebookCell.hasOutput(cellElement)
    };

    // Add necessary classes and attributes
    cellElement.classList.add('notebook-cell', `notebook-cell--${cellType}`);
    cellElement.setAttribute('data-cell-id', cellId);
    cellElement.setAttribute('data-cell-type', cellType);
    cellElement.setAttribute('data-cell-index', index);
    cellElement.style.setProperty('--cell-index', index);

    // Setup cell header if it doesn't exist
    NotebookCell.ensureCellHeader(cellElement, cellType, cellId);
    
    // Setup cell content wrapper
    NotebookCell.ensureCellContent(cellElement);
    
    // Setup code cells specifically
    if (cellType === 'code') {
      NotebookCell.setupCodeCell(cellElement, cellId);
    }

    // Make collapsible if configured
    if (NotebookCell.shouldMakeCollapsible(cellType)) {
      NotebookCell.makeCollapsible(cellElement, cellId);
    }

    return { cellId, cellData };
  }

  /**
   * Detect cell type from element
   */
  static detectCellType(element) {
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
  static hasOutput(cellElement) {
    return !!(
      cellElement.querySelector('.code-outputs') ||
      cellElement.querySelector('.notebook-cell__outputs') ||
      cellElement.querySelector('[class*="output"]')
    );
  }

  /**
   * Generate unique cell ID
   */
  static generateCellId(type, index, notebookId) {
    return `${notebookId}-${type}-${index}`;
  }

  /**
   * Ensure cell has proper header structure
   */
  static ensureCellHeader(cellElement, cellType, cellId) {
    let header = cellElement.querySelector('.notebook-cell__header');
    
    if (!header) {
      header = NotebookCell.createElement('div', {
        class: 'notebook-cell__header',
        role: 'button',
        tabindex: '0',
        'aria-controls': `${cellId}-content`,
        'aria-expanded': 'true'
      });

      // Cell type indicator
      const typeIndicator = NotebookCell.createElement('div', {
        class: 'notebook-cell__type'
      });
      
      const typeIcon = NotebookCell.createElement('span', {
        class: 'notebook-cell__type-icon',
        'aria-hidden': 'true'
      });
      typeIcon.innerHTML = NotebookCell.getCellTypeIcon(cellType);
      
      const typeText = NotebookCell.createElement('span', {
        class: 'notebook-cell__type-text'
      });
      typeText.textContent = NotebookCell.getCellTypeLabel(cellType);
      
      typeIndicator.appendChild(typeIcon);
      typeIndicator.appendChild(typeText);
      
      // Controls container
      const controls = NotebookCell.createElement('div', {
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
  static ensureCellContent(cellElement) {
    let content = cellElement.querySelector('.notebook-cell__content');
    
    if (!content) {
      content = NotebookCell.createElement('div', {
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
  static setupCodeCell(cellElement, cellId) {
    const codeContent = cellElement.querySelector('pre, .highlight, .notebook-cell__code-content');
    
    if (codeContent) {
      // Wrap code content if needed
      if (!codeContent.closest('.notebook-cell__code-container')) {
        const codeContainer = NotebookCell.createElement('div', {
          class: 'notebook-cell__code-container'
        });
        
        const parent = codeContent.parentNode;
        parent.insertBefore(codeContainer, codeContent);
        codeContainer.appendChild(codeContent);
      }

      // Add copy button
      NotebookCell.addCopyButton(codeContent, cellId);
      
      // Setup execution count if present
      NotebookCell.setupExecutionCount(cellElement);
    }

    // Setup outputs
    NotebookCell.setupOutputs(cellElement);
  }

  /**
   * Add copy button to code content
   */
  static addCopyButton(codeContent, cellId) {
    // Remove existing copy buttons to avoid duplicates
    const existingBtn = codeContent.parentNode.querySelector('.notebook-cell__copy-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    const copyBtn = NotebookCell.createElement('button', {
      class: 'notebook-cell__copy-btn',
      type: 'button',
      'aria-label': 'Copy code to clipboard',
      'data-cell-id': cellId
    });

    const copyIcon = NotebookCell.createElement('span', {
      class: 'notebook-cell__copy-icon',
      'aria-hidden': 'true'
    });
    copyIcon.innerHTML = NotebookCell.getCopyIcon();

    const copyText = NotebookCell.createElement('span', {
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
  static setupExecutionCount(cellElement) {
    const existingCount = cellElement.querySelector('.execution-count, .notebook-cell__execution-count');
    
    if (existingCount && !existingCount.classList.contains('notebook-cell__execution-count')) {
      existingCount.classList.add('notebook-cell__execution-count');
    }
  }

  /**
   * Setup cell outputs
   */
  static setupOutputs(cellElement) {
    const outputsContainer = cellElement.querySelector('.code-outputs, .notebook-cell__outputs');
    
    if (outputsContainer) {
      outputsContainer.classList.add('notebook-cell__outputs');
      
      // Process individual outputs
      const outputs = outputsContainer.querySelectorAll('[class*="output"], .stream-output, .execute-result, .display-data, .error-output');
      
      outputs.forEach(output => {
        NotebookCell.setupOutput(output);
      });
    }
  }

  /**
   * Setup individual output
   */
  static setupOutput(output) {
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
  static makeCollapsible(cellElement, cellId) {
    cellElement.classList.add('notebook-cell--collapsible');
    
    const header = cellElement.querySelector('.notebook-cell__header');
    const controls = header.querySelector('.notebook-cell__controls');
    
    // Add toggle button
    const toggleBtn = NotebookCell.createElement('button', {
      class: 'notebook-cell__toggle',
      type: 'button',
      'aria-label': 'Toggle cell visibility',
      'data-cell-id': cellId
    });

    const toggleIcon = NotebookCell.createElement('span', {
      class: 'notebook-cell__toggle-icon',
      'aria-hidden': 'true'
    });
    toggleIcon.innerHTML = NotebookCell.getToggleIcon();

    toggleBtn.appendChild(toggleIcon);
    controls.appendChild(toggleBtn);

    // Make header clickable
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'true');
  }

  /**
   * Handle copy operation for cell
   */
  static async handleCopyClick(button, cell, cleanNotebookCode, emitCallback) {
    const cellId = button.dataset.cellId;
    
    if (!cell) {
      console.error('NotebookCell: Cell not found for copy operation');
      return;
    }

    const result = await CopyManager.copy(cell.element, {
      successMessage: '✅ Copied!',
      errorMessage: '❌ Failed',
      feedbackDuration: 2000,
      preprocessText: (text) => cleanNotebookCode(text),
      analytics: {
        component: 'notebook-viewer',
        cellId,
        cellType: cell.type
      },
      onSuccess: (content) => {
        emitCallback('notebook:copy-success', { cellId, content });
      },
      onError: (error) => {
        emitCallback('notebook:copy-error', { cellId, error });
      }
    });

    return result;
  }

  /**
   * Clean notebook code for copying (notebook-specific preprocessing)
   */
  static cleanNotebookCode(text) {
    if (!text) return '';
    
    return text
      .replace(/^In \[\d*\]:\s*/gm, '')  // Remove input prompts
      .replace(/^Out\[\d*\]:\s*/gm, '')  // Remove output prompts  
      .replace(/^\s*[\r\n]/gm, '')       // Remove empty lines
      .trim();
  }

  /**
   * Determine if cell type should be collapsible
   */
  static shouldMakeCollapsible(cellType) {
    // All cell types can be collapsible by default
    return true;
  }

  /**
   * Utility: Create element with attributes
   */
  static createElement(tag, attributes = {}) {
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
  static getCellTypeIcon(type) {
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
  static getCellTypeLabel(type) {
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
  static getCopyIcon() {
    return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>`;
  }

  /**
   * Get toggle icon SVG
   */
  static getToggleIcon() {
    return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 00.707-.707l-4-4a.5.5 0 00-.707 0l-4 4a.5.5 0 10.707.707z"/></svg>`;
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('notebook-cell', NotebookCell);