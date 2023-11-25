---
title: notice.html
description: learn how to use the notice shortcode
---

Occasionally you might need to make **admonitions**, **callouts**, or **notices** in your documentation. Use the `{{</*notice*/>}}` shortcode to display these. 

## How it Works 

The `{{</*notice*/>}}` shortcode accepts 2 **positional** args: `type` and `title`. Both are optional. If no type is set, the notice defaults to `info`.

### Examples 

{{<notice "" "without type">}}
This is a **default** notice.
{{</notice>}}

{{<notice snack "want a cookie?">}}
This is a **snack** notice.
{{</notice>}}

{{<notice tip "you don't have to add a title">}}
This is a **tip** notice.
{{</notice>}}

{{<notice note "there's a lot of options">}}
This is a **note** notice.
{{</notice>}}

{{<notice info "probably redundant with note" >}}
This is a **info** notice.
{{</notice>}}

{{<notice security "hugo is safe" >}}
This is a **security** notice.
{{</notice>}}

{{<notice warning "don't use lightmode at night" >}}
This is a **warning** notice.
{{</notice>}}

{{<notice danger "cats may destroy furniture" >}}
This is a **danger** notice.
{{</notice>}}


```html
{{</* notice "" "without type" */>}}
This is a **default** notice.
{{</* /notice */>}}

{{</* notice snack "want a cookie?" */>}}
This is a **snack** notice.
{{</* /notice */>}}

{{</* notice tip "you don't have to add a title"*/>}}
This is a **tip** notice.
{{</* /notice */>}}

{{</* notice note "there's a lot of options" */>}}
This is a **note** notice.
{{</* /notice */>}}

{{</* notice info "probably redundant with note" */>}}
This is a **info** notice.
{{</* /notice */>}}

{{</* notice security "hugo is safe" */>}}
This is a **security** notice.
{{</* /notice */>}}

{{</* notice warning "don't use lightmode at night" */>}}
This is a **warning** notice.
{{</* /notice */>}}

{{</* notice danger "cats may destroy furniture" */>}}
This is a **danger** notice.
{{</* /notice */>}}

```

## Source Code 

{{%include "layouts/shortcodes/notice.html" "go" "" "noend"%}}