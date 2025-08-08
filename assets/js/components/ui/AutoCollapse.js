import { Collapse } from './Collapse.js';
import ComponentManager from '../../core/ComponentManager.js';

class AutoCollapse extends Collapse {
  constructor(config = {}) {
    super({
      name: 'collapse-auto',
      selector: config.selector || '.collapse__header',
      ...config
    });
    // Persist state by default for auto collapse
    this.options.storeState = false;
  }
}

ComponentManager.register('collapse-auto', AutoCollapse);

export default AutoCollapse;

