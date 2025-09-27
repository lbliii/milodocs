# HTML Master Plan - MiloDocs Enterprise Theme

## Executive Summary

**Goal**: Clean, semantic HTML for 143 template files supporting enterprise technical documentation
**Strategy**: Consolidate redundant templates, establish patterns, build incrementally
**Priority**: Core functionality first, specialized content types second

## Template Consolidation Strategy

### ✅ COMPLETED (4 files)
- `_default/baseof.html` - Master template foundation
- `_default/single.html` - Technical articles
- `_default/list.html` - Section/listing pages  
- `_default/home.html` - Homepage

### 🔥 PHASE 1: Core Navigation & Layout (8 files)
**Priority**: Critical - Site unusable without these

1. **`partials/header.html`** - Site header with branding
2. **`partials/footer.html`** - Site footer with links
3. **`partials/navigation/sidebar-left.html`** - Primary navigation ✨ Clean up existing
4. **`partials/navigation/sidebar-right.html`** - TOC/metadata ✨ Clean up existing  
5. **`partials/navigation/topbar/main.html`** - Top navigation bar ✨ Clean up existing
6. **`partials/navigation/breadcrumbs.html`** - Breadcrumb navigation ✨ Clean up existing
7. **`partials/head.html`** - HTML head with meta ✨ Clean up existing
8. **`404.html`** - Error page

### 📄 PHASE 2: Article Components (12 files)
**Priority**: High - Core content functionality

1. **`partials/article/header.html`** - Article headers with metadata
2. **`partials/article/toc.html`** - Table of contents
3. **`partials/article/next-prev.html`** - Page navigation
4. **`partials/article/metadata.html`** - Article metadata display
5. **`partials/article/status-warnings.html`** - Content status alerts
6. **`partials/article/page-resources.html`** - Related downloads/links
7. **`partials/article/related-content.html`** - Related articles
8. **`partials/article/tiles.html`** - Content cards for home/sections
9. **`partials/article/table-of-contents.html`** - Inline TOC
10. **`partials/article/toc-items.html`** - TOC list items (consolidate into main TOC)
11. **`partials/article/child-links.html`** - Child page links
12. **`partials/article/copy-page.html`** - Copy page functionality

### 🔧 PHASE 3: Specialized Layouts (8 files - Consolidate from 18)
**Priority**: Medium - Content type support

#### API Documentation (4 files - from 35 files)
1. **`openapi/single.html`** - API documentation pages
2. **`partials/openapi/overview.html`** - API overview section
3. **`partials/openapi/endpoints.html`** - Endpoint listings  
4. **`partials/openapi/schemas.html`** - Schema documentation

**❌ REMOVE**: Most openapi partials (35→4) - Too granular, consolidate into main templates

#### Specialized Content (4 files)
1. **`notebook/single.html`** - Jupyter notebook display
2. **`_default/glossary.html`** - Glossary/reference pages
3. **`_default/api.html`** - API landing pages (merge with openapi/single.html)
4. **`object-model/single.html`** - Object model documentation

**❌ REMOVE**: 
- `tutorial/single.html`, `tutorial/section.html` (use default layouts)
- `release-notes/section.html` (use default list layout)
- `api-landing.html` (consolidate with api.html)

### 🎛️ PHASE 4: Essential Shortcodes (12 files - from 27)
**Priority**: Medium - Content enhancement

#### Keep & Clean (12 files)
1. **`shortcodes/notice.html`** - Alert/callout boxes
2. **`shortcodes/collapse.html`** - Collapsible content
3. **`shortcodes/tab.html`** - Tabbed content
4. **`shortcodes/video.html`** - Video embeds
5. **`shortcodes/mermaid.html`** - Diagrams
6. **`shortcodes/asciinema.html`** - Terminal recordings
7. **`shortcodes/csv.html`** - CSV table display
8. **`shortcodes/quicklinks.html`** - Link collections
9. **`shortcodes/include.html`** - File includes
10. **`shortcodes/readfile.html`** - File content display
11. **`shortcodes/sphinx.html`** - Sphinx documentation
12. **`shortcodes/rst.html`** - reStructuredText support

#### Remove (15 files) - Minimal value
**❌ REMOVE**: 
- Simple text replacements: `productName.html`, `orgName.html`, `prod.html`, `ascii.html`, `shared.html`
- Version helpers: `version.html`, `release/*` (4 files)
- Doc generators: `pdoc.html`, `pdoc-2.html`, `helm.html`
- Simple embeds: `logo.html`, `linkref.html`

### 🔧 PHASE 5: Utility Partials (8 files - from 20)
**Priority**: Low - Helper functions

#### Keep & Clean (8 files)
1. **`partials/head/css.html`** - CSS loading ✅ Already clean
2. **`partials/head/js.html`** - JavaScript loading
3. **`partials/utils/meta.html`** - SEO metadata
4. **`partials/utils/layout-config.html`** - Layout configuration
5. **`partials/utils/title-guard.html`** - Title display logic
6. **`partials/utils/page-kind.html`** - Page type detection
7. **`partials/logo.html`** - Site logo component
8. **`partials/welcome.html`** - Empty state message

#### Remove (12 files) - Overly specific
**❌ REMOVE**:
- Debugging: `css/stats-analyzer.html`, `css/purge-analyzer.html`
- Unused: `searchResultsContainer.html`, `terms.html`
- Consolidate: `utils/breadcrumbs-data.html`, `utils/right-rail.html` (merge into main components)
- Notebook partials (6 files) - consolidate into single notebook template
- API partials (8 files) - too granular

## Implementation Order

### Week 1: Core Foundation
- [x] Core layouts (baseof, single, list, home)
- [ ] Navigation partials (header, footer, sidebars, breadcrumbs)
- [ ] 404 page

### Week 2: Content System
- [ ] Article partials (header, TOC, metadata, navigation)
- [ ] Head/meta partials cleanup

### Week 3: Specialized Content
- [ ] API documentation templates
- [ ] Notebook display templates
- [ ] Glossary and reference layouts

### Week 4: Content Enhancement
- [ ] Essential shortcodes cleanup
- [ ] Utility partials consolidation

### Week 5: Final Cleanup
- [ ] Remove redundant files
- [ ] Test all content types
- [ ] Documentation

## HTML Quality Standards

### Semantic Structure
```html
<!-- ✅ Good: Proper semantic elements -->
<article class="technical-article" data-component="article">
  <header class="article-header">
    <h1>Title</h1>
    <div class="article-meta">
      <time datetime="2024-01-01">Date</time>
    </div>
  </header>
  <div class="article-content">
    Content...
  </div>
</article>
```

### Data Attributes for JavaScript
```html
<!-- ✅ Good: Clean data attributes -->
<nav data-component="sidebar" data-sidebar-state="collapsed">
  <button data-sidebar-toggle aria-expanded="false">
    Toggle
  </button>
</nav>
```

### Accessibility Requirements
- All interactive elements have proper ARIA labels
- Semantic HTML elements used correctly
- Focus management for dynamic content
- Screen reader support via live regions
- Keyboard navigation support

## File Reduction Summary

- **Before**: 143 HTML files
- **After**: ~50 essential files  
- **Reduction**: 65% fewer files to maintain
- **Focus**: Core functionality, better maintainability

## Next Steps

1. Execute phases in order
2. Test each phase thoroughly
3. Remove redundant files after replacement
4. Document new patterns for team use

This consolidation will create a more maintainable, focused codebase while preserving all essential functionality for enterprise technical documentation.
