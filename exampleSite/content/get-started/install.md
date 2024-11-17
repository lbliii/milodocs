---
title: Install
description: Learn how to install Hugo and the theme.
weight: 100
---

Getting from 0 to 1 takes ~5 minutes. 

## 1. Install Hugo 

```bash
brew install hugo
```
See Hugo Docs for more options:
- [MacOS](https://gohugo.io/installation/macos/)
- [Linux](https://gohugo.io/installation/linux/)
- [Windows](https://gohugo.io/installation/windows/)

## 2. Create a new site 

```s
hugo new site <siteName>
```

## 3. Install this project

1. Open your `<siteName>` project directory.
2. Navigate to the `themes/` directory. 
3. Run the following command:

   ```bash
   gh repo clone lbliii/milodocs
   ```

## 4. Add theme to config

```s
baseURL = 'https://example.org/'
languageCode = 'en-us'
title = 'My New Hugo Site'
theme = 'milodocs'
```

## 5. Init repo

Time to start saving your progress! 
1. Run the following:
   ```s
   git init
   ```
2. Add a comment.
3. Push your new site and theme to your remote git repo.

## 6. Deploy locally 

1. Navigate into the `siteName` repo.
2. Run the following:
   ```s
   hugo server
   ```
3. Open localhost (typically [localhost:1313](http://localhost:1313)).

{{<notice snack "yay! you did it!">}}

You've done the hardest part: installing and deploying [Hugo](https:gohugo.io) with a theme. See the next page to learn how to clear out my default content and start drafting.

{{</notice>}}

