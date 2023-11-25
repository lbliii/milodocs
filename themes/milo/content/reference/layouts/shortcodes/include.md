---
title: include.html
description: learn how to use the literal shortcode
---
<!--start -->
Inline code samples are great --- but code samples that are pulled from source files can be even better! This `{{%/*include*/%}}` shortcode is inspired by Sphinx's `.. literalinclude::` functionality. 

{{<notice snack>}}
This document is going to be a bit meta. 
{{</notice>}}

## How it Works

The `{{%/*include*/%}}` shortcode accepts 3 **positional** args: `lang`, `start`, and `stop`. All are optional.

{{<notice warning "Don't forget to use %">}}
This shortcode relies on Hugo's markdown rendering to automatically handle code syntax highlighting. If you surround this shortcode with `<` `>` instead, it will break.
{{</notice>}}

### Examples 

### This File

{{%include "reference/layouts/shortcodes/include.md" "md" %}}

### Python File With Comments

{{%include "static/demo-package.py" "python" "# Start 1" "# End 1" %}}

## Source Code 

{{%include "layouts/shortcodes/include.html" "go" %}}