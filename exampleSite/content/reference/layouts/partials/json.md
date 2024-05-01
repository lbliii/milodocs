---
title: json.json
description: Learn about the json partial.
weight: 800
---

Hugo supports JSON outputs out of the box.  But to utilize it, you should define an output template based on the data available to your [page kinds](https://gohugo.io/templates/section-templates/#page-kinds) and any frontmatter included in the markdown file.

This partial is used in the following [**default**](/reference/layouts/defaults) layouts:

- [`home.json`](/reference/layouts/defaults/#homehtml-json-output)
- [`section.json`](/reference/layouts/defaults/section/#sectionhtml-json-output)
- [`single.json`](/reference/layouts/defaults/single/#singlehtml-json-output)

{{<notice tip>}}
Each of these outputs can be found by adding `/index.json` to the path of the home, section, or single page. 
{{</notice>}}

## How it Works

By itself, this partial doesn't do anything. When piped reference from a few of our default layouts, it acts as a standardized blueprint for how each article  should look like in json. Updating this file will cascade to all outputs where this is referenced.


## Source Code 

{{%include "layouts/partials/json.json" "golang" %}}