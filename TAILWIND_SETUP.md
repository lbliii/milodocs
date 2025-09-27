# Hugo Native Tailwind CSS Setup

MiloDocs theme now supports Hugo's native Tailwind CSS v4 processing, eliminating the need for separate build tools.

## Quick Setup

### 1. Install Dependencies

In your Hugo site root, install the required dependencies:

```bash
npm install -D @tailwindcss/postcss autoprefixer postcss postcss-import tailwindcss
```

### 2. Create PostCSS Configuration

Create `postcss.config.js` in your site root:

```javascript
module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['themes/milodocs/assets/css']
    }),
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ]
}
```

### 3. Create Tailwind Configuration

Create `tailwind.config.js` in your site root:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "content/**/*.md", 
    "layouts/**/*.html", 
    "themes/milodocs/layouts/**/*.html",
    "themes/milodocs/content/**/*.md",
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
        "nvidia": ["NVIDIA", "Arial", "Helvetica", "sans-serif"],
        "nvidia-mono": ["RobotoMono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.75' }],
        'xl': ['1.25rem', { lineHeight: '1.75' }],
        '2xl': ['1.5rem', { lineHeight: '2' }],
        '3xl': ['1.875rem', { lineHeight: '2.25' }],
      },
    },
  },
  plugins: [],
};
```

### 4. Create Theme Symlink

For the example site to work, create a symlink to the theme:

```bash
mkdir -p themes
ln -sf ../../ themes/milodocs
```

## How It Works

1. **Hugo Processing**: Hugo automatically detects the PostCSS configuration and processes CSS files through PostCSS
2. **Tailwind v4**: The `@tailwindcss/postcss` plugin handles Tailwind CSS v4 compilation
3. **Component Imports**: PostCSS Import resolves the theme's component CSS files
4. **No Build Step**: Everything happens automatically when you run `hugo server` or `hugo build`

## Benefits

- ✅ **No separate build tools**: Hugo handles everything natively
- ✅ **Live reload**: CSS changes are reflected immediately during development
- ✅ **Optimized output**: Hugo automatically minifies and fingerprints CSS in production
- ✅ **Tailwind v4**: Latest Tailwind CSS features and performance improvements
- ✅ **Theme integration**: Full access to theme components and design tokens

## Troubleshooting

### CSS Import Errors

If you see import path errors, ensure:
1. The theme symlink exists: `themes/milodocs` → `../../`
2. PostCSS import path is configured: `path: ['themes/milodocs/assets/css']`

### Missing Dependencies

Ensure you have Hugo Extended version for PostCSS support:
```bash
hugo version  # Should show "extended"
```

### Development vs Production

- **Development**: CSS is processed but not minified for faster builds
- **Production**: CSS is automatically minified and fingerprinted by Hugo

## Migration from PostCSS Build

If you're migrating from the previous PostCSS build setup:

1. Remove build scripts from `package.json`
2. Delete generated `assets/css/main.css`
3. Remove theme-level `postcss.config.js` and `tailwind.config.js`
4. Follow the setup steps above

The theme now handles CSS processing through Hugo's native capabilities, providing a much cleaner and more maintainable setup.
