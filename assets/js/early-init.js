/*
 * Early initialization script
 * - Replace no-js with js
 * - Apply saved theme immediately to avoid FOUC
 * - Temporarily disable transitions until CSS is loaded
 * - Re-enable transitions when CSS bundle finishes loading (with fallbacks)
 */
(function() {
  try {
    // Mark JS-enabled
    var docEl = document.documentElement;
    docEl.classList.remove('no-js');
    docEl.classList.add('js');

    // Disable transitions during startup
    if (!docEl.classList.contains('no-transitions')) {
      docEl.classList.add('no-transitions');
    }

    // Apply saved theme before CSS paints to prevent flash
    try {
      var saved = localStorage.getItem('theme.mode') || localStorage.getItem('theme-mode');
      if (!saved) {
        // Optional: derive a default from data-theme on <body>
        var body = document.body;
        saved = body && body.dataset && body.dataset.theme ? body.dataset.theme : 'light';
      }
      if (saved === 'dark') {
        docEl.classList.add('dark');
      } else {
        docEl.classList.remove('dark');
      }
    } catch (e) {
      // Fail light by default
      docEl.classList.remove('dark');
    }

    // Helper to re-enable transitions once CSS is definitely applied
    var transitionsEnabled = false;
    function enableTransitions() {
      if (!transitionsEnabled) {
        transitionsEnabled = true;
        docEl.classList.remove('no-transitions');
      }
    }

    // Prefer listening to the CSS link load
    function bindCssLoadListener() {
      var link = document.getElementById('main-css');
      if (link) {
        // Modern browsers emit load for stylesheet links
        link.addEventListener('load', enableTransitions, { once: true });
        return true;
      }
      return false;
    }

    // Try immediately; if link not yet in DOM, try again on DOMContentLoaded
    if (!bindCssLoadListener()) {
      document.addEventListener('DOMContentLoaded', function() {
        // Wait a frame to allow head partials to inject link
        requestAnimationFrame(function() {
          if (!bindCssLoadListener()) {
            // Fallbacks
            setTimeout(enableTransitions, 250);
          }
        });
      });
    }

    // Absolute fallback: always enable by 1s
    setTimeout(enableTransitions, 1000);
  } catch (e) {
    // Never block page render
  }
})();


