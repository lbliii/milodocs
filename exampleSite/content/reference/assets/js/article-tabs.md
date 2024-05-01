---
title: article-tabs.js
description: Learn about how the tabs.js file works for this theme. 
---

The `tabs.js` file is used to manage the [tabbed experience](/reference/layouts/shortcodes/tabs) created by a combination of shortcodes found in `/layouts/shortcodes/tabs`.

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
{{%include "layouts/shortcodes/article-tabs/container.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabbuttons">}}
{{%include "layouts/shortcodes/article-tabs/tabButtons.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tab">}}
{{%include "layouts/shortcodes/article-tabs/tab.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabcontentscontainer">}}
{{%include "layouts/shortcodes/article-tabs/tabContentsContainer.html" "golang" %}}
{{</tabs/tabContent>}}
{{<tabs/tabContent val1="shortcode/tabcontent">}}
{{%include "layouts/shortcodes/article-tabs/tabContent.html" "golang" %}}
{{</tabs/tabContent>}}   
{{</tabs/tabContentsContainer>}}
{{</tabs/container>}}


## How it Works 

1. If a page has elements with `[data-component="tabs"]`, the script collects them all into an array.
2. For each collection of tabs, it then collects the button options (`[data-tab-id]`)and corresponding tabbed markdown content (`[data-tabcontent]`).
3. Event listeners are setup for each button; when selected, the corresponding content is revealed and the button highlighted; other options are hidden/muted. 

## Source Code 

{{%include "assets/js/article-tabs.js" "js" %}}