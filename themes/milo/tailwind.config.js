/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["content/**/*.md", "layouts/**/*.html"],
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
        "brand-black": ["RubikBlack", "sans"],
        "brand-black-italic": ["RubikBlackItalic", "sans", "italic"],
        "brand-bold": ["RubikBold", "sans"],
        "brand-bold-italic": ["RubikBoldItalic", "sans", "italic"],
        "brand-light": ["RubikLight", "sans"],
        "brand-light-italic": ["RubikLightItalic", "sans", "italic"],
        "brand-medium": ["RubikMedium", "sans"],
        "brand-medium-italic": ["RubikMediumItalic", "sans", "italic"],
        "brand-regular": ["RubikRegular", "sans"],
        "brand-regular-italic": ["RubikItalic", "sans", "italic"],
        "brand-semibold": ["RubikSemiBold", "sans"],
        "brand-semibold-italic": ["RubikSemiBoldItalic", "sans", "italic"],
        "brand-thin": ["RubikLight", "sans"],
      },
    },
  },
  plugins: [],
};

