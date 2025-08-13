/**
 * Global UI enhancements: ripples, hover effects, form loading states, scroll effects
 */
export async function setupGlobalEnhancements() {
  const { createRipple } = await import('../utils/dom.js');
  const { showLoading, hideLoading } = await import('../utils/LoadingStateManager.js');

  const config = {
    ripples: true,
    hovers: true,
    forms: true,
    scroll: true,
    ...(window.MiloUX || {})
  };

  // Ripple on click for common interactive elements
  if (config.ripples) {
    const clickableElements = document.querySelectorAll(`
    button, .btn, .topbar__button,
    .article-next-prev__link, .breadcrumb__link, .toc-link,
    .quicklinks__link, .quicklinks__item,
    .tile, .card, .resource-card,
    .topbar__logo-link, .dropdown-link,
    .sidebar__link, .sidebar__toggle
  `);
    clickableElements.forEach((element) => {
      element.addEventListener('click', (e) => createRipple(element, e));
    });
  }

  // Subtle hover lift for tiles/cards
  if (config.hovers) {
    const hoverElements = document.querySelectorAll('.tile, .card, .quicklinks__item');
    hoverElements.forEach((element) => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      });
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
      });
    });
  }

  // Form submit loading state
  if (config.forms) {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', function () {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;
        submitButton.disabled = true;
        const originalContent = submitButton.innerHTML;
        submitButton.setAttribute('data-original-content', originalContent);
        const loaderId = showLoading(submitButton, {
          type: 'dots',
          message: 'Processing...',
          size: 'small',
        });
        submitButton.setAttribute('data-loader-id', loaderId);
      });
      form.addEventListener('reset', function () {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;
        const loaderId = submitButton.getAttribute('data-loader-id');
        const originalContent = submitButton.getAttribute('data-original-content');
        if (loaderId) {
          hideLoading(loaderId);
          submitButton.removeAttribute('data-loader-id');
        }
        if (originalContent) {
          submitButton.innerHTML = originalContent;
          submitButton.removeAttribute('data-original-content');
        }
        submitButton.disabled = false;
      });
    });
  }

  // Scroll-based effects
  if (config.scroll) {
    await setupScrollEnhancements();
  }
}

async function setupScrollEnhancements() {
  const { throttle } = await import('../utils/dom.js');
  let lastScrollY = window.scrollY;
  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      document.body.setAttribute('data-scroll-direction', scrollDirection);

      const scrolled = window.pageYOffset;
      document.querySelectorAll('.hero-parallax').forEach((hero) => {
        const parallax = scrolled * 0.5;
        hero.style.transform = `translateY(${parallax}px)`;
      });

      document.querySelectorAll('.fade-in-on-scroll').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add('visible');
        }
      });

      lastScrollY = currentScrollY;
      scheduled = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}

export default setupGlobalEnhancements;

