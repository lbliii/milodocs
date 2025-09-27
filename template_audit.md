# MiloDocs Template Architecture Audit

## Overview
Total templates: 143 HTML files
Goal: Design immaculate HTML structure before CSS implementation

## Template Categories

### Core Layouts (High Priority)
These define the main page structure and are used on every page:

1. **`_default/baseof.html`** - Master template, defines HTML structure
2. **`_default/single.html`** - Individual content pages (articles, docs)
3. **`_default/list.html`** - List/index pages (section overviews)
4. **`_default/section.html`** - Section pages
5. **`_default/home.html`** - Homepage layout

### Navigation & Layout Partials (High Priority)
Essential for site navigation and structure:

1. **`partials/header.html`** - Site header
2. **`partials/footer.html`** - Site footer
3. **`partials/navigation/sidebar-left.html`** - Main navigation
4. **`partials/navigation/sidebar-right.html`** - Table of contents/meta
5. **`partials/navigation/topbar/main.html`** - Top navigation bar
6. **`partials/navigation/breadcrumbs.html`** - Breadcrumb navigation

### Content Partials (Medium Priority)
Handle content display and interaction:

1. **`partials/article/header.html`** - Article headers
2. **`partials/article/toc.html`** - Table of contents
3. **`partials/article/next-prev.html`** - Page navigation
4. **`partials/article/metadata.html`** - Article metadata
5. **`partials/article/tiles.html`** - Content cards/tiles

### Specialized Layouts (Medium Priority)
For specific content types:

1. **`openapi/*.html`** - API documentation (12 files)
2. **`notebook/*.html`** - Jupyter notebook display (3 files)
3. **`tutorial/*.html`** - Tutorial pages (2 files)
4. **`object-model/*.html`** - Object model docs (1 file)

### Shortcodes (Low-Medium Priority)
Content enhancement components:

1. **`shortcodes/notice.html`** - Callout boxes
2. **`shortcodes/collapse.html`** - Collapsible content
3. **`shortcodes/video.html`** - Video embeds
4. **`shortcodes/mermaid.html`** - Diagrams
5. **`shortcodes/quicklinks.html`** - Link collections
6. **`shortcodes/tab.html`** - Tabbed content

### Utility Partials (Low Priority)
Helper templates and utilities:

1. **`partials/head.html`** - HTML head
2. **`partials/head/css.html`** - CSS loading
3. **`partials/head/js.html`** - JavaScript loading
4. **`partials/utils/*.html`** - Various utilities (6 files)

## HTML Design Principles

### 1. Semantic HTML First
- Use appropriate HTML elements (`article`, `section`, `nav`, `aside`, `header`, `footer`)
- Proper heading hierarchy (h1-h6)
- Lists for navigation and content groupings
- Forms for interactive elements

### 2. Accessibility Standards
- ARIA attributes where needed
- Proper focus management
- Screen reader support
- Keyboard navigation

### 3. Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features layered on top
- Graceful degradation

### 4. Data Attributes for Hooks
- `data-component` for JavaScript components
- `data-*` for configuration and state
- Stable selectors for testing

## Next Steps

1. **Design HTML patterns** for each component category
2. **Create semantic component templates** without any CSS classes
3. **Establish HTML standards** for consistency
4. **Build component hierarchy** from simple to complex
5. **Add CSS framework** after HTML is perfected
