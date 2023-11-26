---
title: Quickstart 
description: Use some quick scripts to get started.
---

## Hugo Not Installed 

```s
brew install hugo
hugo new site ~/Documents/github/my-hugo-site
cd ~/Documents/github/my-hugo-site
git init
rm hugo.toml

cat <<EOL > hugo.yaml
baseURL: '/'
languageCode: 'en-us'
title: 'Milo Docs theme'
theme: milo

# Output Formats
outputs:
home: ["HTML", "JSON", "RSS"]
page: ["HTML", "JSON"]
section: ["HTML", "JSON"]
list: ["HTML", "JSON"]
taxonomies: ["HTML", "JSON"]
EOL

git submodule add https://github.com/lbliii/milo-theme themes/milo
hugo server
open http://localhost:1313
```