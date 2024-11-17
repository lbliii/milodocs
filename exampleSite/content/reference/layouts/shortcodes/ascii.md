---
title: ascii.html
description: learn how to use the asciidocs rendering shortcode
---

The `{{</*ascii*/>}}` shortcode renders AsciiDoc markup content inside of markdown files. 


## Before you start 

- Complete the steps to [Enable AsciiDoc Markup Support](/guides/markups/ascii)
---

## Examples

### Table


{{<ascii>}}
|===
| Name    | Age | City      

| John    | 25  | New York  
| Lisa    | 28  | Los Angeles
| Michael | 31  | Chicago   
|===
{{</ascii>}}

```s
|===
| Name    | Age | City      

| John    | 25  | New York  
| Lisa    | 28  | Los Angeles
| Michael | 31  | Chicago   
|===
```

## Source code 

{{%include "layouts/shortcodes/ascii.html" "golang" %}}