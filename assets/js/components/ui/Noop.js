import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';

class NoopComponent extends Component {
  constructor(config = {}) {
    super({ name: config.name || 'noop', selector: config.selector || null, ...config });
  }
  async onInit() { return; }
}

export function registerNoop(name) {
  ComponentManager.register(name, class extends NoopComponent { constructor(cfg={}){ super({ ...cfg, name }); } });
}

export default NoopComponent;


