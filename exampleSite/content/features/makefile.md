---
title: Makefile Reference
description: Complete reference for all Makefile commands available in this Hugo theme.
weight: 150
---

The theme includes a comprehensive Makefile that automates development workflows, testing, and deployment processes. This guide covers all available commands and their use cases.

## Quick Reference

Get help on all available commands:
```bash
make help
```

## Development Commands

### Starting Development Servers

Start a development server with different theme variants:

```bash
# Default variant (theme development)
make dev

# With debug mode enabled  
make dev-debug

# Specific theme variants (theme development)
make dev-nvidia       # NVIDIA branding
make dev-opensource   # Open source styling
make dev-enterprise   # Enterprise styling

# External theme testing
make dev-external     # Test as external theme dependency
```

**What happens:**
- Starts Hugo development server on `http://localhost:1313`
- Enables live reload for instant preview of changes
- Uses development environment (unminified assets)
- Debug variants enable template debugging panel

**Important:** Development commands (`make dev-*`) include `--themesDir ../..` because the exampleSite is nested within the theme repository. Use `make dev-external` when the theme is installed as an external dependency.

### Theme Variant Testing

Test specific theme configurations:

```bash
make dev-nvidia       # Test NVIDIA variant
make dev-opensource   # Test Open Source variant  
make dev-enterprise   # Test Enterprise variant
```

Each variant loads:
- Variant-specific configuration from `config/{variant}/`
- Brand-specific fonts, colors, and styling
- Customized logos and organization details

## Production Commands

### Building for Production

Create optimized production builds:

```bash
# Build specific variants
make build-default      # Default variant
make build-nvidia       # NVIDIA variant
make build-opensource   # Open Source variant
make build-enterprise   # Enterprise variant
```

**Production optimizations:**
- Asset minification and compression
- CSS/JS bundling and fingerprinting
- Image optimization
- SEO enhancements

### Offline Documentation

Build standalone documentation packages:

```bash
make offline          # Production offline build
make offline-drafts   # Include draft content
```

**Output:**
- Creates `offline-docs.tar.gz` containing complete site
- Compatible with `file://` protocol for air-gapped environments
- Includes all assets and dependencies

## Testing & Quality Assurance

### Comprehensive Testing

Test all theme variants:

```bash
make test-all-variants
```

**What it tests:**
- Build success for all variants
- Configuration validity
- Template compilation
- Asset pipeline

### Debug Information

Get system information:

```bash
make debug-info
```

**Provides:**
- Hugo version and build information
- Module dependency graph
- Configuration validation

## API Documentation

### OpenAPI Integration

Generate REST API documentation from OpenAPI specifications:

```bash
# Custom specification
make api-gen INPUT=your-spec.yaml OUTPUT=processed.json

# Test with example
make api-gen-test
```

**Process:**
1. Runs `tools/spec-preprocessor.py` script
2. Resolves component references
3. Generates theme-compatible JSON
4. Ready for use with `layout: api`

**Usage in content:**
```yaml
---
title: "API Reference"
layout: api
reference: "processed"  # References /data/processed.json
---
```

## Version Management

### Release Management

Update version information across documentation:

```bash
make v-bump P=product_name VDIR=version_dir V=version_number
```

**Updates:**
- Product release frontmatter
- Supported release tables
- Version-specific configurations

## Configuration Examples

### Environment-Specific Builds

The Makefile properly separates Hugo environments from theme variants:

```bash
# Development with NVIDIA branding
make dev-nvidia

# Production build with NVIDIA branding  
make build-nvidia

# Debug mode with any variant
make dev-debug
```

### Custom Configurations

Override default behavior:

```bash
# Custom config combination
hugo server --config config/_default,config/nvidia,config/custom

# Environment override
HUGO_ENVIRONMENT=production make dev-nvidia
```

### Development Setup Scenarios

**Scenario 1: Theme Development (Nested exampleSite)**
```bash
# You're working inside the theme repository
cd path/to/milodocs/exampleSite
make dev-nvidia  # Uses --themesDir ../..
```

**Scenario 2: External Theme Usage**
```bash
# You're using the theme as a dependency
cd your-hugo-site
make dev-external  # No --themesDir needed
```

**Scenario 3: Custom Hugo Commands**
```bash
# Manual commands for theme development
hugo server --config config/_default,config/nvidia --themesDir ../..

# Manual commands for external usage
hugo server --config config/_default,config/nvidia
```

## Workflow Integration

### Recommended Development Flow

1. **Start with debug mode:**
   ```bash
   make dev-debug
   ```

2. **Test specific variants:**
   ```bash
   make dev-nvidia
   make dev-opensource  
   ```

3. **Validate before deployment:**
   ```bash
   make test-all-variants
   ```

4. **Build for production:**
   ```bash
   make build-nvidia  # or your target variant
   ```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Test all variants
  run: make test-all-variants
  
- name: Build production
  run: make build-enterprise
  
- name: Create offline package  
  run: make offline
```

## Source code 

{{%include "makefile" "bash" %}}