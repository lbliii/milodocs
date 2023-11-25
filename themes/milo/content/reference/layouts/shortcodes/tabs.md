---
title: tabs.html
description: learn how to use the tabs shortcode
---

Tabs are a great way to organize content that is contextually relevant but divergent in format or procedure (without necessarily needing its own page). This combination of shortcodes allows you to create a tabbed interface. I first encountered this implementation strategy while reading the [MiniKube docs](https://minikube.sigs.k8s.io/docs/start/).

## How it Works

There are 5 shortcodes that make up the tabs UX.

|shortcode|description|input|
|---|---|--|
|`{{</*tabs/container*/>}}`|This is the container for the entire tabs UX.|n/a|
|`{{</*tabs/tabButtons*/>}}`|This is the container for the tab buttons.| `id` **string**|
|`{{</*tabs/tab*/>}}`|This is the button that will be clicked to show the tab content.|`option` **string**; `state` **string**|
|`{{</*tabs/tabContentsContainer*/>}}`|This is the container for the tab content.|n/a|
|`{{</*tabs/tabContent*/>}}`|This is the content that will be shown when the tab button is clicked.|markdown|

{{<notice info "Set Tab as Default">}}
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




## Source Code 

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