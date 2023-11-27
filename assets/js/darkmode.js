document.addEventListener("DOMContentLoaded", function (event) {
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme-mode");
  if (savedTheme) {
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    updateButtonText();
    updateSectionIcons();
  }

  darkModeToggle.addEventListener("click", () => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !isDarkMode);

    // Update the theme mode and button text
    localStorage.setItem(
      "theme-mode",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    updateButtonText();

    // Update the section icons
    updateSectionIcons();
  });

  function updateButtonText() {
    const isDarkMode = document.documentElement.classList.contains("dark");

    darkModeToggle.innerHTML = isDarkMode
      ? '<img src="/icons/dark.svg" aria-lable="activate lightmode" alt="moon">'
      : '<img src="/icons/light.svg" aria-lable="activate darkmode" alt="sun">';
  }

  function updateSectionIcons() {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const sectionIcons = document.querySelectorAll(".icon");

    sectionIcons.forEach((icon) => {
      const src = icon.getAttribute("src");
      const newSrc = isDarkMode
        ? src.replace("/icons/light/", "/icons/dark/")
        : src.replace("/icons/dark/", "/icons/light/");
      icon.setAttribute("src", newSrc);
    });
  }
});
