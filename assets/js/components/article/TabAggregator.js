import ComponentManager, { Component } from '../../core/ComponentManager.js';

// Aggregates multiple tab-item blocks into one article-tabs container per group
class TabAggregator extends Component {
  constructor(config = {}) {
    super({ name: 'tab-aggregator', selector: '[data-component="tab-item"]', ...config });
    this.isSingleton = false;
  }

  // Override to avoid mutating source tab items' data-component attribute
  setupElements() {
    // no-op: we don't want to change [data-component="tab-item"] to tab-aggregator
    this.element = null;
  }

  async onInit() {
    // Work on all tab items in the document once
    const items = Array.from(document.querySelectorAll('[data-component="tab-item"]'));
    if (items.length === 0) return;

    // Group items by data-group
    const groups = new Map();
    items.forEach(item => {
      const group = (item.getAttribute('data-group') || 'default').toLowerCase();
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(item);
    });

    // For each group, build a single article-tabs container before the first item
    groups.forEach((groupItems, groupName) => {
      // Skip if already aggregated (per group)
      const first = groupItems[0];
      if (document.querySelector(`[data-component="article-tabs"][data-tab-group="${groupName}"]`)) return;

      const container = document.createElement('section');
      container.className = 'tabs';
      container.setAttribute('data-component', 'article-tabs');
      container.setAttribute('data-tab-group', groupName);

      // Optional variant from first item: data-variant
      const variant = first.getAttribute('data-variant');
      // Default visuals are header-aligned; support opt-out variants
      if (variant === 'subtle') {
        container.classList.add('tabs--subtle');
      }
      if (variant === 'brand-active') {
        container.classList.add('tabs--brand-active');
      }

      const tabId = `tabs-${groupName}`;
      const buttons = document.createElement('div');
      buttons.className = 'tabs__nav';
      buttons.setAttribute('data-tab-id', tabId);

      const contents = document.createElement('div');
      contents.className = 'tabs__content';

      // Build buttons and content blocks
      groupItems.forEach((item, index) => {
        const label = item.getAttribute('data-label') || `Tab ${index+1}`;
        const isActive = item.getAttribute('data-active') === 'true' || (index === 0);
        const key = `${tabId}/${label.toLowerCase().replace(/\s+/g, '-')}`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-tab-option', key);
        btn.className = `tabs__button ${isActive ? 'bg-brand' : ''}`;
        btn.textContent = label;
        buttons.appendChild(btn);

        const content = document.createElement('div');
        content.className = `tabs__panel${isActive ? ' is-active' : ''}`;
        content.setAttribute('data-tabcontent', key);
        // Move item's inner HTML into content
        content.innerHTML = item.innerHTML;
        contents.appendChild(content);
      });

      container.appendChild(buttons);
      container.appendChild(contents);

      // Insert container before first item and remove originals
      first.parentNode.insertBefore(container, first);
      groupItems.forEach(item => item.remove());
    });
  }
}

ComponentManager.register('tab-aggregator', TabAggregator, { autoInit: true });

export default TabAggregator;


