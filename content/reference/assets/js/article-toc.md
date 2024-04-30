---
title: article-toc.js
description: Learn about how the toc.js file works for this theme. 
---

The `toc.js` file is used to manage the "scrolling-section-highlight effect" experience on the table of contents found in the [`navigation/sidebar-right.html`](/reference/layouts/partials/sidebar-right) [**partial**](/reference/layouts/partials) layout.

## How it Works

If the page has an element with the ID `#TableOfContents`, this script collects the associated links and highlights them based on scrolling behavior:

- **Scrolling Down**: it highlights the next `h2` or `h3` as soon as it comes into view.
- **Scrolling Up**: it highlights the previous `h2` or `h3` as soon as the lowest one exits view.


## Source Code 

{{%include "assets/js/article-toc.js" "js" %}}