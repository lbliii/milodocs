---
title: css.html
description: Learn about the head/css partial.
weight: 100
---

This [**partial**](/reference/layouts/partial) layout concatenates all of the modular CSS files found in [`themes/milo/assets/css`](/reference/assets/css) and outputs a `bundle.css` file for deployment use. It also [minifies](https://gohugo.io/hugo-pipes/minification/) and [fingerprints](https://gohugo.io/hugo-pipes/fingerprint/) the output. 

## Source Code 

{{%include "layouts/partials/head/css.html" "go" %}}