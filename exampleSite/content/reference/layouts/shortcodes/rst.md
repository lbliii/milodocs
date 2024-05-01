---
title: rst.html
description: learn how to use the rst rendering shortcode
---

The `{{%/*rst*/%}}` shortcode a tool for rendering reStructuredText content in your Hugo site. This is useful for maintaining complex information such as tables, code blocks, and other elements that are difficult to maintain in Markdown.


## Before You Start

- Create a `requirements.txt` file at the root of your Hugo project and add `rst2html`; 
- 

- Be aware that using RST in Hugo requires the `rst2html5` tool to be installed on your system. You can install it using `pip install docutils`.
- RST is only rendered in Hugo if `'^rst2html.py$'` is listed in the `security.exec.allow` parameter in your configuration. You can see an example of this in the theme's config details at `config/_default/security.yaml`.

---

## How it Works 

### Table

`{{</*csv "shared/rst/table"*/>}}`

{{<rst "shared/rst/table" >}}

{{%include "shared/rst/table.rst" "rst" %}}

## Source Code 

{{%include "layouts/shortcodes/rst.html" "golang" %}}