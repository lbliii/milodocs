---
title: version.html
description: learn how to use the version shortcode
---

If the project you are documenting must be installed, it is likely that your documentation needs to be versioned. In this scenario, it's especially useful to have a shortcode that can also version your **download links**, **github links**, **announcements**, and **similar assets** without having to manually update them across all of your articles. 

## How it Works

1. Set up a `content/latest` directory to begin versioning your documentation.
2. Add the following frontmatter to `content/latest/_index.md`, updating the version numbers:
   ```yaml
   cascade:
       version:
           isLatest: true
           major: 0
           minor: 0 
           patch: 0
   ```
3. Use the `{{</*version*/>}}` shortcode to print out the collection's versions anywhere beneath the directory.

### Examples 

{{<notice note>}}
{{<prod>}} Theme does not _actually_ have versioned documentation; this is just for demonstration purposes. 
{{</notice>}}

#### Local Version 

The default functionality for this shortcode uses the version numbers cascading from the root of the versioned directory (e.g., `content/latest`, `content/1.0.2`). 

- **{{<version>}} is now live!**
- [{{<version>}} Download](https://github.com/org/project/releases/tag/v{{<version>}})

```s
- **{{</*version*/>}} is now live!**
- [{{</*version*/>}} Download](https://github.com/org/project/releases/tag/v{{</*version*/>}})
```

#### Global Version 

In cases where you want to mention or link to the latest version in older versions of your content, you can add `{{</*version "global"*/>}}`. This uses the site-wide parameter to determine what version number to use.

```yaml
<!-- hugo.yaml -->
# Theme Feature Settings
params: 
  [...]
  version: 
    major: 0
    minor: 0
    patch: 3
```

- **{{<version "global">}} is now live!**
- [{{<version "global">}} Download](https://github.com/org/project/releases/tag/v{{<version "global">}})

```s
- **{{</*version "global"*/>}} is now live!**
- [{{</*version "global"*/>}} Download](https://github.com/org/project/releases/tag/v{{</*version "global"*/>}})
```

## Source Code 

{{%include "layouts/shortcodes/version.html" "golang" %}}
