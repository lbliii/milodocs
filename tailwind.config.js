/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["content/**/*.md", "layouts/**/*.html", "assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: "var(--color-brand)",
        "brand-1": "var(--color-brand-1)",
        "brand-2": "var(--color-brand-2)",
        "brand-3": "var(--color-brand-3)",
        "brand-4": "var(--color-brand-4)",
        "brand-5": "var(--color-brand-5)",
        "brand-6": "var(--color-brand-6)",
        "brand-7": "var(--color-brand-7)",
      },
      fontFamily: {
        "brand": ["NVIDIA", "Arial", "Helvetica", "sans-serif"],
        "brand-italic": ["NVIDIA", "Arial", "Helvetica", "sans-serif"],
        "nvidia": ["NVIDIA", "Arial", "Helvetica", "sans-serif"],
        "nvidia-mono": ["RobotoMono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

