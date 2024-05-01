---
title: next-prev.html
description: Learn how to use the next-prev partial layout.
---

The `next-prev.html` [**partial**](/reference/layouts/partials) layout defines the article progression experience and is located at the end of an article.

## How it Works

- **Single pages**: 
   - The next article in the section is displayed on the left (next points up).
   - The previous article in the section is displayed on the right (prev points down).

- **Section pages:**
   - The first child is displayed on the right (points down)

{{<notice note>}}
This experience can be disabled from the `themes/milo/hugo.yaml` config by setting `Params.articles.nextPrev.display` to `false`.
{{</notice>}}

## Source Code 

{{%include "layouts/partials/article/next-prev.html" "go" %}}