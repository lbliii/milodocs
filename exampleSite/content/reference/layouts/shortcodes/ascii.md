---
title: ascii.html
description: learn how to use the asciidocs rendering shortcode
---

The `{{</*ascii*/>}}` shortcode renders AsciiDoc markup content inside of markdown files. 


## Before You Start 

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

## Source Code 

{{%include "layouts/shortcodes/ascii.html" "golang" %}}