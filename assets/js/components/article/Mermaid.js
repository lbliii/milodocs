import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';

class MermaidComponent extends Component {
  constructor(config = {}) {
    super({
      name: 'mermaid-diagram',
      selector: config.selector || '.mermaid',
      ...config
    });
  }

  async onInit() {
    const elements = this.findElements();
    if (!elements.length) return;

    await this.ensureMermaidLoaded();
    await this.renderAll(elements);

    // Re-render on theme changes
    document.addEventListener('themeChanged', () => {
      this.renderAll(elements);
    });
  }

  async ensureMermaidLoaded() {
    if (typeof window.mermaid !== 'undefined') return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async renderAll(elements) {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'neutral';

    window.mermaid.initialize({ theme, startOnLoad: false, securityLevel: 'strict' });
    await window.mermaid.run({ querySelector: '.mermaid' });

    elements.forEach(el => { el.style.opacity = '1'; });
  }
}

ComponentManager.register('mermaid-diagram', MermaidComponent);

export default MermaidComponent;

