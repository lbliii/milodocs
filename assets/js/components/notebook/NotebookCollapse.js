/**
 * NotebookCollapse Component
 * Initializes collapse/expand behavior for notebook cells using the base Collapse
 * Ensures ARIA and data attributes reflect state for icon rotation and accessibility
 */

import Collapse from '../ui/Collapse.js';
import ComponentManager from '../../core/ComponentManager.js';

class NotebookCollapse extends Collapse {
  constructor(config = {}) {
    super({
      name: 'notebook-collapse',
      selector: config.selector || '.notebook-cell:not(.notebook-cell--markdown) .collapse__header',
      ...config
    });
  }

  async expand(collapseData) {
    const { header, target } = collapseData;
    await super.expand(collapseData);
    const section = header.closest('.collapse');
    if (section) section.setAttribute('data-collapse-state', 'expanded');
    if (target) target.setAttribute('data-collapse-state', 'expanded');
    header.setAttribute('aria-expanded', 'true');
  }

  async collapse(collapseData) {
    const { header, target } = collapseData;
    await super.collapse(collapseData);
    const section = header.closest('.collapse');
    if (section) section.setAttribute('data-collapse-state', 'collapsed');
    if (target) target.setAttribute('data-collapse-state', 'collapsed');
    header.setAttribute('aria-expanded', 'false');
  }
}

// Auto-register component
ComponentManager.register('notebook-collapse', NotebookCollapse);

export default NotebookCollapse;


