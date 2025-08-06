---
title: "Development & Debug Features"
description: "Advanced development tools and debugging features for theme developers"
weight: 200
---

## Overview

This theme includes advanced development and debugging features powered by Hugo's latest template introspection capabilities. These tools help developers understand template execution, optimize performance, and debug complex template hierarchies.

## Debug Mode

### Enabling Debug Mode

Debug mode provides real-time template execution information directly in your browser during development.

**Step 1: Enable in Configuration**
```yaml
# In params.yaml
debug: true
```

**Step 2: Start Development Server**
```bash
# Using makefile
make dev-debug

# Or directly with Hugo
hugo server
```

### Debug Panel Features

When debug mode is enabled, you'll see a **fixed debug panel** in the bottom-right corner of every page containing:

- **Current Template**: Shows the active template name
- **Call Stack**: Displays the complete template execution chain
- **VS Code Integration**: Click any template name to open it directly in VS Code
- **Template Hierarchy**: Visual representation of template inheritance

### VS Code Integration

The debug panel includes clickable links that use the `vscode://` URI scheme:

```html
<!-- Example debug link -->
<a href="vscode://file/path/to/template.html">template.html</a>
```

**Requirements:**
- VS Code must be installed
- VS Code must be set as the default handler for `vscode://` URLs

## Template Introspection (templates.Current)

This theme leverages Hugo's `templates.Current` function (available in Hugo v0.146.0+) for advanced template debugging.

### What It Provides

- **Real-time template execution tracking**
- **Template call stack visualization** 
- **Performance bottleneck identification**
- **Template hierarchy understanding**

### Example Output

```text
Current Template: layouts/_default/single.html
Call Stack:
  layouts/_default/baseof.html
  layouts/partials/head.html
  layouts/partials/navigation/sidebar-left.html
  layouts/_default/single.html
```

## Theme Variants

The theme supports multiple branding variants for different use cases.

### Available Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard theme styling | General documentation |
| `nvidia` | NVIDIA corporate branding | NVIDIA products/services |
| `opensource` | Open source project styling | OSS projects |
| `enterprise` | Enterprise/corporate styling | Business products |

### Configuration

**Method 1: Configuration Files (Recommended)**
```bash
# NVIDIA variant
hugo server --config config/_default,config/nvidia

# Open Source variant
hugo server --config config/_default,config/open-source

# Enterprise variant
hugo server --config config/_default,config/enterprise
```

**Method 2: Parameter Override**
```yaml
# In params.yaml
theme:
  variant: "nvidia"    # nvidia, opensource, default, enterprise
  mode: "light"        # light, dark
```

### Makefile Commands

The theme includes a comprehensive makefile for easy development:

```bash
# Development servers (theme development)
make dev-nvidia       # NVIDIA variant
make dev-opensource   # Open Source variant  
make dev-enterprise   # Enterprise variant
make dev-debug        # With debug mode enabled
make dev-external     # External theme testing

# Production builds
make build-nvidia     # NVIDIA production build
make build-opensource # Open Source production build
make build-enterprise # Enterprise production build

# Testing
make test-all-variants # Test all variants
make debug-info        # Show Hugo version info

# Help
make help             # Show all available commands
```

**Note:** Development commands (`make dev-*`) automatically include `--themesDir ../..` since the exampleSite is nested within the theme repository. Use `make dev-external` when testing the theme as an external dependency.

## Environment vs Variant Separation

The theme properly separates concerns between Hugo environments and theme variants:

### Hugo Environment
- **Purpose**: Controls build optimization (development vs production)
- **Values**: `development`, `production`
- **Usage**: Asset minification, debugging features, performance optimization

### Theme Variant  
- **Purpose**: Controls branding and styling
- **Values**: `default`, `nvidia`, `opensource`, `enterprise`
- **Usage**: Fonts, colors, logos, brand-specific features

### Body Attributes

The theme exposes both values as data attributes for CSS/JavaScript targeting:

```html
<body data-theme="light" 
      data-variant="nvidia" 
      data-env="development">
```

**CSS Usage:**
```css
/* Brand-specific styles */
[data-variant="nvidia"] .logo { 
  /* NVIDIA styling */ 
}

[data-variant="opensource"] .logo { 
  /* OSS styling */ 
}

/* Environment-specific */
[data-env="development"] .debug { 
  display: block; 
}

[data-env="production"] .debug { 
  display: none; 
}
```

## Development Workflow

### Recommended Setup

1. **Clone and setup:**
   ```bash
   git clone your-docs-repo
   cd your-docs-repo/exampleSite
   ```

2. **Install dependencies:**
   ```bash
   npm install  # For TailwindCSS
   ```

3. **Start development with debug:**
   ```bash
   make dev-debug  # Enables debug panel
   ```

4. **Enable specific variant:**
   ```bash
   make dev-nvidia     # Test NVIDIA branding
   make dev-opensource # Test OSS branding
   ```

### Debug Workflow

1. **Enable debug mode** in `params.yaml`
2. **Start development server** with `make dev-debug`
3. **Navigate to any page** to see the debug panel
4. **Click template names** to open in VS Code
5. **Monitor template execution** for performance issues
6. **Optimize based on call stack** information

### Production Testing

```bash
# Test production builds for all variants
make build-default
make build-nvidia  
make build-opensource
make build-enterprise

# Verify all variants build successfully
make test-all-variants
```

## Troubleshooting

### Debug Panel Not Showing

1. **Check configuration:**
   ```yaml
   debug: true  # Must be enabled
   ```

2. **Verify Hugo version:**
   ```bash
   hugo version  # Must be v0.146.0+
   ```

3. **Check environment:**
   ```bash
   # Debug only shows in development
   hugo server  # NOT hugo server --environment production
   ```

### VS Code Links Not Working

1. **Install VS Code** and ensure it's in your PATH
2. **Set VS Code as default** for `vscode://` URLs
3. **Enable URL handling** in VS Code settings

### Template Errors

Use the makefile's testing commands:

```bash
make debug-info        # Check Hugo version/modules
make test-all-variants # Test all configurations
```

## Advanced Features

### **Environment Intelligence System**

The theme includes advanced environment-aware capabilities:

#### **JavaScript Environment Detection**
```javascript
// Automatic environment data available in browser
window.HugoEnvironment = {
  environment: "nvidia",
  isProduction: false,
  debug: true,
  version: "0.0.3",
  baseURL: "http://localhost:1313/",
  buildTime: "1703875200000"
};
```

#### **CSS Custom Properties**
```css
:root {
  --hugo-environment: "nvidia";
  --hugo-build: "development";
  --theme-version: "0.0.3";
}
```

#### **Debug Keyboard Shortcuts**
- **`Ctrl+Shift+D`**: Toggle debug panel
- **`Ctrl+Shift+P`**: Show performance metrics in console
- **`Ctrl+Shift+R`**: Show resource timing data
- **`Ctrl+Shift+E`**: Show environment configuration

### **Environment-Specific Features**

#### **NVIDIA Environment**
- Custom NVIDIA fonts with preloading optimization
- Corporate color scheme (`#76b900`)
- Brand-specific performance optimizations
- Enterprise analytics integration points

#### **Open Source Environment**  
- Community-focused styling (`#ff6b6b`)
- GitHub integration features
- Contribution tracking capabilities
- Public documentation enhancements

#### **Enterprise Environment**
- Professional color scheme (`#6366f1`)
- Compliance tracking features
- Audit logging (production builds only)
- Security headers validation

## Requirements

- **Hugo v0.146.0+** (for `templates.Current` support)
- **VS Code** (optional, for debug panel integration)
- **Node.js/npm** (for TailwindCSS compilation)

## Related Documentation

- [Configuration Guide](/get-started/configure/) - Basic theme configuration
- [Installation](/get-started/install/) - Theme installation
- [Makefile Reference](/features/makefile/) - All available makefile commands