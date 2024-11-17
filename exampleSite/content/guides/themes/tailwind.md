---
title: Add TailwindCSS
description: learn how to add TailwindCSS to your Hugo Theme
---

You can use TailwindCSS to build your site layouts. TailwindCSS is a mature CSS framework known by most developers, making onboarding other people to your project much easier.

## Before you start 

- Read the [TailwindCSS official install guide](https://tailwindcss.com/docs/installation)
- Read the [Hugo new theme CLI command reference](https://gohugo.io/commands/hugo_new_theme/)

---

## How to add TailwindCSS to a Hugo theme

1. Open a terminal and run the following:
   ```bash
   hugo new site $siteName
   cd $siteName
   hugo new theme $siteNameTheme
   git init
   cd themes/$siteNameTheme
   pnpm init
   pnpm install tailwindcss
   ```
2. Open `tailwind.config.js` and update the `content:` attribute to include the `content/` & `layouts/` directories:
   ```s
   // tailwind.config.js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: ["content/**/*.md", "layouts/**/*.html"],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```
3. Navigate to `/themes/sitethemeName/assets/css`.
4. Add a `src/input.css` with the following: 
   ```s
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
5. Update package.json with the following scripts:
   ```json
    "build-tw": "pnpm tailwindcss -i ./assets/css/src/input.css -o ./assets/css/main.css",
    "watch-tw": "pnpm tailwindcss -i ./assets/css/src/input.css -o ./assets/css/main.css -w --minify"
   ```
6. Run `pnpm run watch-tw` from `themes/siteThemeName` directory to enable watching for design changes.

You can now begin creating and editing your theme.

