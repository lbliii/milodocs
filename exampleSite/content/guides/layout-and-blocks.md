---
title: Layout, Blocks, and Tokens
description: How to control the theme layout using tokens, blocks, and front matter.
weight: 30
---

This theme uses a token-driven layout shell with Hugo blocks and small utilities. This guide shows how to configure rails, density, and meta, and how to compose pages with blocks.

## Layout at a glance
- `.layout-shell`: 3-column grid (left rail, content, right rail). Driven by tokens:
  - `--left-rail-width`, `--right-rail-width`
  - `--layout-gap-xl`, `--layout-gap-2xl`
  - `--max-width-content`
- `.grid-autofit`: auto-fit card grid using `--grid-card-min`
- `.page-container`: sets content max-width from tokens

The shell also sets `data-has-right-rail="true|false"`. When false, the center expands (via tokens) for more breathing room.

## Site-wide defaults (config)
Add defaults in `config/_default/params.yaml`:

```yaml
layout:
  rightRail: true           # show or hide globally
  leftRailWidth: 18rem      # xl; 2xl is derived
  rightRailWidth: 22rem     # xl; 2xl is derived
  density: comfortable      # or compact
  skeleton: false           # opt-in loading skeletons
```

## Per-page or per-section overrides (front matter)
Use `layoutConfig` in a page or a section’s `_index.md`:

```yaml
---
layoutConfig:
  rightRail: false      # hide right rail on this page/section
  leftRailWidth: 20rem  # widen left nav
  density: compact      # switch spacing preset
  skeleton: true        # show loading skeleton
---
```

Tip: setting on a section `_index.md` applies to all children unless overridden.

## Blocks you can override
The base template (`layouts/_default/baseof.html`) exposes these blocks:
- `head-extra`: extra `<head>` meta/scripts
- `page-header`: hero/heading area above content
- `pre-content` / `post-content`: slots before/after main content
- `content`: page body (singles)
- `list`: list/section/taxonomy views
- `home`: homepage content
- `scripts`: footer scripts per page

Examples:

```go-html-template
{{ define "page-header" }}
  <section class="p-8">
    <h1 class="text-3xl font-bold">{{ .Title }}</h1>
  </section>
{{ end }}
```

## Utilities (partials)
Use these small helpers in templates:
- `utils/layout-config.html` → merged `{ rightRail, leftRailWidth, rightRailWidth, density, skeleton }`
- `utils/right-rail.html` → prints `"true"|"false"` if the right rail should render
- `utils/page-kind.html` → `{ isHome, isSection, isTaxonomy, isTerm, isSingle }`
- `utils/title-guard.html` → `true` if front-matter H1 should render
- `utils/meta.html` → `{ title, fullTitle, description, canonicalURL, ogType, image, twitterCard, keywords, robots }`
- `utils/breadcrumbs-data.html` → `{ entries, current, hasMetadata }`

SEO is already wired in `partials/head.html` and cached with `partialCached`.

## Patterns
- Adaptive grids:
```html
<div class="grid grid-autofit gap-6 2xl:grid-cols-3">
  <!-- cards ... -->
</div>
```
- Layout-aware pages:
```go-html-template
<main class="layout-shell {{ $densityClass }}" data-has-right-rail="{{ $rightRail }}">
  <!-- blocks ... -->
</main>
```

## Troubleshooting
- Sidebar squeezed? Ensure your layout uses `navigation/sidebar-left.html` and not custom widths.
- Content too narrow with no right rail? Confirm the page/section sets `rightRail: false`, which toggles wider `--max-width-content` via tokens.
- Titles duplicated? Wrap H1 rendering with `{{ if partial "utils/title-guard.html" . }}`. 