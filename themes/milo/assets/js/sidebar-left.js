document.addEventListener("DOMContentLoaded", function () {
  var activeLink = document.querySelector('[data-current="true"]');

  // Function to scroll to the link with a delay
    function scrollToLink(link) {
        setTimeout(function () {
            link.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
            });
        }, 300);
        }

    scrollToLink(activeLink)
});
