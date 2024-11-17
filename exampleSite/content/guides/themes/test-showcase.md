---
title: Test & Showcase Your Hugo Theme
description: Learn how to test your Hugo Theme from within the same repo.
---

Hugo themes are typically created as standalone GitHub repos that can be easily cloned and used by others -- either as a Git Submodule or Hugo Module.

To enable clean separation of theme logic while stile providing real-world examples of how to use the theme, you can create an `exampleSite` directory. In this directory, set up a demo site that utilizes your theme and provides content that documents and showcases the theme's features. **This site is an example of this.**

Users will be able to unpack that `exampleSite` directory to tinker with as a demo site, or use it as a starting point for their own site using your theme.

## How to locally test your theme

You don't want to reference your own theme as a dependency when testing it, so you can build the site using the top-level theme directory as the source.

1. Open the terminal.
2. Run the command `cd exampleSite` to navigate into the `exampleSite` directory.
3. Run the command `hugo  --theme ../..` to build the site using the top-level theme directory as the source.



## How to deploy a demo site

### Netlify

1. Create a `netlify.toml` file in the root of your theme repo (not in the `exampleSite` directory).
2. Copy and paste the following into the `netlify.toml` file.
   {{%include "netlify.toml" "toml" %}}
3. Update the `HUGO_THEME` variable to the name of your theme; it must match the value found in the top-level `theme.toml` file.
    {{%include "theme.toml" "toml" %}}

### AWS Amplify 

TBD