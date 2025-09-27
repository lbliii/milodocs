module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['themes/milodocs/assets/css']
    }), // postcss-import needs to be first
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ]
}