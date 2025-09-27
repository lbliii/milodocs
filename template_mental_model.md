# Template Mental Model - MiloDocs Enterprise Theme

## System Architecture Overview

Think of this as a **modular documentation engine** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    HUGO SITE STRUCTURE                     │
├─────────────────────────────────────────────────────────────┤
│  baseof.html (Master Shell)                                │
│  ├── <header> → header.html                                │
│  ├── <nav> → topbar/main.html                             │
│  ├── <main>                                               │
│  │   ├── breadcrumbs.html                                │
│  │   ├── <aside> → sidebar-left.html (Navigation)       │
│  │   ├── <div> → CONTENT AREA (varies by page type)     │
│  │   └── <aside> → sidebar-right.html (TOC/Meta)        │
│  └── <footer> → footer.html                              │
└─────────────────────────────────────────────────────────────┘
```

## Page Type Flow Model

### 1. **Homepage Flow** (`home.html`)
```
User lands → Hero section → Quick links → Section grid → Recent updates
Purpose: Discovery and orientation
Audience: New users, returning users looking for updates
```

### 2. **Section Pages Flow** (`list.html`)
```
User navigates → Section header → Article grid → Pagination
Purpose: Browse content within a topic area
Audience: Users exploring a specific domain (API docs, tutorials, etc.)
```

### 3. **Article Pages Flow** (`single.html`)
```
User reads → Article header → Inline TOC → Content → Footer navigation
Purpose: Consume detailed information
Audience: Users deep-diving into specific topics
```

### 4. **API Documentation Flow** (`openapi/single.html`)
```
Developer lands → API overview → Endpoint list → Interactive examples → Schemas
Purpose: Technical reference and integration
Audience: Developers implementing integrations
```

### 5. **Notebook Flow** (`notebook/single.html`)
```
Data scientist → Notebook header → Code cells → Output visualization → Download options
Purpose: Executable documentation and tutorials
Audience: Data scientists, ML engineers
```

## Component Composition Model

### Core Layout Components (Always Present)
```
header.html
├── logo.html (Site branding)
├── topbar/main.html (Global navigation)
└── User controls (theme, search)

sidebar-left.html
├── navigation/directory.html (Site structure)
└── Mobile toggle controls

sidebar-right.html
├── article/toc.html (Page TOC)
├── article/metadata.html (Page info)
└── Related content widgets

footer.html
├── Site links
├── Legal info
└── Social/contact
```

### Content Components (Contextual)
```
article/header.html
├── Title + description
├── Author/date metadata
├── Status warnings
└── Inline TOC

article/next-prev.html
├── Previous page link
├── Section breadcrumb
└── Next page link

article/related-content.html
├── Same-section articles
├── Tagged content
└── See-also links
```

## Content Type Mapping

### Standard Technical Documentation
```
/docs/               → list.html (Section overview)
/docs/getting-started → single.html (Article)
/docs/api-guide      → single.html (Article)
/tutorials/          → list.html (Tutorial index)
/tutorials/step-1    → single.html (Tutorial step)
```

### API Documentation
```
/api/               → openapi/single.html (API overview)
/api/endpoints      → openapi/single.html (Endpoint reference)
/api/schemas        → openapi/single.html (Schema documentation)
```

### Interactive Content
```
/notebooks/         → list.html (Notebook index)
/notebooks/analysis → notebook/single.html (Jupyter notebook)
/examples/          → list.html (Code examples)
```

### Reference Materials
```
/glossary          → glossary.html (Term definitions)
/reference/        → list.html (Reference index)
/reference/cli     → single.html (CLI documentation)
```

## User Journey Mental Model

### 1. **Discovery Journey**
```
Homepage → Section page → Article
├── Quick links for common tasks
├── Featured content for exploration
└── Search/browse for specific needs
```

### 2. **Learning Journey**
```
Tutorial index → Step-by-step articles → Related concepts
├── Progressive disclosure of complexity
├── Code examples and notebooks
└── Cross-references to API docs
```

### 3. **Reference Journey**
```
API landing → Endpoint details → Schema reference → Code examples
├── Quick access to specific information
├── Interactive examples
└── Copy-paste ready code
```

### 4. **Implementation Journey**
```
Getting started → Integration guide → API reference → Troubleshooting
├── Guided path from concept to production
├── Notebooks for experimentation
└── Support resources
```

## Template Responsibility Model

### Layout Templates (Structure)
- **`baseof.html`**: Master page shell, responsive layout
- **`single.html`**: Individual content consumption
- **`list.html`**: Content browsing and discovery
- **`home.html`**: Site orientation and quick access

### Navigation Templates (Wayfinding)
- **`sidebar-left.html`**: Primary site structure navigation
- **`sidebar-right.html`**: Page-level navigation (TOC)
- **`breadcrumbs.html`**: Context awareness
- **`topbar/main.html`**: Global actions and search

### Content Templates (Information Display)
- **`article/*`**: Article-specific functionality
- **`openapi/*`**: API documentation features
- **`notebook/*`**: Interactive notebook display

### Enhancement Templates (Content Features)
- **Shortcodes**: Inline content enhancement (notices, videos, diagrams)
- **Utilities**: Helper functions and data processing

## Integration Points

### JavaScript Integration
```html
<!-- Each component has clean data attributes -->
<nav data-component="sidebar" data-sidebar-state="collapsed">
  <!-- JS can reliably find and enhance components -->
</nav>
```

### CSS Integration
```html
<!-- Semantic classes for styling -->
<article class="technical-article">
  <header class="article-header">
    <!-- Utility classes for layout, semantic classes for components -->
  </header>
</article>
```

### Hugo Integration
```go
// Templates receive rich context
{{ partial "article/header.html" (dict "article" . "meta" $metadata) }}
```

## Scalability Model

### Adding New Content Types
1. Create specialized layout (e.g., `changelog/single.html`)
2. Reuse existing partials (header, navigation, footer)
3. Add type-specific partials only when needed
4. Maintain consistent data patterns

### Supporting New Features
1. Add partials for new functionality
2. Include in appropriate layouts via Hugo blocks
3. Use data attributes for JS enhancement
4. Extend CSS with new component classes

This mental model ensures:
- **Consistency** across all content types
- **Maintainability** through clear separation
- **Extensibility** for future requirements
- **Performance** through efficient reuse
- **Accessibility** through semantic structure
