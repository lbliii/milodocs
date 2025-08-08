import { Component } from '../../core/Component.js';
import ComponentManager from '../../core/ComponentManager.js';

class VideoComponent extends Component {
  constructor(config = {}) {
    super({
      name: 'video-player',
      selector: config.selector || '.video-container .player-wrapper',
      ...config
    });
  }

  async onInit() {
    const wrappers = this.findElements();
    wrappers.forEach((wrapper) => this.observeWrapper(wrapper));
  }

  observeWrapper(wrapper) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadPlayer(wrapper);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(wrapper);
  }

  async loadPlayer(wrapper) {
    try {
      const url = wrapper.closest('.video-container')?.querySelector('[data-video-src]')?.dataset?.videoSrc;
      const playerTarget = wrapper;
      const placeholder = wrapper.querySelector('.loading-placeholder');

      const module = await import('https://cdn.jsdelivr.net/npm/@clappr/player@0.4.0/dist/clappr.min.js');
      const Clappr = module.default || module;

      const player = new Clappr.Player({
        source: url,
        autoPlay: false,
        mute: false,
        height: '100%',
        width: '100%',
        responsive: true,
        playback: { preload: 'metadata' }
      });

      player.attachTo(playerTarget);
      player.on(Clappr.Events.PLAYER_READY, () => {
        if (placeholder) {
          placeholder.style.opacity = '0';
          setTimeout(() => placeholder.remove(), 300);
        }
      });
    } catch (error) {
      const url = wrapper.closest('.video-container')?.querySelector('[data-video-src]')?.dataset?.videoSrc || '#';
      wrapper.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Video Error:</strong> Failed to load video player.
          <a href="${url}" class="underline" target="_blank" rel="noopener">View video directly</a>
        </div>`;
    }
  }
}

ComponentManager.register('video-player', VideoComponent);

export default VideoComponent;

