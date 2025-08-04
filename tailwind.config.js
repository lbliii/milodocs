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
      fontSize: {
        // Override default text sizes for better accessibility
        'xs': ['0.875rem', { lineHeight: '1.4' }], // Increased from 0.75rem
        'sm': ['0.875rem', { lineHeight: '1.5' }], // Keep at 0.875rem
        'base': ['1rem', { lineHeight: '1.6' }], // Enhanced line height
        'lg': ['1.125rem', { lineHeight: '1.75' }], // Keep current
        'xl': ['1.25rem', { lineHeight: '1.75' }], // Keep current
        '2xl': ['1.5rem', { lineHeight: '2' }], // Keep current
        '3xl': ['1.875rem', { lineHeight: '2.25' }], // Keep current
      },
    },
  },
  plugins: [],
};

