---
title: tabs.html
description: learn how to use the tabs shortcode
---

Tabs provide an effective way to organize content that varies in format or procedure, eliminating the need for separate pages. This combination of shortcodes enables you to create a tabbed interface. I first discovered this implementation strategy while reviewing the [MiniKube documentation](https://minikube.sigs.k8s.io/docs/start/).

## How it works

5 shortcodes make up the tabs UX.

| Shortcode | Description | Input |
|---|---|---|
| `{{</*tabs/container*/>}}` | Container for the entire tabs UX. | n/a |
| `{{</*tabs/tabButtons*/>}}` | Container for the tab buttons. | `id` **string** |
| `{{</*tabs/tab*/>}}` | Button to display the tab content. | `option` **string**; `state` **string** |
| `{{</*tabs/tabContentsContainer*/>}}` | Container for the tab content. | n/a |
| `{{</*tabs/tabContent*/>}}` | The content displayed on an active tab. | markdown |

{{<notice info "Set tab as default">}}
When an option has the default state of `active`, it will be the first tab shown.
{{</notice>}}

### Example 

{{<tabs/container>}}
{{<tabs/tabButtons id="launch-method">}}
{{<tabs/tab option="Console" state="active">}}
{{<tabs/tab option="CLI">}}
{{</tabs/tabButtons>}}
{{<tabs/tabContentsContainer>}}
{{<tabs/tabContent val1="launch-method/console">}}
1. Ensure your DemoTool server is running and connected.
2. Navigate to Console.
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="launch-method/cli">}}
1. Run `demoCLI connect`.
{{</tabs/tabContent>}}
{{</tabs/tabContentsContainer>}}
{{</tabs/container>}}

```html
{{</*tabs/container*/>}}
{{</*tabs/tabButtons id="launch-method"*/>}}
{{</*tabs/tab option="Console" state="active"*/>}}
{{</*tabs/tab option="CLI"*/>}}
{{</*/tabs/tabButtons*/>}}
{{</*tabs/tabContentsContainer*/>}}
{{</*tabs/tabContent val1="launch-method/console"*/>}}

1. Ensure your DemoTool server is running and connected.
2. Navigate to Console.

{{</* /tabs/tabContent */>}}
{{</* tabs/tabContent val1="launch-method/cli" */>}}

1. Run `demoCLI connect`.

{{</*/tabs/tabContent*/>}}
{{</*/tabs/tabContentsContainer*/>}}
{{</*/tabs/container*/>}}
```

## Source code 

{{<tabs/container>}}
{{<tabs/tabButtons id="shortcode">}}
{{<tabs/tab option="container" state="active">}}
{{<tabs/tab option="tabButtons">}}
{{<tabs/tab option="tab">}}
{{<tabs/tab option="tabContentsContainer">}}
{{<tabs/tab option="tabContent">}}
{{</tabs/tabButtons>}}

{{<tabs/tabContentsContainer>}}
{{<tabs/tabContent val1="shortcode/container">}}
{{%include "layouts/shortcodes/tabs/container.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabbuttons">}}
{{%include "layouts/shortcodes/tabs/tabButtons.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tab">}}
{{%include "layouts/shortcodes/tabs/tab.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabcontentscontainer">}}
{{%include "layouts/shortcodes/tabs/tabContentsContainer.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabcontent">}}
{{%include "layouts/shortcodes/tabs/tabContent.html" "golang" %}}
{{</tabs/tabContent>}}   
{{</tabs/tabContentsContainer>}}
{{</tabs/container>}}