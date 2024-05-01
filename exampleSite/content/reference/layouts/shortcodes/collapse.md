---
title: collapse.html
description: learn how to use the collapse shortcode
---

The `{{</*collapse*/>}}` shortcode is a simple way to create collapsible sections in your documentation. This is great for hiding large amounts of content that you don't want to overwhelm your readers with.

## How it Works

The `{{</*collapse*/>}}` shortcode accepts 2 **named** args: `title` and `description`.

- `title` is the title of the collapsible section.
- `description` is the content that will be hidden until the user clicks on the title.


### Examples

`{{</*collapse*/>}}`

{{<collapse >}}

this is the hidden content.

{{</collapse>}}

`{{</*collapse title="Click me" description="I'm hidden content!"*/>}}`

{{<collapse title="Click me" description="I'm hidden content!" >}}

this is the hidden content.

{{</collapse>}}

## Source Code 

{{%include "layouts/shortcodes/collapse.html" "go" %}}