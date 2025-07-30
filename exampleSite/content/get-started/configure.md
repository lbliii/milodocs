---
title: Configure
description: Learn how to configure the basics (site URL and metadata).
weight: 300
---

After you have locally installed Hugo and deployed a copy of this theme, you can start configuring your site. This guide will walk you through the basics of configuring your site, including setting the site address (URL) and metadata.


## How to configure your site

### 1. Update site details

1. Open the `config/_default/hugo.yaml` file in your code editor.
2. Update the `baseURL` with the address of your site.
3. Update the `title`.

```yaml
baseURL: "https://example.com"
title: "My Hugo Site"
```

### 2. Update theme variables

#### Update organization and product details

1. Open the `config/_default/params.yaml` file in your code editor.
2. Update the `organization` to reflect your organization's name.
3. Update the `product` to reflect your product's name.

#### Configure theme variant and mode

The theme supports multiple branding variants and display modes:

```yaml
# Theme Configuration
theme:
  variant: "default"  # Options: default, nvidia, opensource, enterprise
  mode: "light"       # Options: light, dark
```

**Available Variants:**
- **`default`**: Standard theme styling for general documentation
- **`nvidia`**: NVIDIA corporate branding and styling
- **`opensource`**: Open source project styling
- **`enterprise`**: Enterprise/corporate styling

#### Enable development features

For development and debugging, you can enable additional features:

```yaml
# Development & Debug Settings
debug: false  # Set to true to enable template debugging information
```

When `debug: true` is set, the theme will show a debug panel in development mode with:
- Current template information
- Template execution call stack
- VS Code integration links
- Performance insights

#### Update feature settings

You can optionally update the `features` section to enable or disable certain theme features.

{{%include "config/_default/params.yaml" "yaml" %}}

### 3. Environment-specific configuration

The theme supports environment-specific configurations using Hugo's config directory structure:

```
config/
├── _default/          # Base configuration
├── nvidia/           # NVIDIA variant overrides
├── open-source/      # Open source variant overrides  
├── enterprise/       # Enterprise variant overrides
└── offline/          # Offline build configuration
```

**Usage examples:**
```bash
# Default configuration
hugo server

# NVIDIA variant
hugo server --config config/_default,config/nvidia

# Open source variant
hugo server --config config/_default,config/open-source

# Enterprise variant  
hugo server --config config/_default,config/enterprise
```

### 4. Production vs Development

The theme automatically optimizes assets based on Hugo's environment:

- **Development** (`hugo server`): Unminified assets, debug features enabled
- **Production** (`hugo --environment production`): Minified assets, optimized for performance

The `debug` parameter only shows debug information in development mode, regardless of the setting.
