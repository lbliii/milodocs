---
title: Enable RST
description: learn how to enable reStructuredText (RST) Markup in your Hugo docs site.
---

To utilize reStructuredText (RST) markup in a Hugo site, some extra configuration is required --- both on your **local machine** and in your **deployment solution** (Netlify, AWS Amplify, a container image). 

Once set up, you will be able to use full `.rst` pages, write inline RST using the [rst shortcode](/reference/layouts/shortcodes/rst), and/or create your own markup shortcodes.

## Before You Start 

- Read about Hugo's [security model](https://gohugo.io/about/security/)
- Read about Hugo's [AsciiDoc configuration options](https://gohugo.io/getting-started/configuration-markup/)

---


## How to Enable RST Markup

{{<notice info >}}
The following steps have been tested with **Netlify**. By providing a `requirements.txt` file at the root level, Netlify knows to automatically install `python`, `pip`, and the listed dependencies (`rst2html`). This may not be the case in your deployment solution.
{{</notice>}}

1. Install [Python](https://www.python.org/downloads/).

2. Install `rst2html`.
   ```s
   pip install rst2html
   ```

3. Create a `requirements.txt` file at the root of your Hugo project and add the following:
   ```s
   rst2html
   ```
4. Update your Hugo configuration values at `security.exec.allow`. We need to whitelist the RST processor tool as `rst2html` and `rst2html.py`.
   ```yaml
   exec:
     allow:
       - '^dart-sass-embedded$'
       - '^go$'
       - '^npx$'
       - '^postcss$'
       - '^rst2html.py$'
       - '^rst2html$'
       - '^asciidoctor$'
   ```
