---
title: next-prev.html
description: Learn how to use the next-prev partial layout.
---



## How it Works

1. Partial checks if the Next/Previous article buttons are enabled from `hugo.yaml` site config.
2. For `single.html` pages: 
   - The next article in the section is displayed on the left (next points up).
   - The previous article in the section is displayed on the right (prev points down).
3. For `section.html` pages:
   - The first child is displayed on the right (points down)
   

## Source Code 

{{%include "layouts/partials/article/next-prev.html" "go" %}}