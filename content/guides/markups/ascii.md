---
title: Enable AsciiDoc
description: learn how to enable AsciiDoc Markup in your Hugo docs site.
---

To utilize AsciiDoc markup in a Hugo site, some extra configuration is required --- both on your **local machine** and in your **deployment solution** (Netlify, AWS Amplify, a container image). 

Once set up, you will be able to use the [ascii shortcode](/reference/layouts/shortcodes/ascii) and/or create your own.

## Before You Start 

- Read about Hugo's [security model](https://gohugo.io/about/security/)
- Read about Hugo's [AsciiDoc configuration options](https://gohugo.io/getting-started/configuration-markup/)

---

## How to Enable AsciiDoc Markup

{{<notice info >}}
The following steps have been tested with **Netlify**. By providing a Gemfile at the root level, Netlify knows to automatically install both Ruby and the required gems listed in the Gemfile. This may not be the case in your deployment solution.
{{</notice>}}

1. Install [Ruby](https://www.ruby-lang.org/en/downloads/).
   ```s
   brew install rbenv ruby-build
   ```
2. Install `asciidoctor`.
   ```s
   brew install asciidoctor
   ```
3. Create a Gemfile at the root of your Hugo project and add the following:
   ```s
   source 'https://rubygems.org'
   gem 'asciidoctor'
   ```
4. Update your Hugo configuration values at `security.exec` 
   - We need to whitelist the ascii processor tool, `asciidoctor`.
   - We need to whitelist the `GEM_PATH`.
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
     osEnv: 
       - (?i)^(PATH|PATHEXT|APPDATA|TMP|TEMP|TERM|HOME|GEM_PATH)$
   ```

## Troubleshooting

It's possible that whitelisting `GEM_PATH` does not work for you. In that case, try to whitelist `GEM_HOME` or `RVM_*`. See this [related Github issue](https://github.com/gohugoio/hugo/issues/9741) for historical context.

