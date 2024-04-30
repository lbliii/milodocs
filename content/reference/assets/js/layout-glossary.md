---
title: layout-glossary.js
description: Learn about how the glossary.js file works for this theme. 
---

The `glossary.js` file is used to manage the visual "spotlight effect" experience on the glossary entries found in the [`glossary.html`](/reference/layouts/defaults/glossary) [**partial**](/reference/layouts/partials) layout. 


## How it Works

{{<notice note >}}
This functionality is nearly identical to the [`js/tiles.js`](/reference/assets/js/tiles) functionality -- with the exception of the utilized class name, `glossary-entry`. This is so that you can more easily customize each experience on your own if you wish.
{{</notice>}}

If the page has elements with the `glossary-entry` class, this script updates their background radial gradient values to mirror the position of the mouse. 

The color of the spotlight effect is determined by [`css/colors.css`](/reference/assets/css#colorscss), specifically:
- **inside**: `var(--primary-gradient-color)` 
- **outside**: `var(--secondary-gradient-color)`

## Source Code 

{{%include "assets/js/layout-glossary.js" "js" %}}