import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';

class AsciinemaEmbed extends Component {
  constructor(config = {}) {
    super({
      name: 'asciinema-embed',
      selector: config.selector || '.asciinema-embed[data-asciinema-id]',
      ...config
    });
  }

  async onInit() {
    const elements = this.findElements();
    if (!elements.length) return;

    await this.ensureScriptLoaded();
    elements.forEach((el) => this.render(el));
  }

  async ensureScriptLoaded() {
    if (document.querySelector('script[src*="asciinema.org/a/"]')) return;
    // Asciinema embed script expects a specific script include per id normally.
    // Instead, use their generic JS if available; fallback to per-id injection during render.
  }

  render(el) {
    const id = el.getAttribute('data-asciinema-id');
    if (!id) return;
    const script = document.createElement('script');
    script.src = `https://asciinema.org/a/${id}.js`;
    script.id = `asciicast-${id}`;
    script.async = true;
    el.innerHTML = '';
    el.appendChild(script);
  }
}

ComponentManager.register('asciinema-embed', AsciinemaEmbed);

export default AsciinemaEmbed;

