---
title: Quickstart
description: Use a quick deploy script to get started.
weight: 90
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
   git init
   git submodule add https://github.com/lbliii/milodocs themes/milodocs
   mkdir config/
   cp -r themes/milodocs/exampleSite/config/* config/
   rm config/_default/security.yaml
   rm hugo.toml
   git add .
   git commit -m "Initial commit"
   hugo server -D -p 1313
   ```
3. Open [localhost:1313](localhost:1313).
