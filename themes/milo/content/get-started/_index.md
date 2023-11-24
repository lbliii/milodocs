---
title: Get Started
description: How to get started with the Milo theme.
weight: 100
icon: "fast_forward.svg"
---

## Before You Start

- This guide assumes that you have some experience with terminal, CLIs, and IDEs (e.g., VS Code)
- You should ideally have a GitHub account to store and manage your site repo

## 1. Install Hugo 

```bash
brew install hugo
```
See Hugo Docs for more options:
- [MacOS](https://gohugo.io/installation/macos/)
- [Linux](https://gohugo.io/installation/linux/)
- [Windows](https://gohugo.io/installation/windows/)

## 2. Create a New Site 

```s
hugo new site <siteName>
```

## 3. Install This Project

1. Open your `<siteName>` project directory.
2. Navigate to the `themes/` directory. 
3. Run the following command:

   ```bash
   gh repo clone lbliii/milo-theme
   ```
## 4. Init Repo

Time to start saving your progress! 
1. Run the following:
   ```s
   git init
   ```
2. Add a comment.
3. Push your new site and theme to your remote git repo.

## 5. Deploy locally 

1. Navigate into the `siteName` repo.
2. Run the following:
   ```s
   hugo server
   ```
3. Open localhost (typically [localhost:1313](http://localhost:1313)).

{{<notice snack "yay! you did it!">}}

You've done the hardest part: installing and deploying Hugo with a theme. See the next page to learn how to clear out my default content and start drafting.

{{</notice>}}