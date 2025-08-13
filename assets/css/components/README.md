# CSS Components and Architecture Map

This project uses a hybrid approach:
- Architecture layer (tokens, systems): `assets/css/architecture/`
- Component layer (thin semantic classes): `assets/css/components/`
- Tailwind utilities for layout/spacing/typography/states

## Where things live
- Architecture
  - `animation-system.css`: timing, easing, transforms
  - `layout-foundations.css`: spacing scale, radius, z-index, max-widths, layout tokens
    - Rails and gaps: `--left-rail-width`, `--right-rail-width`, `--layout-gap-*`
    - Content width: `--max-width-content`
    - Grid/card: `--grid-card-min`
    - Glass tokens: `--tile-glass-blur`, `--tile-glass-saturate`
    - Hooks and presets:
      - `main.layout-shell[data-has-right-rail="false"]` adjusts gaps and `--max-width-content`
      - `.layout-density--compact` / `.layout-density--comfortable`
- Components
  - `tiles.css`, `child-links.css`, `article-header.css`, etc.
  - New utility classes (declared in `assets/css/src/input.css` under `@layer components`):
    - `.layout-shell`: 3-column shell controlled by tokens
    - `.grid-autofit`: responsive auto-fit grid using `--grid-card-min`
    - `.page-container`: sets `max-width: var(--max-width-content)`

## Using layout tokens
- Site-wide defaults (config/_default/params.yaml):
```yaml
layout:
  rightRail: true
  leftRailWidth: 18rem
  rightRailWidth: 22rem
  density: comfortable  # or compact
  skeleton: false
```
- Per-page override (front matter):
```yaml
layoutConfig:
  rightRail: false
  leftRailWidth: 20rem
  density: compact
  skeleton: true
```

## Template blocks and utilities
- Blocks in `layouts/_default/baseof.html`:
  - `head-extra`, `pre-content`, `post-content`, `scripts`, `page-header`, `list`, `home`
- Utilities (partials):
  - `utils/layout-config.html`: merges site/page layout config
  - `utils/right-rail.html`: decides if right rail should render
  - `utils/page-kind.html`: `{ isHome, isSection, isTaxonomy, isTerm, isSingle }`
  - `utils/title-guard.html`: show H1 if content doesn’t start with `# `
  - `utils/meta.html`: normalized SEO meta dict
  - `utils/breadcrumbs-data.html`: data for breadcrumbs

## Conventions
- Prefer Tailwind utilities for one-off layout, spacing, states
- Create component classes only when reused or when selectors are complex
- Comment out lines when replacing existing code (no `*-new` suffixes)
- Never edit generated CSS (`assets/css/main.css`); use source files

## Examples
- Adaptive grid in a template:
```html
<div class="grid grid-autofit gap-6 2xl:grid-cols-3">…</div>
```
- Shell usage in base template:
```html
<main class="layout-shell {{ $densityClass }}" data-has-right-rail="{{ $rightRail }}">…</main>
```
- Page override via front matter:
```yaml
layoutConfig:
  rightRail: false
  density: compact
```