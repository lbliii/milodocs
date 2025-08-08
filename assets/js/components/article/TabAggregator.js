import ComponentManager, { Component } from '../../core/ComponentManager.js';

// Aggregates multiple tab-item blocks into one article-tabs container per group
class TabAggregator extends Component {
  constructor(config = {}) {
    super({ name: 'tab-aggregator', selector: '[data-component="tab-item"]', ...config });
    this.isSingleton = false;
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
      // Skip if already aggregated
      const first = groupItems[0];
      if (first.closest('[data-component="article-tabs"]')) return;

      const container = document.createElement('section');
      container.className = 'bg-zinc-100 p-2 my-2 rounded-md';
      container.setAttribute('data-component', 'article-tabs');

      const tabId = `tabs-${groupName}`;
      const buttons = document.createElement('div');
      buttons.className = 'flex flex-col md:flex-row ml-1 mt-2 md:space-x-3';
      buttons.setAttribute('data-tab-id', tabId);

      const contents = document.createElement('div');
      contents.className = 'w-full p-2';

      // Build buttons and content blocks
      groupItems.forEach((item, index) => {
        const label = item.getAttribute('data-label') || `Tab ${index+1}`;
        const isActive = item.getAttribute('data-active') === 'true' || (index === 0);
        const key = `${tabId}/${label.toLowerCase().replace(/\s+/g, '-')}`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-tab-option', key);
        btn.className = `px-3 py-2 border rounded ${isActive ? 'bg-brand text-white' : 'bg-white text-black'}`;
        btn.textContent = label;
        buttons.appendChild(btn);

        const content = document.createElement('div');
        content.className = `p-2 mb-2${isActive ? '' : ' hidden'}`;
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


