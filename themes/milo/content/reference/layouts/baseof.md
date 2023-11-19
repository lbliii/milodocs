---
title: baseof
description: Learn about the baseof template for the Milo Docs theme.
---

## About

The `baseof.html` template is the centralization point that glues the site theme together. All other templates defined in the theme are embedded into this one at build -- meaning that  global logic and stylings defined here.

## Elements

### Body 

The `body` element controls the dark and light theme using the class `bg-white`. 

### Main 

The `main` element houses the **left sidebar**, **content container**, and **right sidebar** partial layouts. By default, the home page uses its own unique `home` block. All other pages use the `main` block.

TODO: explain hugo blocks.
