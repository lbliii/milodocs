document.addEventListener("DOMContentLoaded", function (event) {
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme-mode");
  if (savedTheme) {
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    updateButtonText();
  }

  darkModeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "theme-mode",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    updateButtonText();
  });

  function updateButtonText() {
    const isDarkMode = document.documentElement.classList.contains("dark");

    darkModeToggle.innerHTML = isDarkMode
      ? '<img src="/icons/dark.svg">'
      : '<img src="/icons/light.svg">';
  }
});
