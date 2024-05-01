---
title: js.html
description: Learn about the head/js partial.
weight: 100
---

This [**partial**](/reference/layouts/partial) layout concatenates all of the modular VanillaJS files found in [`themes/milo/assets/js`](/reference/assets/js) and outputs a `bundle.js` file for deployment use. It also [minifies](https://gohugo.io/hugo-pipes/minification/) and [fingerprints](https://gohugo.io/hugo-pipes/fingerprint/) the output. 

## Source Code 

{{%include "layouts/partials/head/js.html" "go" %}}