---
title: Get Started
description: How to get started with the theme.
weight: 100
icon: "fast_forward.svg"
---

## Before You Start

- This section assumes that you have experience with terminals, CLIs, and IDEs (e.g., VS Code)
- You should ideally have a git tool (e.g., [GitHub](https://github.com)) to store and manage your site repo

## Why use Hugo?

- **Affordable**: Technical Writers usually have a razor-thin budget; you can deploy docs with [Hugo](https://gohugo.io/) + [Netlify](https://www.netlify.com) (or [Render](https://render.com/), [Vercel](https://vercel.com/)) for free in most cases (Startup, Open Source)
- **Scalable**: Hugo is the fastest SSG, supports localization, is un-opinionated in terms of style, and is easy to evolve alongside your product
- **Ergonomic**: The drafting UX is markdown focused with near-instant local previews; for non-tehchnical contributors, you can plug into CMS interfaces (e.g., [Frontmatter](https://frontmatter.codes/))
- **Agnostic**: You'll always own your docs, and transforming content into [JSON](/index.json) or [XML](/index.xml) is as easy as defining an output template (great for search tools like [Algolia](http://algolia.com)!)

## Why use This Theme?

- **No Manual Menus**: All sections are auto-sorted based on either a `weight` value or `a-z` title order
- **Deep Section Nesting**: Tech docs tend to need sub-sub-sub sections, y'know?
- **Discovery UX Components**: Algolia Search & ChatGPT UIs are OOTB for easy hookup
- **Battle Tested Shortcodes**: I've been deploying Hugo for tech docs for 5+ years; this is my personal collection of need-to-haves, made as agnostically as possible
- **TailwindCSS + VanillaJS**: You'll be able to modify this theme to your liking using the basics with minimal dependencies
- **Brandable**: Colors and fonts have their own CSS files; the TailwindCSS extensions mapped to these styles use generic names like `font-brand`, `font-semibold`, and `brand-color-1`.