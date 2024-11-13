---
title: Vale
description: Learn how to use Vale to check your content for errors.
---

[Vale](https://vale.sh/) is an open-source command-line tool (CLI) that checks your content for errors and can surface issues through your IDE's terminal (via the **Problems** tab) or inline alongside your content. It's a great way to ensure your content is consistent and follows your project's style guide. It's also easy to use with other contributors to your documentation site.


## Before you start 

Vale must be configured with a `.vale.ini` file and tailored to your specific project's needs. In this guide, I'll show you how to configure Vale to work for a Hugo-based documentation site that follows the Microsoft style guide. Feel free to swap out the [packages](https://vale.sh/docs/topics/packages/) I've selected for your own project's needs. 

---


## How to add Vale to your documentation repository

{{<notice snack>}}
If you are using this theme, the `.vale.ini` file is already provided and you just need to install and run Vale.
{{</notice >}}

1. Install Vale.
   ```sh
   brew install vale
   ```
2. Navigate to the root of your documentation repo.
3. Create a `.vale.ini` file.
4. Provide the following initial settings.
   {{%include ".vale.ini" "toml" %}}
5. Run Vale.
   ```sh
   vale sync
   ```
6. Review Vale errors in your content.


Other contributors to your documentation can install Vale and run `vale sync` in their local environment to check their content for errors.