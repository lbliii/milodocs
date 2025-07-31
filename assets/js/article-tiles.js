document.addEventListener("DOMContentLoaded", () => {
  const tiles = document.querySelectorAll(".tile");
  
  if (tiles.length > 0) {
    const globalPosition = { x: 50, y: 50 }; // Default to center
    let animationId;
    
    function updateGradients() {
      tiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        // Calculate relative mouse position for this tile
        const mouseX = Math.max(0, Math.min(100, ((globalPosition.x - rect.left) / rect.width) * 100));
        const mouseY = Math.max(0, Math.min(100, ((globalPosition.y - rect.top) / rect.height) * 100));
        
        // Enhanced gradient with better color transitions
        tile.style.background = `
          radial-gradient(
            600px circle at ${mouseX}% ${mouseY}%, 
            var(--primary-gradient-color), 
            var(--secondary-gradient-color)
          )
        `;
      });
      animationId = requestAnimationFrame(updateGradients);
    }

    // Global mouse tracking for smoother experience
    document.addEventListener("mousemove", (e) => {
      globalPosition.x = e.clientX;
      globalPosition.y = e.clientY;
    });

    tiles.forEach((tile) => {
      // Enhanced hover effects - more subtle than original
      tile.addEventListener("mouseenter", () => {
        tile.style.transform = "translateY(-8px) scale(1.02)";
        tile.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      });

      tile.addEventListener("mouseleave", () => {
        tile.style.transform = "translateY(0) scale(1.0)";
      });
      
      // Smooth entry animation
      tile.style.opacity = "0";
      tile.style.transform = "translateY(20px)";
      setTimeout(() => {
        tile.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        tile.style.opacity = "1";
        tile.style.transform = "translateY(0)";
      }, Math.random() * 200); // Staggered animation
    });

    // Start the gradient animation
    updateGradients();
    
    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  }
});
