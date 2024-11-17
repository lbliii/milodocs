---
title: head
description: Learn about the head partial.
weight: 100
---

The `head.html` [**partial**](/references/layouts/partial) layout includes:

- All metadata for every page
- A link to the bundled & minified CSS (@[head/css.html](/reference/layouts/partials/head/css))
- A link to the bundled & minified JS (@[head/js.html](/reference/layouts/partials/head/js))

## How it works

1. The `baseof.html` **default** layout includes this partial using `{{ partial "head.html" . }}`.
2. Each individual page's layout inherits from `baseof.html`, ensuring it includes the head partial.
3. Page front matter populates all metadata, used by the head partial.
4. All asset links (CSS & JS) inject into the head section.

## Source code 

{{% include "layouts/partials/head.html" %}}