# Navigation Module System

This directory contains the modularized navigation components for the NVIDIA Hugo theme. The navigation system has been broken down into logical, reusable modules for better maintainability and organization.

## Structure

```
navigation/
├── index.css                 # Main import file for all navigation modules
├── base.css                  # Container queries, shared foundations, and base nav styling
├── chat-toc-toggle.css       # Interactive toggle between chat and table of contents
├── sidebar.css               # Main navigation sidebar with responsive behavior
├── topbar.css                # Horizontal navigation bar with CSS Grid layout
├── toc.css                   # Table of Contents navigation (inline and sidebar)
├── dropdown.css              # Dropdown menus for navigation links
└── README.md                 # This documentation file
```

## Module Descriptions

### `base.css`
- Container query definitions for responsive behavior
- Shared navigation link styling and animations
- Base nested content styling using the animation system
- Expand toggle button styling
- Focus states and accessibility features

### `chat-toc-toggle.css`
- Interactive toggle component for switching between chat and TOC views
- Hover states, active states, and focus accessibility
- Ripple effects and smooth transitions
- Initialization handling

### `sidebar.css`
- Main navigation sidebar container styling
- Responsive behavior (desktop sticky, mobile overlay)
- LinkTree component styling
- Sidebar item hierarchy (levels 1-4 and default)
- Mobile header and close button styling
- Dark mode background overrides

### `topbar.css`
- Horizontal navigation bar using CSS Grid layout
- Responsive grid areas: logo, navigation, search, controls
- Mobile-first responsive behavior
- Logo, navigation links, search, and controls styling

### `toc.css`
- Table of Contents styling for both inline and sidebar variants
- TOC link styling with hover states and active indicators
- Heading level variations (h1, h2, h3)
- Smooth scrolling progress indicator
- Enhanced animations and responsive adjustments
- Dark mode background overrides

### `dropdown.css`
- Dropdown menu styling for navigation links
- Backdrop filter and shadow effects
- Hover and focus states
- Smooth show/hide animations
- Positioning and arrow indicators

## Usage

### Importing the Complete System
```css
@import 'navigation/index.css';
```

### Importing Individual Modules
```css
@import 'navigation/base.css';
@import 'navigation/topbar.css';
@import 'navigation/sidebar.css';
/* etc. */
```

## Key Features

- **Modular Architecture**: Each component is self-contained and can be imported individually
- **Responsive Design**: Uses container queries for advanced responsive behavior
- **Animation System Integration**: Leverages the theme's animation tokens for consistency
- **Accessibility**: Enhanced focus states and ARIA-compliant interactions
- **Dark Mode Support**: Proper theme integration with dark mode overrides
- **Performance Optimized**: Specific transition properties to avoid layout thrashing

## Dependencies

- CSS Custom Properties (CSS Variables) for theming
- Animation system tokens (`--timing-*`, `--easing-*`, `--collapse-*`)
- Tailwind CSS utilities (via `@apply` directives)
- Container query support

## Maintenance Notes

- When adding new navigation components, create a new module file and add it to `index.css`
- Follow the existing naming conventions: `.component-name__element--modifier`
- Use the shared animation tokens from the animation system
- Ensure responsive behavior uses container queries where appropriate
- Test accessibility features (focus states, keyboard navigation) when making changes

## Migration from Monolithic File

The original `navigation.css` file has been refactored into this modular system. The main file now simply imports `navigation/index.css`, ensuring backward compatibility while providing the benefits of modular architecture.