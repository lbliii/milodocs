document.addEventListener("DOMContentLoaded", function() {
    const collapseToggles = document.querySelectorAll('.toggle-collapse');

    collapseToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Toggle visibility of the content
            const content = this.nextElementSibling;
            content.classList.toggle('hidden');

            // Rotate the SVG chevron
            const chevron = this.querySelector('.chevron');
            if (chevron) {
                chevron.classList.toggle('rotate-90');
            }
        });
    });
});