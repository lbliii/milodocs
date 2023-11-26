
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.glossary-entry');
    const positions = { x: 50, y: 50 }; // Default to center

    function animate() {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const mouseX = (positions.x - rect.left) / rect.width * 100;
            const mouseY = (positions.y - rect.top) / rect.height * 100;
            card.style.background = `radial-gradient(circle at ${mouseX}% ${mouseY}%, var(--primary-gradient-color), var(--secondary-gradient-color))`;
        });
        requestAnimationFrame(animate);
    }

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Update gradient position
            positions.x = e.clientX;
            positions.y = e.clientY;
        });
        
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-10px) scale(1.05)';
            card.style.boxShadow = '0 20px 30px #00000033';
        });
        
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0) scale(1.0)';
            card.style.boxShadow = '';
        });
    });

    animate();
});
