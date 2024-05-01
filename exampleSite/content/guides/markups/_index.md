---
title: Alternative Markups
description: learn how to support alternative markups in Hugo.
---

Sometimes you need to support additional markups that work better for your team/project. The guides in this section will walk you through how to configure a Hugo site to support either rendering a whole file (e.g., `my-file.rst`) or inline content wrapped in a shortcode.

{{<notice warning>}}
Your site builds may take longer if you are rendering a lot of alternative markup content. This is due to Hugo needing to execute additional helper tools for parsing non-markdown content. Test this at scale before committing to use. 
{{</notice>}}