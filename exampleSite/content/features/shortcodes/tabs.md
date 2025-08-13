---
title: tabs.html
description: learn how to use the tabs shortcode
---

Tabs provide an effective way to organize content that varies in format or procedure, eliminating the need for separate pages. This combination of shortcodes enables you to create a tabbed interface. I first discovered this implementation strategy while reviewing the [MiniKube documentation](https://minikube.sigs.k8s.io/docs/start/).

## How it works (simplified)

Use the single `tab` shortcode; the theme aggregates tabs by group and renders the UI.

| Shortcode | Description | Input |
|---|---|---|
| `{{</* tab */>}}` | Defines one tab. Repeat for each tab in a group. | `group` (string), `label` (string), `active` (bool, optional) |

{{<notice info "Set tab as default">}}
When an option has the default state of `active`, it will be the first tab shown.
{{</notice>}}

### Example 

{{< tab group="launch-method" label="Console" active="true" >}}
1. Ensure your DemoTool server is running and connected.
2. Navigate to Console.
{{< /tab >}}

{{< tab group="launch-method" label="CLI" >}}
1. Run `demoCLI connect`.
{{< /tab >}}

## Source code

```markdown
{{</* tab group="launch-method" label="Console" active="true" */>}}
1. Ensure your DemoTool server is running and connected.
2. Navigate to Console.
{{</* /tab */>}}

{{</* tab group="launch-method" label="CLI" */>}}
1. Run `demoCLI connect`.
{{</* /tab */>}}
```
