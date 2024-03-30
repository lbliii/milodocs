document.addEventListener("DOMContentLoaded", function() {
  const sidebar = document.getElementById('linkTree');

  function setInitialVisibility() {
      // Initially hide all ul elements of level 3 and higher
      sidebar.querySelectorAll('ul[data-level]').forEach(function(ul) {
          const level = parseInt(ul.getAttribute('data-level'));
          if (level > 2) {
              ul.style.display = 'none';
          }
      });
  }

  function highlightAndRevealPath() {
    const activeLinks = sidebar.querySelectorAll('a[data-current="true"]');
    activeLinks.forEach(link => {
        // Highlight the active link
        link.classList.add('text-brand');

        let element = link.parentElement;
        while (element && element !== sidebar) {
            if (element.tagName.toLowerCase() === 'ul') {
                const level = parseInt(element.getAttribute('data-level'));
                element.style.display = 'block'; // Make sure the list is visible

                // Dynamically determine the next level based on the current one and show it
                const nextLevel = level + 1;
                const parentLi = link.closest('li');
                const nextLevelUl = parentLi.querySelector(`ul[data-level="${nextLevel}"]`);
                if (nextLevelUl) {
                    nextLevelUl.style.display = 'block';
                }
            }
            element = element.parentElement;
        }
    });
}

  function scrollToActiveLink() {
      const activeLink = sidebar.querySelector('a[data-current="true"]');
      if (activeLink) {
          // Calculate the position to scroll to in the sidebar
          const topPos = activeLink.offsetTop;
          sidebar.scrollTop = topPos - sidebar.offsetTop - 20; // Adjusted to improve viewability
      }
  }

  setInitialVisibility();
  highlightAndRevealPath();
  scrollToActiveLink();
});
