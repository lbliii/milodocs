import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';

class LanguageSwitcher extends Component {
  constructor(config = {}) {
    super({
      name: 'language-switcher',
      selector: config.selector || '#language-menu-button[data-component="language-switcher"]',
      ...config
    });
  }

  onInit() {
    const button = this.element;
    const menu = document.getElementById('language-menu');
    if (!button || !menu) return;

    const toggle = () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
      menu.classList.toggle('hidden');
    };

    const onClickOutside = (event) => {
      if (!button.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
      }
    };

    this.addEventListener(button, 'click', toggle);
    this.addEventListener(document, 'click', onClickOutside);
    this.addEventListener(button, 'keydown', (e) => {
      if (e.key === 'Escape') {
        menu.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

ComponentManager.register('language-switcher', LanguageSwitcher);

export default LanguageSwitcher;

