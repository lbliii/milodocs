document.addEventListener("DOMContentLoaded", function(event) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const moon = document.getElementById('moon');
  const sun = document.getElementById('sun');
  const lightModeHome = document.getElementById('lightModeHome');
  const darkModeHome = document.getElementById('darkModeHome');

  // Initialize inMemoryStorage with a default theme-mode of 'light'
  let inMemoryStorage = {
      'theme-mode': 'light'
  };

  // Check if localStorage is available and writable
  function isLocalStorageAvailable() {
      try {
          const testKey = '__storage_test__';
          localStorage.setItem(testKey, testKey);
          localStorage.removeItem(testKey);
          console.log('localStorage is available for theme features');
          return true;
      } catch (e) {
          console.log('localStorage is not available for theme features');
          return false;
      }
  }

  // Safe wrapper for accessing storage
  const storage = isLocalStorageAvailable() ? localStorage : inMemoryStorage;

  function safeGetItem(key) {
      return typeof storage.getItem === 'function' ? storage.getItem(key) : storage[key];
  }

  function safeSetItem(key, value) {
      if (typeof storage.setItem === 'function') {
          storage.setItem(key, value);
      } else {
          storage[key] = value;
      }
  }

  // Load saved theme preference
  const savedTheme = safeGetItem('theme-mode');
  if (savedTheme && savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
  } else {
      document.documentElement.classList.remove('dark');
  }
  updateButtonText();

  darkModeToggle.addEventListener('click', () => {
      const isDarkMode = document.documentElement.classList.toggle('dark');
      safeSetItem('theme-mode', isDarkMode ? 'dark' : 'light');
      updateButtonText();
  });

  function updateButtonText() {
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (!isDarkMode) {
          moon.classList.add('hidden');
          sun.classList.remove('hidden');
          if (lightModeHome) lightModeHome.classList.remove('hidden');
          if (darkModeHome) darkModeHome.classList.add('hidden');
      } else {
          moon.classList.remove('hidden');
          sun.classList.add('hidden');
          if (lightModeHome) lightModeHome.classList.add('hidden');
          if (darkModeHome) darkModeHome.classList.remove('hidden');
      }
  }
}); 