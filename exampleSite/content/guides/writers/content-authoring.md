---
title: Content Authoring (Writers)
description: Basics for technical writers using this theme.
weight: 10
---

This guide is for writers producing docs content with this theme. You don't need to customize the theme—just use the patterns below.

## Create a page
Create a Markdown file under `content/`:

```markdown
---
title: Getting Started
description: Quick intro to the product
---

# Getting Started

Welcome to the docs...
```

- Use front matter `title` and `description`.
- If your content starts with `# Heading`, the theme hides the duplicate front-matter H1 automatically.

## Section landing pages
Place an `_index.md` file in a directory to create a landing page. Its children will appear on list pages.

## Tiles and child links
If a section has child pages, the landing page renders adaptive tiles automatically. Child pages can set:

```yaml
---
linkTitle: Quickstart
icon: rocket.svg  # from /static/icons/light/
---
```

## Common shortcodes
- Collapsible sections:

```markdown
{{</* collapse summary="Show details"  */>}}
Content inside the collapsible.
{{</* /collapse  */>}}
```

- Tabs:

```markdown
{{</* tab group="lang" label="Curl" active="true" */>}}
... curl example ...
{{</* /tab */>}}

{{</* tab group="lang" label="Python" */>}}
... python example ...
{{</* /tab */>}}
```

- Ascii / Asciinema: see `content/guides/shortcodes/` for examples.

## Images and assets
- Place images in `static/images/` and reference as `/images/your.png`.
- Use alt text and concise captions where helpful.

## Author tips
- Keep headings short; prefer sentence case.
- Use task-oriented titles (e.g., Install, Configure, Deploy).
- Break up long steps; use tabs for language/env variations.

## Links and metadata
- Add `tags:` to help with discovery.
- Avoid `noindex` on important pages; the theme handles robots meta for drafts/hidden/expired pages. 