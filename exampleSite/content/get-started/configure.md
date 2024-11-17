---
title: Configure
description: Learn how to configure the basics (site URL and metadata).
weight: 300
---

After you have locally installed Hugo and deployed a copy of this theme, you can start configuring your site. This guide will walk you through the basics of configuring your site, including setting the site address (URL) and metadata.


## How to configure your site

### 1. Update site details

1. Open the `config/_default/hugo.yaml` file in your code editor.
2. Update the `baseURL` with the address of your site.
3. Update the `title`.

```yaml
baseURL: "https://example.com"
title: "My Hugo Site"
```

### 2. Update theme variables

#### Update organization and product details

1. Open the `config/_default/params.yaml` file in your code editor.
2. Update the `organization` to reflect your organization's name.
3. Update the `product` to reflect your product's name.

#### Update feature settings

You can optionally update the `features` section to enable or disable certain theme features.

{{%include "config/_default/params.yaml" "yaml" %}}
