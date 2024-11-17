---
title: defaults
description: Learn how to apply unique article layouts for different content types.
icon: "base.svg"
weight: 300
---

Layouts in the `_default` folder define the major content types and outputs of your Hugo site. 

## Default layouts

The following layouts are typically found in all Hugo sites and likely come with a fresh Hugo theme (`hugo theme new themeName`).

|template|description|[BundleType](https://gohugo.io/methods/page/bundletype/)|
|-|-|-|-|
|**baseof.html**| provides a global "shell" all other templates inherit from. |`branch`||
|**list.html**| renders taxonomy lists (for example, articles with tags).|`branch`||
|**terms.html**| renders taxonomy terms (for example, tags).|`branch`||
|**section.html**| renders markdown files in a directory (`dir/_index.md`).|`branch`||
|**home.html**| renders the `/` page of your site; overrides `content/index.md` if present.|`leaf`||
|**single.html**| renders single pages (for example, articles).|`leaf`||

## Added layouts

The Milo Docs theme adds the following layouts.

|template|description|[BundleType](https://gohugo.io/methods/page/bundletype/)|frontmatter|
|-|-|-|-|-|
|**glossary.html**| renders markdown files as a stacked list in a directory (`dir/_index.md`).|`branch`|`layout: glossary`|
|**tutorial.html**| renders markdown files as a wizard with steps (`dir/_index.md`).|`branch`|`layout: tutorial`|
|**tutorialstep.html**| renders a child markdown file as a tutorial step (`tutorial/step.md`).|`leaf`|`layout: tutStep`|