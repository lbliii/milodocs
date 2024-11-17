# MiloDocs

## Features

- **native chatGPT UI**
- **native Algolia UI**

## Installation

### Quickstart (macOS)

1. Copy and paste this into your terminal to install the theme as a git submodule and copy the default configs.
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
2. Open [localhost:1313](localhost:1313)
3. Create your first markdown directory under `content/` (e.g., `content/get-started`).
4. Add an `_index.md` file with the following frontmatter:
   ```yaml
   ---
   title:
   description:
   weight:
   ---
   ```
5. Check your site to see it displayed.

Getting from 0 to 1 takes ~5 minutes. 

### 1.Install Hugo

```bash
brew install hugo
```
See Hugo Docs for more options:
- [MacOS](https://gohugo.io/installation/macos/)
- [Linux](https://gohugo.io/installation/linux/)
- [Windows](https://gohugo.io/installation/windows/)

### 2. Create a new site 

```s
hugo new site <siteName>
```

### 3.Install this project

1. Open your `<siteName>` project directory.
2. Navigate to the `themes/` directory. 
3. Run the following command:

   ```bash
   gh repo clone lbliii/milodocs
   ```

### 4. Add theme to config

```s
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = 'milodocs'
```

### 5. Init repo

Time to start saving your progress! 
1. Run the following:
   ```s
   git init
   ```
2. Add a comment.
3. Push your new site and theme to your remote git repo.

### 6. Deploy locally 

1. Navigate into the `siteName` repo.
2. Run the following:
   ```s
   hugo server
   ```
3. Open localhost (typically [localhost:1313](http://localhost:1313)).