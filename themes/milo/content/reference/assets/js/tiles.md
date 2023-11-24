---
title: tiles.js
description: Learn about how the tiles.js file works for this theme. 
---

The `tiles.js` file is used to manage the visual "spotlight effect" experience on the article tiles found in the [`article/tiles.html`](/reference/layouts/article/tiles.md) [**partial**](/reference/layouts/partials) layout.

## How it Works

If the page has elements with the `tile` class, this script updates their background radial gradient values to mirror the position of the mouse. 

The color of the spotlight effect is determined by [`css/colors.css`](/reference/assets/css#colorscss), specifically:
- **inside**: `var(--primary-gradient-color)` 
- **outside**: `var(--secondary-gradient-color)`

## Source Code 

{{%include "assets/js/tiles.js" "js" %}}