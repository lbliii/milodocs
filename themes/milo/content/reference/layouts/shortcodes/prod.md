---
title: prod.html
description: learn how to use the prod shortcode
---

Occasionally it is useful to use a variable that represents your product name --- especially when documenting a project or startup product that is likely to undergo rebranding.

## How it Works 

The `{{</*prod*/>}}` shortcode prints out a string for your main product name defined in your site configuration. 

1. Open your repo.
2. Navigate to the `themes/milo/hugo.yaml` file.
3. Update the following:
   ```yaml
   # Theme Feature Settings
   params: 
     names:
       product: 'Milo Docs'
   ```

{{<notice warning "Header Constraints for TOCs">}}
To ensure Hugo resolves this shortcode correctly in the **Table of Contents** of your articles, make sure that you use the `%` wrapper instead of `< >` in your headers.

Example Error Output: `HAHAHUGOSHORTCOD...`
{{</notice>}}

### Examples

This is the {{<prod>}} theme.

```s
This is the {{</*prod*/>}} theme.
```

## Source Code 

{{%include "layouts/shortcodes/prod.html" "golang" %}}