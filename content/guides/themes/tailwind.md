---
title: Add TailwindCSS
description: learn how to add TailwindCSS to your Hugo Theme
---

You can utilize TailwindCSS to build your site layouts. This is advantageous because TailwindCSS is a mature CSS framework that is well supported and known by most developers, making onboarding other people to your project much easier.

## Before You Start 

- Read the [TailwindCSS official install guide](https://tailwindcss.com/docs/installation)
- Read the [Hugo new theme CLI command reference](https://gohugo.io/commands/hugo_new_theme/)

---

## How to Add TailwindCSS to a Hugo Theme

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

You are ready to start creating and editing your theme.
