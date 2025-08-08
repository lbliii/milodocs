/*
 * Environment-specific font loading state management for NVIDIA env
 */
(function() {
  try {
    if (getComputedStyle(document.documentElement).getPropertyValue('--hugo-environment').includes('nvidia') || document.body.classList.contains('env-nvidia')) {
      document.documentElement.classList.add('fonts-loading');
      if ('fonts' in document) {
        Promise.all([
          document.fonts.load('400 1rem NVIDIA'),
          document.fonts.load('700 1rem NVIDIA')
        ]).then(function() {
          document.documentElement.classList.remove('fonts-loading');
          document.documentElement.classList.add('fonts-loaded');
        }).catch(function() {
          setTimeout(function() {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
          }, 2000);
        });
      } else {
        setTimeout(function() {
          document.documentElement.classList.remove('fonts-loading');
          document.documentElement.classList.add('fonts-loaded');
        }, 1000);
      }
    }
  } catch (e) {}
})();


