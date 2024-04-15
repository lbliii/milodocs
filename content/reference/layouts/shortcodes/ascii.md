---
title: ascii.html
description: learn how to use the asciidocs rendering shortcode
---

The `{{</*ascii*/>}}` shortcode a tool for rendering AsciiDoc markup content in your Hugo site. This is useful for maintaining complex information such as tables and other elements that are difficult to maintain in Markdown.


## Before You Start

- Be aware that using AsciiDoc markup in Hugo requires [Ruby](https://www.ruby-lang.org/en/downloads/) and the `asciidoctor` tool to be installed on your system. You can install it using `brew install asciidoctor`.
- AsciiDoc markup is only rendered in Hugo if `'^asciidoctor$'` is listed in the `security.exec.allow` parameter in your configuration. You can see an example of this in the theme's config details at `config/_default/security.yaml`.

---


## Setup 

1. Install Ruby.
2. Create a Gemfile and add the following:
   ```s
   source 'https://rubygems.org'
   gem 'asciidoctor'
   ```
3. Run `bundle` in the terminal.
4. Update your deployment build command to include `bundle` (e.g., `bundle && hugo`).

## How it Works 

## Examples

### Table

{{<ascii>}}
|===
| Name    | Age | City      

| John    | 25  | New York  
| Lisa    | 28  | Los Angeles
| Michael | 31  | Chicago   
|===
{{</ascii>}}

## Source Code 

{{%include "layouts/shortcodes/ascii.html" "golang" %}}