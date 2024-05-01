---
title: CSS
description: Learn about the CSS  used in the Milo Docs theme.
weight: 100
icon: "swatches.svg"
---

The CSS used in the {{<prod>}} theme is powered by [TailwindCSS](https://tailwindcss.com/docs/installation).

## Before You Start

Before making any changes, let's deploy locally and activate style monitoring.

1. Run `pnpm start` to deploy locally.
2. Navigate into `/themes/milo`.
3. Run `pnpm watch-tw`. This enables monitoring for CSS changes.

## Modify Templates

You can change the TailwindCSS classes assigned within the Hugo templates by doing the following:

1. Navigate into `/themes/milo/layouts`.
2. Choose which kind of template you wish to update.
   - [**_default**](/reference/layouts/defaults): high-level content type templates (baseof, home, list, section, single, glossary, tutorial)
   - [**partials**](/reference/layouts/partials): flexible components used in any default template (tiles, next/prev, etc)
   - [**shortcodes**](/reference/layouts/shortcodes): markdown-file compatible components used inline with your documentation copy
3. Make changes.
4. Verify changes were successful.
5. Save.

## Modify Global Theme Extensions

You can modify the default extensions the Milo Docs theme has set for TailwindCSS. This is useful when you'd like to change the branded **fonts** or change Tailwind's default **font sizes**. 

{{<notice warning "Updating Fonts?">}}
If you are updating the fonts, make sure that you:
1. Install your font files at `/static/fonts`.
2. Add them to your CSS at `/themes/milo/assets/css/src/input.css`.
{{</notice>}}

1. Navigate into `/themes/milo/`.
2. Open the `tailwind.config.js` file.
3. Update the `theme.extends` entries.

## Modify Stylesheets 

Hugo can reference CSS from multiple locations (e.g., `static` and `assets`). The {{<prod>}} theme keeps all CSS in the `assets` folder since we want to process the files in a variety of ways --- such as concatenating many modular CSS files together into a bundled output that we can minify for production deployments. 

### fonts.css

The `fonts.css` file is where you can add/replace the font references to adhere to your brand aesthetic.

{{%include "assets/css/fonts.css" "css" %}}

### colors.css

The `colors.css` file is where you can replace the color references to adhere to your brand aesthetic. 

{{%include "assets/css/colors.css" "css" %}}

### main.css

The `main.css` file is generated from the `src/input.css` file. All of the core styles that are brand agnostic live in these files. 

{{<notice warning>}}
Do not directly update the `main.css` file; instead, edit the `src/input.css` file while `pnpm watch-tw` is active.
{{</notice>}}