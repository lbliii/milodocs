/**
 * NotebookNavigation Component
 * Handles keyboard navigation and focus management for notebook cells
 */

import { Component } from '../../core/Component.js';
import { announceToScreenReader } from '../../utils/accessibility.js';

export class NotebookNavigation extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-navigation',
      selector: config.selector || '.notebook',
      ...config
    });
    // Event cleanup now handled automatically by AbortController
  }

  /**
   * Setup keyboard navigation for notebook cells
   */
  static setupKeyboardNavigation(parentElement, cells, addEventListener) {
    const cellElements = Array.from(cells.values()).map(cell => cell.element);
    
    cellElements.forEach((cell, index) => {
      const header = cell.querySelector('.notebook-cell__header');
      if (header) {
        header.setAttribute('tabindex', index === 0 ? '0' : '-1');
        
        addEventListener(header, 'keydown', (e) => {
          NotebookNavigation.handleCellNavigation(e, index, cellElements);
        });
        // No cleanup needed - AbortController handles everything automatically
      }
    });
  }

  /**
   * Handle cell-to-cell navigation
   */
  static handleCellNavigation(e, currentIndex, cells) {
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
      
      // Announce to screen readers
      const cellType = cells[newIndex].dataset.cellType;
      const cellIndex = cells[newIndex].dataset.cellIndex;
      announceToScreenReader(`Navigated to ${cellType} cell ${parseInt(cellIndex) + 1}`);
    }
  }

  /**
   * Handle global keyboard shortcuts for notebook
   */
  static handleGlobalKeydown(e, getFocusedCell, handleCopyForCell, toggleAllCells) {
    // Ctrl/Cmd + Shift + C: Copy current cell
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      const focusedCell = getFocusedCell();
      if (focusedCell) {
        const copyBtn = focusedCell.querySelector('.notebook-cell__copy-btn');
        if (copyBtn) {
          handleCopyForCell(copyBtn);
        }
      }
    }

    // Ctrl/Cmd + Shift + E: Expand/collapse all cells
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      toggleAllCells();
    }
  }

  /**
   * Get currently focused cell
   */
  static getFocusedCell() {
    const activeElement = document.activeElement;
    return activeElement?.closest('.notebook-cell');
  }

  /**
   * Initialize accessibility features for notebook
   */
  static initializeAccessibility(element, cellCount) {
    // Add ARIA labels and landmarks
    element.setAttribute('role', 'main');
    element.setAttribute('aria-label', 'Jupyter Notebook');
    
    // Add cell count to screen readers
    announceToScreenReader(`Notebook loaded with ${cellCount} cells`);
    
    // Add instructions for screen readers
    const instructions = document.createElement('div');
    instructions.className = 'sr-only';
    instructions.setAttribute('aria-live', 'polite');
    instructions.textContent = 'Use arrow keys or j/k to navigate between cells. Press Enter or Space to toggle cell visibility. Press Ctrl+Shift+C to copy cell content.';
    element.insertBefore(instructions, element.firstChild);
    
    return instructions;
  }

  /**
   * Setup cell visibility animations with staggered entrance
   */
  static setupAnimations(cells, animationDelay = 100, animationsEnabled = true) {
    if (!animationsEnabled) return;

    // Stagger cell entrance animations
    Array.from(cells.values()).forEach((cell, index) => {
      cell.element.style.animationDelay = `${index * animationDelay}ms`;
    });
  }

  /**
   * Focus specific cell by index
   */
  static focusCell(cellIndex, cells) {
    const cellElements = Array.from(cells.values()).map(cell => cell.element);
    
    if (cellIndex >= 0 && cellIndex < cellElements.length) {
      const targetCell = cellElements[cellIndex];
      const header = targetCell.querySelector('.notebook-cell__header');
      
      if (header) {
        // Update tabindex for all cells
        cellElements.forEach((cell, index) => {
          const cellHeader = cell.querySelector('.notebook-cell__header');
          if (cellHeader) {
            cellHeader.setAttribute('tabindex', index === cellIndex ? '0' : '-1');
          }
        });
        
        // Focus the target cell
        header.focus();
        
        // Scroll into view if needed
        targetCell.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Focus first cell
   */
  static focusFirstCell(cells) {
    return NotebookNavigation.focusCell(0, cells);
  }

  /**
   * Focus last cell
   */
  static focusLastCell(cells) {
    const cellCount = cells.size;
    return NotebookNavigation.focusCell(cellCount - 1, cells);
  }

  /**
   * Get next focusable cell index
   */
  static getNextFocusableIndex(currentIndex, cells, direction = 1) {
    const cellElements = Array.from(cells.values()).map(cell => cell.element);
    
    let nextIndex = currentIndex + direction;
    
    // Wrap around if needed
    if (nextIndex >= cellElements.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = cellElements.length - 1;
    }
    
    return nextIndex;
  }

  /**
   * Setup smooth scrolling for cell navigation
   */
  static setupSmoothScrolling(element) {
    // Add CSS scroll behavior if not already set
    if (!element.style.scrollBehavior) {
      element.style.scrollBehavior = 'smooth';
    }
  }


}

// Auto-register component
import ComponentManager from '../../core/ComponentManager.js';
ComponentManager.register('notebook-navigation', NotebookNavigation);