---
title: article-chatTocToggle.js
description: Learn about how the chatTocToggle.js file works for this theme. 
---

The `chatTocToggle.js` file is used to manage the user's discovery preference globally across the site and is associated with the following partial layouts:

- [`navigation/sidebar-right.html`](/reference/layouts/partials/navigation/sidebar-right)
- [`article/chat.html`](/reference/layouts/partials/article/chat)
- [`article/toc.html`](/reference/layouts/partials/article/toc)

## How it Works

This script defaults to displaying the chatGPT UX experience initially. When a user selects the toggle, the ToC UX is activated and will persist site-wide. 

## Source Code 

{{%include "assets/js/layout-chatTocToggle.js" "js" %}}