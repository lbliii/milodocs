---
title: layout-sidebar-left.js
description: Learn about how the sidebar-left.js file works for this theme. 
---

The `sidebar-left.js` file is used to manage the scroll-into-view link experience in the [`navigation/sidebar-left.html`](/reference/layouts/partials/navigation/sidebar-left) [**partial**](/reference/layouts/partials) layout.

## How it Works 

1. The script finds the active link via `[data-current="true]` attribute set by logic in the `sidebar-left.html` template.
2. After a 300ms delay, it scrolls until the active link is visible.

## Source Code 

{{%include "assets/js/layout-sidebar-left.js" "js" %}}