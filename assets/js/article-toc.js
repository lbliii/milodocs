document.addEventListener("DOMContentLoaded", () => {
  // Get all TOC links
  const tocLinks = document.querySelectorAll("#TableOfContents a");

  // Function to highlight the currently viewed section
  function highlightInView() {
    const sections = document.querySelectorAll("h2, h3"); // You may need to adjust the selector based on your HTML structure

    // Define the top offset (50px in this example)
    const offset = 50;

    // Loop through the sections to find the currently viewed one
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      // Adjust the condition with the offset
      if (
        rect.top + offset >= 0 &&
        rect.bottom <= window.innerHeight + offset
      ) {
        // Section is in view
        const sectionId = section.id;
        tocLinks.forEach((link) => {
          if (link.getAttribute("href").substring(1) === sectionId) {
            // Remove the highlight class from all TOC links
            tocLinks.forEach((tocLink) => {
              tocLink.classList.remove("text-brand");
            });
            // Add the highlight class to the currently viewed TOC link
            link.classList.add("text-brand");
          }
        });
      }
    });
  }

  // Initialize reading progress functionality if enabled
  initializeReadingProgress();

  // Attach the scroll event listener to the window
  window.addEventListener("scroll", highlightInView);
});

// Reading progress functionality
function initializeReadingProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar && progressText) {
    function updateProgress() {
      const article = document.querySelector('#articleContent');
      if (!article) return;
      
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      const progress = Math.min(100, Math.max(0, 
        ((scrollTop + windowHeight - articleTop) / articleHeight) * 100
      ));
      
      progressBar.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '%';
    }
    
    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
  }
}
