module.exports = {
  plugins: [
    require('postcss-import'), // postcss-import needs to be first
    require('tailwindcss'),
    require('autoprefixer')
  ]
}