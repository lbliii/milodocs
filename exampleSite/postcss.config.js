module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['themes/milodocs/assets/css']
    }), // postcss-import processes @import statements
    require('autoprefixer') // Add vendor prefixes for browser compatibility
  ]
}