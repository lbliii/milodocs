/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "content/**/*.md", 
    "layouts/**/*.html", 
    "../../layouts/**/*.html",
    "../../content/**/*.md",
    "assets/js/**/*.js"
  ],
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

        /* Semantic color tokens mapped to CSS variables */
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
        "surface-active": "var(--color-surface-active)",

        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          inverse: "var(--color-bg-inverse)",
        },
        border: {
          primary: "var(--color-border-primary)",
          secondary: "var(--color-border-secondary)",
          focus: "var(--color-border-focus)",
        },
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

