---
title: prod.html
description: learn how to use the prod shortcode
---

Use a variable that represents your product name when documenting a project or startup product that might undergo re-branding.

## How it works

The `{{</*prod*/>}}` shortcode prints out a string for your main product name defined in your site configuration. If the parameter is not configured, it displays a warning message and shows a placeholder text.

1. Open your repository.
2. Navigate to the `themes/milo/hugo.yaml` file.
3. Update the following:

   ```yaml
   # Theme Feature Settings
   params: 
     names:
       product: 'Milo Docs'
   ```

{{<notice warning "Header Constraints for TOCs">}}
To ensure Hugo resolves this template in the **Table of Contents** of your articles, make sure that you use the `%` wrapper instead of `< >` in your headers.

Example Error Output: `HAHAHUGOSHORTCOD...`
{{</notice>}}

{{<notice info "Build Configuration">}}
If the `names.product` parameter is not configured in your site configuration, the template will display `[Product Name Not Configured]` and log a warning during the build process. This prevents build failures while alerting you to the missing configuration.
{{</notice>}}

### Examples

This is the {{<prod>}} theme.

```s
This is the {{</*prod*/>}} theme.
```

## Source code

{{%include "layouts/shortcodes/prod.html" "html" %}}