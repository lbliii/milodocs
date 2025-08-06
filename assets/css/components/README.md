# CSS Components

This directory contains modular CSS components for the Hugo theme. Each component should be a self-contained CSS file that can be easily maintained and reused.

## Current Components

- `debug.css` - Debug tray styling for development mode

## Component Guidelines

### Naming Convention
- Use kebab-case for file names
- Be descriptive and specific
- Group related components with prefixes if needed

### Structure
```css
/* Component Name */

/* Base component class */
.component-name {
  /* Base styles */
}

/* Modifiers */
.component-name.modifier {
  /* Modified styles */
}

/* Sub-components */
.component-name-element {
  /* Element styles */
}

/* States */
.component-name.active,
.component-name:hover {
  /* State styles */
}

/* Responsive */
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Integration
Components are automatically included in the CSS build process via `layouts/partials/head/css.html`:

```html
{{/* Add component styles */}}
{{- $componentCSS := resources.Get "css/components/your-component.css" -}}
{{- if $componentCSS -}}
  {{- $cssResources = $cssResources | append $componentCSS -}}
{{- end -}}
```

## Future Components

Consider creating components for:
- Navigation elements
- Form components  
- Card layouts
- Modal dialogs
- Loading states
- Error states

## Benefits

- **Maintainable**: Each component is isolated
- **Reusable**: Components can be used across templates
- **Scalable**: Easy to add new components
- **Performant**: All components bundle into a single CSS file
- **Consistent**: Shared design patterns and utilities