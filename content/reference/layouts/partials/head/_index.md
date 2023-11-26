---
title: head
description: Learn about the head partial.
weight: 100
---

The `head.html` [**partial**](/references/layouts/partial) layout houses: 

- all of the metadata that needs to be generated for every article
- a link to the bundled & minified CSS (@[head/css.html](/reference/layouts/partials/head/css))
- a link to the bundled & minified JS (@[head/js.html](/reference/layouts/partials/head/js))

## How it Works

1. This partial is fed into the `baseof.html` **default** layout.
2. Each individual page is passed through this template as  context `{{ partial "head.html" . }}`
3. All metadata is populated from page frontmatter.
4. All assets are applied.


## Source Code 

{{%include "layouts/partials/head.html" "go" %}}