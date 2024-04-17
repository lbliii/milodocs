---
title: ascii.html
description: learn how to use the asciidocs rendering shortcode
---

The `{{</*ascii*/>}}` shortcode renders AsciiDoc markup content inside of markdown files. 


## Before You Start 

- Complete [How to Enable AsciiDoc Markup Support]()
- 
---

## Setup

To utilize this shortcode, some extra configuration is required both on your local machine and in your deployment solution (Netlify, AWS Amplify, a container image)

1. Install [Ruby](https://www.ruby-lang.org/en/downloads/).
2. Install `asciidoctor`.
   ```s
   brew install asciidoctor
   ```
3. Create a Gemfile at the root of your Hugo project and add the following:
   ```s
   source 'https://rubygems.org'
   gem 'asciidoctor'
   ```
4. Update your Hugo configuration values at `security.exec.osEnv`. We need to make the `GEM_PATH` discoverable/allowed.
   ```yaml
   osEnv: 
       - (?i)^(PATH|PATHEXT|APPDATA|TMP|TEMP|TERM|HOME|GEM_PATH)$
   ```

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

```s
|===
| Name    | Age | City      

| John    | 25  | New York  
| Lisa    | 28  | Los Angeles
| Michael | 31  | Chicago   
|===
```

## Source Code 

{{%include "layouts/shortcodes/ascii.html" "golang" %}}