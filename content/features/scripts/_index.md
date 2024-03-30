---
title: Scripts
description: "A series of helper scripts for rendering isolated product or org-specific content." 
---

## About

Technical documentation often requires building and rendering content for multiple products or organizations. This theme provides a series of helper scripts that allow you to render isolated product or org-specific content by leveraging the `hugo.Environment` variable in your [Layout](/reference/layouts) templates. 


## Use Cases

- **Offline Documentation**: Use the `build-offline-site.sh` script to create a compressed `.tar.gz` file of the site that can be used for offline viewing that is `file://` protocol compatible.
- **Environment-specific Deploys**: Use the `env.sh` script to build your site based on a specific environment passed with the `hugo` build command as an argument. 
- **Multiple Brands**: Use the `env.sh` script to build content for an `enterprise` or `opensource` brand.
- **Scoped Content**: Use the `product.sh` script to build content for a specific product or set of products in your product suite.

See the [Tools](/reference/tools) section for specific information about each script.