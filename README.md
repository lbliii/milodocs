# Theme Name

## Features

## Installation

## Configuration


## Notes to Self

### Set Up Fresh Theme Using Tailwind

1. Run the following:
   ```bash
   hugo new site $siteName
   cd $siteName
   hugo new theme $siteNameTheme
   git init
   cd themes/$siteNameTheme
   pnpm init
   pnpm install tailwindcss
   ```
2. Connect `tailwind.config.js` to content & layouts:
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
6. Run `pnpm run watch-tw` from siteThemeName directory to enable watching for design changes.

You are ready to start creating and editing your theme.
