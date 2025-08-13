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
    const isOffline = (window.HugoEnvironment && window.HugoEnvironment.environment === 'offline');
    const tryLoad = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    try {
      if (isOffline) {
        // Expect a locally vendored mermaid at static/vendor/mermaid/mermaid.min.js
        const localSrc = new URL('vendor/mermaid/mermaid.min.js', document.baseURI).toString();
        await tryLoad(localSrc);
      } else {
        await tryLoad('https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js');
      }
    } catch {
      // Final fallback: skip rendering if not available
      console.warn('Mermaid: failed to load script. Diagrams will not render.');
    }
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

