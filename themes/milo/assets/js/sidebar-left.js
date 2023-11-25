document.addEventListener("DOMContentLoaded", function () {
  var activeLink = document.querySelector('[data-current="true"]');

  // Function to scroll to the link with a delay
  function scrollToLink(link) {
    if (link) {
      setTimeout(function () {
        link.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }, 300);
    }
  }

  scrollToLink(activeLink);

  var links = document.querySelectorAll("a[data-level]");
  var currentUrl = window.location.href;

  // Function to handle the visibility of nested lists
  function handleVisibility() {
    // Initially hide all levels greater than 2
    links.forEach(function (link) {
      var level = parseInt(link.getAttribute("data-level"));
      if (level > 1) {
        link.closest("li").classList.add("hidden");
      }
    });

    links.forEach(function (link) {
      if (link.href === currentUrl) {
        link.classList.add("text-brand");

        // Unhide all ancestor li elements
        var ancestor = link.closest("li");
        while (ancestor) {
          if (ancestor.tagName.toLowerCase() === "li") {
            ancestor.classList.remove("hidden");
          }
          ancestor = ancestor.parentElement;
        }

        // Unhide direct siblings at the same level
        var parentLi = link.closest("li");
        var siblingLis = Array.from(parentLi.parentElement.children).filter(
          function (child) {
            return child !== parentLi;
          }
        );
        siblingLis.forEach(function (siblingLi) {
          siblingLi.classList.remove("hidden");
        });
      }
    });
  }

  // Call the handleVisibility function
  handleVisibility();
});