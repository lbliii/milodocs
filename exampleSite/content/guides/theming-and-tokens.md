---
title: Theming with Tokens
description: Customize colors, elevation, and animations using theme tokens and Tailwind utilities.
weight: 31
---

This theme centralizes styling in CSS variables (tokens) and small component classes. You can customize appearance without editing component CSS by changing tokens.

## Where tokens live
- Architecture: `assets/css/architecture/`
  - `colors*.css`: color palettes and brand tokens
  - `elevation-system.css`: shadow/elevation tokens (e.g., `--elevation-2`, `--elevation-hover-4`)
  - `animation-system.css`: timing/easing/transform tokens
  - `layout-foundations.css`: spacing/width/z-index and layout tokens

## Overriding tokens
Prefer setting variables at `:root` or section/page scope. For a section:

```html
<main class="layout-shell" style="--left-rail-width:20rem; --grid-card-min:320px;">
  …
</main>
```

Or in front matter, use `layoutConfig` for supported tokens:

```yaml
layoutConfig:
  leftRailWidth: 20rem
  density: compact
```

To theme a single article area:

```html
<div id="articleContent" style="--color-brand: #ea580c; --color-brand-rgb: 234, 88, 12;">
  …
</div>
```

## Tailwind + tokens
Use Tailwind for layout/spacing/typography, tokens for values:

```html
<h2 class="text-xl font-semibold" style="color: var(--color-text-primary);">Heading</h2>
```

## Dark mode
Colors use CSS variables so dark mode switches automatically. Use Tailwind `dark:` utilities for stateful differences.

```html
<p class="text-sm dark:opacity-90" style="color: var(--color-text-secondary);">
  This text adapts to dark mode.
</p>
```

## Elevation and interactions

```html
<div class="tile" style="box-shadow: var(--elevation-2);">
  …
</div>
```

Hover/active effects rely on `animation-system.css` timing tokens and `.interact-*` classes (where used). Prefer these over bespoke transitions. 