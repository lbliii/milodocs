---
title: CSS
description: Learn about the CSS  used in the Milo Docs theme.
weight: 100
---

The CSS used in the {{<prodName>}} theme is powered by TailwindCSS.

## Before You Start

Before making any changes, let's deploy locally and activate style monitoring.

1. Run `pnpm start` to deploy locally.
2. Navigate into `/themes/milo`.
3. Run `pnpm watch-tw`. This enables monitoring for CSS changes.

## Modify Templates

You can change the TailwindCSS classes assigned within the Hugo templates by doing the following:

1. Navigate into `/themes/milo/layouts`.
2. Choose which kind of template you wish to update.
   - **_default**: high-level content type templates (baseof, home, list, section, single, glossary, tutorial)
   - **partials**: flexible components used in any default template (tiles, next/prev, etc)
   - **shortcodes**: markdown-file compatible components used inline with your documentation copy
3. Make changes.
4. Verify changes were successful.
5. Save.

## Modify Global Theme Extensions

You can modify the default extensions the Milo Docs has set for TailwindCSS. This is useful when you'd like to change the branded **fonts**, **font sizes**, or added **color options**. 

{{<notice warning "Updating Fonts?">}}
If you are updating the fonts, make sure that you:
1. Install your font files at `/static/fonts`.
2. Add them to your CSS at `/themes/milo/assets/css/src/input.css`.
{{</notice>}}

1. Navigate into `/themes/milo/`.
2. Open the `tailwind.config.js` file.
3. Update the `theme.extends` entries.