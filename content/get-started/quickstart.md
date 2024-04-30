---
title: Quickstart
description: Use a quick deploy script to get started.
weight: 90
---

## Before You Start

This theme is demonstrating AsciiDoc and RST support, which may require you to install the following dependencies:

```s
brew install rbenv ruby-build asciidoctor
pip install rst2html
```

These are optional dependencies simply used to demonstrate capability. You can remove them from the theme if you don't need them.

---

## MacOS 

{{<notice tip>}}
The following script will update Hugo if you already have it installed via brew.
{{</notice>}}

1. Open your terminal.
2. Copy and paste the following:
   ```s
   brew install hugo
   site_name="milodocs_$(date +%s%N | md5sum | head -c 8)"
   hugo new site "$site_name"
   cd "$site_name"
   git clone https://github.com/lbliii/milodocs themes/milodocs
   cp -r themes/milodocs/config/* .
   git init
   git add .
   git commit -m "Initial commit"
   hugo server -D -p 1313
   ```
3. Open [localhost:1313](localhost:1313).
