---
title: layout-theme.js
description: Learn about how the darkmode.js file works for this theme. 
---

The `darkmode.js` file manages the user's theme preference and associates with the [`navigation/topbar/main.html`](/reference/layouts/partials/navigation/topbar/main.html) [**partial**](/reference/layouts/partials) layout. 

{{%include "layouts/partials/navigation/topbar/main.html" "html" "<!-- Dark Mode -->" "" %}}

## How it works 

1. This script checks to if the user has darkmode saved in their local storage.
2. If not, when toggled it:
   - Saves the setting to local storage
   - Adds the `dark` class to the `html` element
   - Swaps the path for all image elements associated with the `icon` class from `/icons/light/` to `/icons/dark/`

{{<notice tip>}}
You can find the `.dark` class styling overrides in the `assets/css/src/input.css` file.
{{</notice>}}

## Source code 

{{%include "assets/js/layout-theme.js" "js" %}}