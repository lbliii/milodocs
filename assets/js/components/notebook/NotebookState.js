/**
 * NotebookState Component
 * Handles state management and persistence for notebook viewer
 */

import { Component } from '../../core/ComponentManager.js';
import { localStorage } from '../../utils/index.js';
import { announceToScreenReader } from '../../utils/accessibility.js';

export class NotebookState extends Component {
  constructor(config = {}) {
    super({
      name: 'notebook-state',
      selector: config.selector || '.notebook',
      ...config
    });
  }

  /**
   * Save notebook state to localStorage
   */
  static saveState(storageKey, collapsedCells) {
    try {
      const state = {
        collapsedCells: Array.from(collapsedCells),
        timestamp: Date.now()
      };
      
      localStorage.set(storageKey, state);
    } catch (error) {
      console.warn('NotebookState: Failed to save state:', error);
    }
  }

  /**
   * Load notebook state from localStorage
   */
  static loadStoredState(storageKey, cells, collapseCell) {
    try {
      const state = localStorage.get(storageKey);
      if (!state) return;
      
      // Apply collapsed states
      if (state.collapsedCells) {
        state.collapsedCells.forEach(cellId => {
          if (cells.has(cellId)) {
            collapseCell(cellId, false); // false = don't save state again
          }
        });
      }
    } catch (error) {
      console.warn('NotebookState: Failed to load state:', error);
    }
  }

  /**
   * Toggle cell collapsed state
   */
  static toggleCell(cellId, cells, preferences, saveState, emit) {
    const cell = cells.get(cellId);
    if (!cell) return;

    const isCollapsed = cell.collapsed;
    
    if (isCollapsed) {
      NotebookState.expandCell(cellId, cells, preferences, saveState, emit);
    } else {
      NotebookState.collapseCell(cellId, cells, preferences, saveState, emit);
    }
  }

  /**
   * Collapse cell
   */
  static collapseCell(cellId, cells, preferences, saveState, emit, shouldSave = true) {
    const cell = cells.get(cellId);
    if (!cell || cell.collapsed) return;

    cell.collapsed = true;
    preferences.collapsedCells.add(cellId);
    
    const { element } = cell;
    element.classList.add('notebook-cell--collapsed');
    
    const header = element.querySelector('.notebook-cell__header');
    header.setAttribute('aria-expanded', 'false');
    
    announceToScreenReader('Cell collapsed');
    
    if (shouldSave) {
      saveState();
    }
    
    emit('notebook:cell-collapsed', { cellId });
  }

  /**
   * Expand cell
   */
  static expandCell(cellId, cells, preferences, saveState, emit, shouldSave = true) {
    const cell = cells.get(cellId);
    if (!cell || !cell.collapsed) return;

    cell.collapsed = false;
    preferences.collapsedCells.delete(cellId);
    
    const { element } = cell;
    element.classList.remove('notebook-cell--collapsed');
    
    const header = element.querySelector('.notebook-cell__header');
    header.setAttribute('aria-expanded', 'true');
    
    announceToScreenReader('Cell expanded');
    
    if (shouldSave) {
      saveState();
    }
    
    emit('notebook:cell-expanded', { cellId });
  }

  /**
   * Toggle all cells
   */
  static toggleAllCells(cells, preferences, saveState, emit) {
    const hasCollapsed = preferences.collapsedCells.size > 0;
    
    if (hasCollapsed) {
      NotebookState.expandAllCells(cells, preferences, saveState, emit);
    } else {
      NotebookState.collapseAllCells(cells, preferences, saveState, emit);
    }
  }

  /**
   * Expand all cells
   */
  static expandAllCells(cells, preferences, saveState, emit) {
    Array.from(cells.keys()).forEach(cellId => {
      NotebookState.expandCell(cellId, cells, preferences, () => {}, emit, false);
    });
    
    // Save state once after all operations
    saveState();
    
    announceToScreenReader('All cells expanded');
    emit('notebook:all-cells-expanded');
  }

  /**
   * Collapse all cells
   */
  static collapseAllCells(cells, preferences, saveState, emit, shouldMakeCollapsible) {
    Array.from(cells.keys()).forEach(cellId => {
      const cell = cells.get(cellId);
      if (shouldMakeCollapsible(cell.type)) {
        NotebookState.collapseCell(cellId, cells, preferences, () => {}, emit, false);
      }
    });
    
    // Save state once after all operations
    saveState();
    
    announceToScreenReader('All cells collapsed');
    emit('notebook:all-cells-collapsed');
  }

  /**
   * Get notebook statistics
   */
  static getStats(cells, preferences, notebookId) {
    return {
      cellCount: cells.size,
      collapsedCount: preferences.collapsedCells.size,
      cellTypes: Array.from(cells.values()).reduce((acc, cell) => {
        acc[cell.type] = (acc[cell.type] || 0) + 1;
        return acc;
      }, {}),
      notebookId: notebookId
    };
  }

  /**
   * Reset notebook state
   */
  static resetState(cells, preferences, saveState, emit) {
    // Expand all cells
    Array.from(cells.keys()).forEach(cellId => {
      const cell = cells.get(cellId);
      if (cell && cell.collapsed) {
        NotebookState.expandCell(cellId, cells, preferences, () => {}, emit, false);
      }
    });
    
    // Clear preferences
    preferences.collapsedCells.clear();
    
    // Save cleared state
    saveState();
    
    announceToScreenReader('Notebook state reset');
    emit('notebook:state-reset');
  }

  /**
   * Get cell by ID
   */
  static getCell(cellId, cells) {
    return cells.get(cellId);
  }

  /**
   * Get all collapsed cells
   */
  static getCollapsedCells(preferences) {
    return Array.from(preferences.collapsedCells);
  }

  /**
   * Get all expanded cells
   */
  static getExpandedCells(cells, preferences) {
    return Array.from(cells.keys()).filter(cellId => 
      !preferences.collapsedCells.has(cellId)
    );
  }

  /**
   * Check if cell is collapsed
   */
  static isCellCollapsed(cellId, preferences) {
    return preferences.collapsedCells.has(cellId);
  }

  /**
   * Check if all cells are collapsed
   */
  static areAllCellsCollapsed(cells, preferences) {
    const collapsibleCells = Array.from(cells.values()).filter(cell => 
      NotebookState.shouldMakeCollapsible(cell.type)
    );
    
    return collapsibleCells.every(cell => 
      preferences.collapsedCells.has(cell.cellId)
    );
  }

  /**
   * Check if all cells are expanded
   */
  static areAllCellsExpanded(preferences) {
    return preferences.collapsedCells.size === 0;
  }

  /**
   * Determine if cell type should be collapsible
   */
  static shouldMakeCollapsible(cellType) {
    // All cell types can be collapsible by default
    return true;
  }

  /**
   * Create state snapshot for undo/redo functionality
   */
  static createSnapshot(cells, preferences) {
    return {
      collapsedCells: new Set(preferences.collapsedCells),
      cellStates: new Map(Array.from(cells.entries()).map(([id, cell]) => [
        id, 
        { 
          collapsed: cell.collapsed,
          type: cell.type,
          index: cell.index
        }
      ])),
      timestamp: Date.now()
    };
  }

  /**
   * Restore from state snapshot
   */
  static restoreSnapshot(snapshot, cells, preferences, saveState, emit) {
    if (!snapshot) return false;

    try {
      // Restore collapsed cells set
      preferences.collapsedCells = new Set(snapshot.collapsedCells);
      
      // Restore individual cell states
      snapshot.cellStates.forEach((cellState, cellId) => {
        const cell = cells.get(cellId);
        if (cell) {
          const shouldBeCollapsed = snapshot.collapsedCells.has(cellId);
          
          if (shouldBeCollapsed && !cell.collapsed) {
            NotebookState.collapseCell(cellId, cells, preferences, () => {}, emit, false);
          } else if (!shouldBeCollapsed && cell.collapsed) {
            NotebookState.expandCell(cellId, cells, preferences, () => {}, emit, false);
          }
        }
      });
      
      // Save restored state
      saveState();
      
      announceToScreenReader('Notebook state restored');
      emit('notebook:state-restored', { snapshot });
      
      return true;
    } catch (error) {
      console.error('NotebookState: Failed to restore snapshot:', error);
      return false;
    }
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('notebook-state', NotebookState);