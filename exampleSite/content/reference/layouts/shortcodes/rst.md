---
title: rst.html
description: learn how to use the RST rendering shortcode
---

The `{{%/*rst*/%}}` shortcode a tool for rendering reStructuredText content in your Hugo site. This is useful for maintaining complex information such as tables, code blocks, and other elements that are difficult to maintain in Markdown.


## Before you start

- Create a `requirements.txt` file at the root of your Hugo project and add `rst2html`; 
- Ensure that you install the `rst2html5` tool on your system to use RST in Hugo. You can install it using `pip install docutils`.
- To render RST in Hugo, add `'^rst2html.py$'` to the `security.exec.allow` parameter in your configuration. You can see an example of this in the theme's config details at `config/_default/security.yaml`.

---

## How it works 

### Table

`{{</*csv "shared/rst/table"*/>}}`

{{<rst "shared/rst/table" >}}

{{%include "shared/rst/table.rst" "rst" %}}

## Source code 

{{%include "layouts/shortcodes/rst.html" "golang" %}}