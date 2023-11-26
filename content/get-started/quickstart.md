---
title: Quickstart 
description: Use some quick scripts to get started.
weight: 100
---

Copy and paste the following commands into your terminal to quickly install [Hugo](https://gohugo.io/) and locally deploy a new site with the {{<prod>}} theme as a [submodule](https://github.blog/2016-02-01-working-with-submodules/) in your repo.

## MacOS

```s
brew install hugo
hugo new site ~/Documents/github/my-hugo-site
cd ~/Documents/github/my-hugo-site
git init
rm hugo.toml

cat <<EOL > hugo.yaml
baseURL: '/'
languageCode: 'en-us'
title: 'My Hugo Site'
theme: milo

# Output Formats
outputs:
home: ["HTML", "JSON", "RSS"]
page: ["HTML", "JSON"]
section: ["HTML", "JSON"]
list: ["HTML", "JSON"]
taxonomies: ["HTML", "JSON"]
EOL

git submodule add https://github.com/lbliii/milodocs themes/milo
hugo server
open http://localhost:1313
```