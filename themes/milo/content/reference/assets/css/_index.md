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
   - **_default**: high-level content type templates (baseof, home, list, section, single, glossary, tutorial)
   - **partials**: flexible components used in any default template (tiles, next/prev, etc)
   - **shortcodes**: markdown-file compatible components used inline with your documentation copy
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

```css
/* Rubik Black Italic */
@font-face {
  font-family: 'RubikBlackItalic';
  font-style: italic;
  font-weight: 900;
  src: url('/fonts/Rubik-BlackItalic.ttf') format('truetype');
}

/* Rubik Extra Bold Italic */
@font-face {
  font-family: 'RubikExtraBoldItalic';
  font-style: italic;
  font-weight: 800;
  src: url('/fonts/Rubik-ExtraBoldItalic.ttf') format('truetype');
}

/* Rubik Bold Italic */
@font-face {
  font-family: 'RubikBoldItalic';
  font-style: italic;
  font-weight: 700;
  src: url('/fonts/Rubik-BoldItalic.ttf') format('truetype');
}

/* Rubik Semi-Bold Italic */
@font-face {
  font-family: 'RubikSemiBoldItalic';
  font-style: italic;
  font-weight: 600;
  src: url('/fonts/Rubik-SemiBoldItalic.ttf') format('truetype');
}

/* Rubik Medium Italic */
@font-face {
  font-family: 'RubikMediumItalic';
  font-style: italic;
  font-weight: 500;
  src: url('/fonts/Rubik-MediumItalic.ttf') format('truetype');
}

/* Rubik Italic */
@font-face {
  font-family: 'RubikItalic';
  font-style: italic;
  font-weight: normal;
  src: url('/fonts/Rubik-Italic.ttf') format('truetype');
}

/* Rubik Light Italic */
@font-face {
  font-family: 'RubikLightItalic';
  font-style: italic;
  font-weight: 300;
  src: url('/fonts/Rubik-LightItalic.ttf') format('truetype');
}

/* Rubik Black */
@font-face {
  font-family: 'RubikBlack';
  font-weight: 900;
  src: url('/fonts/Rubik-Black.ttf') format('truetype');
}

/* Rubik Extra Bold */
@font-face {
  font-family: 'RubikExtraBold';
  font-weight: 800;
  src: url('/fonts/Rubik-ExtraBold.ttf') format('truetype');
}

/* Rubik Bold */
@font-face {
  font-family: 'RubikBold';
  font-weight: 700;
  src: url('/fonts/Rubik-Bold.ttf') format('truetype');
}

/* Rubik Semi-Bold */
@font-face {
  font-family: 'RubikSemiBold';
  font-weight: 600;
  src: url('/fonts/Rubik-SemiBold.ttf') format('truetype');
}

/* Rubik Medium */
@font-face {
  font-family: 'RubikMedium';
  font-weight: 500;
  src: url('/fonts/Rubik-Medium.ttf') format('truetype');
}

/* Rubik Regular */
@font-face {
  font-family: 'RubikRegular';
  font-weight: normal;
  src: url('/fonts/Rubik-Regular.ttf') format('truetype');
}

/* Rubik Light */
@font-face {
  font-family: 'RubikLight';
  font-weight: 300;
  src: url('/fonts/Rubik-Light.ttf') format('truetype');
}
```

### colors.css

The `colors.css` file is where you can replace the color references to adhere to your brand aesthetic. 

```css
--color-brand:rgb(172, 193, 138); /*primary color*/
--color-brand-1:rgba(131, 122, 117, 0.667); /*secondary color*/
--color-brand-2:rgb(172, 193, 138); /*tertiary color*/
--color-brand-3:rgb(138, 193, 149); /*note color*/
--color-brand-4:#ADD9F4; /*tip color */
--color-brand-5:#dbd985; /*security color */
--color-brand-6:#d4ac84; /*warning color */
--color-brand-7:#F3B3A6; /*danger color */
```

### src/input.css

Use the `input.css` file to generate the `main.css` file. All of the core styles that are brand agnostic live in these files. 

Only update this file if:
- you are looking to make a fork or riff off of this theme
- you are contributing to this theme's main repo