---
title: Scripts
description: "A series of helper scripts for rendering isolated product or org-specific content." 
---

When building documentation for an organization with multiple products and product versions (especially open source and enterprise), you may need to support building and rendering content for each product and version in isolation. 

For example, let's say your product was originally an open source project named `MiloDocs` with green branding. You then created an enterprise version of the product named `CatDocs` with blue branding. You may want to continue to maintain the open source documentation in the same repository as the enterprise documentation, but support two separate sites: one for `MiloDocs` and one for `CatDocs`.

To support this use case, this theme provides a series of helper scripts that allow you to render isolated product or org-specific content. These scripts are located in the `tools` directory.