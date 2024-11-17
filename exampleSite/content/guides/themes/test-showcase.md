---
title: Test & Showcase Your Hugo Theme
description: Learn how to test your Hugo Theme from within the same repo.
---

Hugo themes typically exist as standalone GitHub repositories that users can use for their projects-—either as a Git Submodule or Hugo Module.

To enable clean separation of theme logic while still providing real-world examples of how to use the theme, create an `exampleSite` directory. In this directory, set up a demo site that utilizes your theme and includes content that documents and showcases the theme's features. **This site serves as an example of this.**

Users can unpack the `exampleSite` directory to experiment with a demo site or use it as a starting point for their own site using your theme.

## How to locally test your theme

You don't want to reference your own theme as a dependency when testing it, so you can build the site using the top-level theme directory as the source.

1. Open the terminal.
2. Run the command `cd exampleSite` to navigate into the `exampleSite` directory.
3. Run the command `hugo server --theme ../..` to build the site using the top-level theme directory as the source.

## How to deploy a demo site

### Netlify

1. Create a `netlify.toml` file in the root of your theme repo (not in the `exampleSite` directory).
2. Copy and paste the following into the `netlify.toml` file.
   {{%include "netlify.toml" "toml" %}}
3. Update the `HUGO_THEME` variable to the name of your theme; it must match the value found in the top-level `theme.toml` file.

### AWS Amplify 

TBD