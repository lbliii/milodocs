# Enterprise Technical Documentation HTML Architecture

## Design Goals

### Enterprise Requirements
- **Multi-format content support**: Markdown, OpenAPI specs, Jupyter notebooks, code samples, API docs
- **Accessibility compliance**: WCAG 2.1 AA standard for enterprise customers
- **Internationalization ready**: RTL support, multiple languages
- **Developer experience**: Clean markup for theming, testing, automation
- **Performance**: Semantic HTML that's fast to parse and render
- **SEO optimized**: Proper structured data and meta information

### Content Type Support
1. **Technical Articles** - In-depth documentation, tutorials, guides
2. **API Documentation** - OpenAPI specs with interactive examples
3. **Code Documentation** - Auto-generated from source code (Sphinx, pdoc)
4. **Jupyter Notebooks** - Interactive data science documentation
5. **Reference Materials** - Glossaries, command references, object models
6. **Tutorial Series** - Step-by-step learning paths
7. **Release Notes** - Version history and changelogs

## Core HTML Patterns

### 1. Document Structure (baseof.html)
```html
<!DOCTYPE html>
<html lang="{{ or site.Language.LanguageCode site.Language.Lang }}" 
      dir="{{ or site.Language.LanguageDirection `ltr` }}"
      data-theme="{{ site.Params.theme.mode | default `auto` }}"
      data-environment="{{ hugo.Environment }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  
  {{/* SEO and meta */}}
  {{ block "head" . }}{{ end }}
  {{ block "head-extra" . }}{{ end }}
</head>
<body data-page-kind="{{ .Kind }}" 
      data-page-type="{{ .Type }}" 
      data-section="{{ .Section }}">
  
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <header role="banner" class="site-header">
    {{ block "site-header" . }}{{ end }}
  </header>
  
  {{ block "site-navigation" . }}{{ end }}
  
  <main id="main-content" role="main" class="site-main">
    <div class="layout-container">
      
      {{ block "breadcrumbs" . }}{{ end }}
      
      <div class="content-layout">
        <aside role="complementary" 
               aria-label="Table of contents" 
               class="content-nav">
          {{ block "content-navigation" . }}{{ end }}
        </aside>
        
        <div class="content-primary">
          {{ block "content" . }}{{ end }}
        </div>
        
        <aside role="complementary" 
               aria-label="Page information" 
               class="content-meta">
          {{ block "content-meta" . }}{{ end }}
        </aside>
      </div>
    </div>
  </main>
  
  <footer role="contentinfo" class="site-footer">
    {{ block "site-footer" . }}{{ end }}
  </footer>
  
  {{ block "scripts" . }}{{ end }}
</body>
</html>
```

### 2. Technical Article Pattern (single.html)
```html
{{ define "content" }}
<article class="technical-article" 
         data-component="article"
         itemscope 
         itemtype="https://schema.org/TechnicalArticle">
  
  <header class="article-header">
    <div class="article-meta">
      {{ with .Params.category }}
        <span class="article-category" itemprop="articleSection">{{ . }}</span>
      {{ end }}
      
      {{ with .Date }}
        <time datetime="{{ .Format `2006-01-02` }}" itemprop="datePublished">
          {{ .Format "January 2, 2006" }}
        </time>
      {{ end }}
    </div>
    
    <h1 class="article-title" itemprop="headline">{{ .Title }}</h1>
    
    {{ with .Description }}
      <p class="article-description" itemprop="description">{{ . }}</p>
    {{ end }}
    
    {{ with .Params.author }}
      <div class="article-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
        <span itemprop="name">{{ . }}</span>
      </div>
    {{ end }}
    
    {{ if .Params.toc }}
      <nav class="article-toc" aria-label="Article contents">
        {{ .TableOfContents }}
      </nav>
    {{ end }}
  </header>
  
  <div class="article-content" itemprop="articleBody">
    {{ .Content }}
  </div>
  
  <footer class="article-footer">
    {{ with .Params.tags }}
      <div class="tag-list">
        <span class="tag-list-label">Tags:</span>
        {{ range . }}
          <span class="tag" itemprop="keywords">{{ . }}</span>
        {{ end }}
      </div>
    {{ end }}
    
    {{ if .Params.lastmod }}
      <p class="article-modified">
        Last updated: 
        <time datetime="{{ .Lastmod.Format `2006-01-02` }}" itemprop="dateModified">
          {{ .Lastmod.Format "January 2, 2006" }}
        </time>
      </p>
    {{ end }}
  </footer>
</article>
{{ end }}
```

### 3. API Documentation Pattern (openapi/single.html)
```html
{{ define "content" }}
<article class="api-documentation" 
         data-component="api-docs"
         itemscope 
         itemtype="https://schema.org/APIReference">
  
  <header class="api-header">
    <h1 class="api-title" itemprop="name">{{ .Title }}</h1>
    
    {{ with .Params.api_version }}
      <span class="api-version" itemprop="version">Version {{ . }}</span>
    {{ end }}
    
    {{ with .Description }}
      <p class="api-description" itemprop="description">{{ . }}</p>
    {{ end }}
  </header>
  
  <nav class="api-navigation" aria-label="API sections">
    <h2>API Reference</h2>
    <ul class="api-nav-list">
      <li><a href="#overview">Overview</a></li>
      <li><a href="#authentication">Authentication</a></li>
      <li><a href="#endpoints">Endpoints</a></li>
      <li><a href="#schemas">Schemas</a></li>
    </ul>
  </nav>
  
  <div class="api-content">
    <section id="overview" class="api-section">
      <h2>Overview</h2>
      {{ .Content }}
    </section>
    
    <section id="endpoints" class="api-section">
      <h2>Endpoints</h2>
      {{ range .Params.endpoints }}
        <article class="api-endpoint" 
                 data-component="api-endpoint" 
                 data-method="{{ .method }}"
                 data-endpoint-id="{{ .operationId }}">
          
          <header class="endpoint-header">
            <span class="http-method http-method--{{ .method | lower }}">{{ .method }}</span>
            <code class="endpoint-path">{{ .path }}</code>
          </header>
          
          <div class="endpoint-content">
            <p class="endpoint-description">{{ .description }}</p>
            
            {{ if .parameters }}
              <section class="endpoint-parameters">
                <h4>Parameters</h4>
                <table class="parameter-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{ range .parameters }}
                      <tr class="parameter-row">
                        <td><code class="parameter-name">{{ .name }}</code></td>
                        <td><code class="parameter-type">{{ .type }}</code></td>
                        <td class="parameter-required">{{ if .required }}Yes{{ else }}No{{ end }}</td>
                        <td class="parameter-description">{{ .description }}</td>
                      </tr>
                    {{ end }}
                  </tbody>
                </table>
              </section>
            {{ end }}
            
            <section class="endpoint-examples">
              <h4>Examples</h4>
              <div class="code-examples" data-component="code-examples">
                <nav class="example-tabs" role="tablist">
                  <button role="tab" data-example="curl" aria-selected="true">curl</button>
                  <button role="tab" data-example="python">Python</button>
                  <button role="tab" data-example="javascript">JavaScript</button>
                </nav>
                
                <div class="example-content">
                  <div class="example-panel" data-example-panel="curl" role="tabpanel">
                    <pre><code class="language-bash">{{ .examples.curl }}</code></pre>
                  </div>
                  <div class="example-panel" data-example-panel="python" role="tabpanel" hidden>
                    <pre><code class="language-python">{{ .examples.python }}</code></pre>
                  </div>
                  <div class="example-panel" data-example-panel="javascript" role="tabpanel" hidden>
                    <pre><code class="language-javascript">{{ .examples.javascript }}</code></pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      {{ end }}
    </section>
  </div>
</article>
{{ end }}
```

### 4. Jupyter Notebook Pattern (notebook/single.html)
```html
{{ define "content" }}
<article class="jupyter-notebook" 
         data-component="notebook"
         itemscope 
         itemtype="https://schema.org/SoftwareApplication">
  
  <header class="notebook-header">
    <h1 class="notebook-title" itemprop="name">{{ .Title }}</h1>
    
    {{ with .Params.kernel }}
      <span class="notebook-kernel">Kernel: {{ . }}</span>
    {{ end }}
    
    <div class="notebook-actions">
      <button type="button" 
              class="notebook-action" 
              data-action="download"
              aria-label="Download notebook">
        Download .ipynb
      </button>
      
      <button type="button" 
              class="notebook-action" 
              data-action="launch"
              aria-label="Launch in Colab">
        Launch in Colab
      </button>
    </div>
  </header>
  
  <div class="notebook-content">
    {{ range .Params.cells }}
      <div class="notebook-cell notebook-cell--{{ .cell_type }}" 
           data-component="notebook-cell"
           data-cell-type="{{ .cell_type }}"
           data-cell-id="{{ .id }}">
        
        {{ if eq .cell_type "markdown" }}
          <div class="cell-content cell-content--markdown">
            {{ .source | markdownify }}
          </div>
        {{ else if eq .cell_type "code" }}
          <div class="cell-input">
            <pre><code class="language-python">{{ .source }}</code></pre>
          </div>
          
          {{ if .outputs }}
            <div class="cell-output">
              {{ range .outputs }}
                {{ if eq .output_type "stream" }}
                  <pre class="output-stream">{{ .text }}</pre>
                {{ else if eq .output_type "display_data" }}
                  <div class="output-display">
                    {{ if .data.image }}
                      <img src="data:image/png;base64,{{ .data.image }}" alt="Output visualization">
                    {{ else if .data.text }}
                      <pre>{{ .data.text }}</pre>
                    {{ end }}
                  </div>
                {{ end }}
              {{ end }}
            </div>
          {{ end }}
        {{ end }}
      </div>
    {{ end }}
  </div>
</article>
{{ end }}
```

### 5. Navigation Patterns

#### Primary Navigation (sidebar-left.html)
```html
<nav class="primary-navigation" 
     role="navigation" 
     aria-label="Primary navigation"
     data-component="primary-nav">
  
  <div class="nav-header">
    <h2 class="nav-title">Documentation</h2>
    
    <button type="button" 
            class="nav-toggle" 
            aria-expanded="false"
            aria-controls="nav-content"
            data-nav-toggle>
      <span class="sr-only">Toggle navigation</span>
    </button>
  </div>
  
  <div id="nav-content" class="nav-content">
    {{ $currentPage := . }}
    
    {{ range .Site.Sections }}
      <section class="nav-section">
        <h3 class="nav-section-title">
          <a href="{{ .RelPermalink }}" 
             class="nav-section-link{{ if eq $currentPage.Section .Section }} nav-section-link--current{{ end }}">
            {{ .Title }}
          </a>
        </h3>
        
        {{ if .Pages }}
          <ul class="nav-list">
            {{ range .Pages }}
              <li class="nav-item">
                <a href="{{ .RelPermalink }}" 
                   class="nav-link{{ if eq $currentPage.RelPermalink .RelPermalink }} nav-link--current{{ end }}"
                   {{ if eq $currentPage.RelPermalink .RelPermalink }}aria-current="page"{{ end }}>
                  {{ .Title }}
                </a>
              </li>
            {{ end }}
          </ul>
        {{ end }}
      </section>
    {{ end }}
  </div>
</nav>
```

## Component Data Patterns

### JavaScript Component Integration
```html
<!-- Clean data attributes for JS components -->
<div class="component-name" 
     data-component="component-name"
     data-component-config='{"option": "value"}'
     data-component-state="ready">
  
  <button type="button" 
          data-component-action="toggle"
          aria-expanded="false">
    Toggle
  </button>
  
  <div data-component-target="content" hidden>
    Content
  </div>
</div>
```

### Accessibility Standards
- Semantic HTML5 elements for structure
- ARIA labels and roles where needed
- Focus management for dynamic content
- Keyboard navigation support
- Screen reader announcements
- Color contrast compliance
- Reduced motion preferences

### Performance Optimizations
- Semantic markup reduces CSS specificity needs
- Clean class names for efficient selectors
- Structured data for SEO
- Progressive enhancement ready
- Mobile-first responsive structure

## Next Steps

1. Create these core patterns as Hugo partials
2. Build the baseof.html foundation first
3. Implement each content type systematically
4. Add comprehensive accessibility testing
5. Layer on the CSS framework after HTML is perfect
