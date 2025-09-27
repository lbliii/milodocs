/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './layouts/**/*.html',
    './content/**/*.md',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Custom color tokens can be added here
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    import('@tailwindcss/typography'),
  ],
}
