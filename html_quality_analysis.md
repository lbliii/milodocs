# HTML Quality Analysis - MiloDocs

## Current State Assessment

### Issues Identified

1. **Mixed CSS Approach** - Templates contain both Tailwind classes AND CSS custom properties (inline styles)
2. **Inconsistent Semantic Structure** - Some good practices mixed with divitis
3. **Class Dependencies** - Many CSS classes that no longer exist, causing visual breaks
4. **Accessibility Gaps** - Missing ARIA labels, focus management issues
5. **Inline Styles** - Using CSS custom properties in style attributes instead of clean semantic classes

### Examples of Problems

#### baseof.html
```html
<!-- ❌ Problem: Mixed classes + inline styles -->
<html class="no-js {{ if eq (site.Params.theme.mode | default "dark") "dark" }}dark{{ end }}">
<body class="bg-bg-primary antialiased" data-environment="...">
<main class="layout-shell {{ $densityClass }}" style="{{ delimit $styleVars ";" }}">
```

#### single.html  
```html
<!-- ❌ Problem: Inline styles + non-existent classes -->
<h1 style="color: var(--color-text-primary);">{{ .Title }}</h1>
<div style="background-color: var(--color-brand); opacity: 0.25;"></div>
<span style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);">
```

#### sidebar-left.html
```html
<!-- ❌ Problem: Complex class mixing -->
<aside class="sidebar block fixed xl:sticky left-0 top-0 xl:top-16 z-40 h-full xl:h-[calc(100vh-4rem)] w-80 xl:w-auto -translate-x-full xl:translate-x-0 transition-all duration-300 ease-in-out overflow-y-auto pr-1">
```

## HTML Design Principles (Target State)

### 1. Semantic HTML Structure
```html
<!-- ✅ Proper semantic structure -->
<html lang="en" dir="ltr">
<body data-theme="dark" data-environment="development">
  <header role="banner">
    <nav role="navigation" aria-label="Primary">
  <main role="main">
    <article>
      <header>
        <h1>Page Title</h1>
      </header>
      <section>
        <h2>Section Title</h2>
      </section>
    </article>
  </main>
  <aside role="complementary" aria-label="Table of contents">
  <footer role="contentinfo">
</body>
```

### 2. Clean Data Attributes for JavaScript
```html
<!-- ✅ Clean data attributes -->
<nav data-component="sidebar" data-sidebar-position="left">
  <button data-sidebar-toggle aria-expanded="false" aria-controls="sidebar-content">
  <div id="sidebar-content" data-sidebar-content>
```

### 3. Proper ARIA and Accessibility
```html
<!-- ✅ Proper accessibility -->
<button 
  type="button"
  aria-label="Toggle navigation menu"
  aria-expanded="false"
  aria-controls="navigation-menu"
  data-component="nav-toggle">
  
<nav 
  id="navigation-menu"
  role="navigation"
  aria-label="Primary navigation"
  aria-hidden="true">
```

### 4. Minimal, Semantic Classes
```html
<!-- ✅ Semantic component classes -->
<article class="article">
  <header class="article__header">
    <h1 class="article__title">Title</h1>
    <p class="article__description">Description</p>
  </header>
  <div class="article__content">
    Content...
  </div>
  <footer class="article__footer">
    <div class="tag-list">
      <span class="tag">Tag 1</span>
    </div>
  </footer>
</article>
```

## Template Rebuild Priority

### Phase 1: Core Structure (Week 1)
1. **baseof.html** - Master template with clean semantic structure
2. **header.html** - Site header with proper navigation
3. **footer.html** - Site footer
4. **sidebar-left.html** - Primary navigation with accessibility

### Phase 2: Content Templates (Week 2)  
1. **single.html** - Article pages with proper content structure
2. **list.html** - Index/listing pages
3. **home.html** - Homepage layout

### Phase 3: Navigation Components (Week 3)
1. **breadcrumbs.html** - Breadcrumb navigation
2. **topbar/main.html** - Top navigation bar
3. **sidebar-right.html** - Secondary navigation/TOC

### Phase 4: Content Components (Week 4)
1. **article/header.html** - Article headers
2. **article/toc.html** - Table of contents
3. **article/next-prev.html** - Page navigation

### Phase 5: Shortcodes (Week 5)
1. **notice.html** - Alert/callout boxes
2. **collapse.html** - Collapsible content
3. **video.html** - Media embeds

## HTML Standards to Establish

### Naming Conventions
- **Semantic elements**: Use proper HTML5 semantic tags
- **Component classes**: `.component`, `.component__element`, `.component--modifier`
- **State classes**: `.is-active`, `.is-open`, `.has-content`
- **Data attributes**: `data-component="name"`, `data-component-state="value"`

### Accessibility Requirements
- All interactive elements must have proper ARIA labels
- Keyboard navigation must work without JavaScript
- Focus management for dynamic content
- Screen reader announcements for state changes

### Template Structure
- Each partial should have a single responsibility  
- Pass data explicitly via Hugo dict patterns
- Use semantic HTML elements appropriately
- Minimize nesting depth

## Next Steps

1. Create HTML pattern library for each component type
2. Rebuild templates one by one with immaculate HTML
3. Test accessibility and keyboard navigation
4. Only add CSS after HTML is perfect
