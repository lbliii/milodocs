---
title: pdoc.html
description: learn how to use the pdoc shortcode
---

It's common for developers to build packages in Python that need auto-generated code documentation based off of Python strings.

To better support integrating that collection to your larger docs site, I've built out a `{{</*pdoc*/>}}` shortcode that enables you to automatically target links for:

- **Supermodules** 
- **Submodules**
- **Functions**
- **Classes** 
- **Methods**  

{{<notice tip "How complex is the package?">}}
If you are integrating pdoc documentation for a package that has submodules, use the default `pdoc` shortcode. For simple packages without submodules, use `pdoc-2`.
{{</notice>}}

## How it Works 

The `{{</*pdoc*/>}}` shortcode accepts 3 **positional** args: `type`, `target`, and `linktitle` (optional). If `linktitle` is not set, it automatically configures the link text as show in the following sections.

### pdoc 

|Type (arg0)|Target (arg1)|Result|
|-|-|-|
|supermodule|`~pkg.super`| `/references/pkg/super`|
|submodule|`~pkg.super.sub`| `/references/pkg/super` |
|function|`~pkg.super.func`| `/references/pkg/super/sub#package.super.sub.func` |
|class|`~pkg.super.sub.class`| `/references/pkg/super/sub#package.super.sub.class`|
|method|`~pkg.super.sub.class.meth`| `/references/pkg/super/sub#pkg.super.sub.class.meth`|


### pdoc-2 

|Type (arg0)|Target (arg1)|Result|
|-|-|-|
|function|`~pkg.super.func_name`| `/references/pkg.html#pkg.func` |
|class|`~pkg.super.sub.class`| `/references/pkg.html#pkg.class`|
|method|`~pkg.super.sub.class.method`| `/references/pkg.html#pkg.class.meth`|

####  Examples

- {{<pdoc-2 "function" "~demo-package.demo_function">}}
- {{<pdoc-2 "class" "~demo-package.DemoClass">}}
- {{<pdoc-2 "method" "~demo-package.DemoClass.demo_method">}}
  
```html
- {{</* pdoc-2 "function" "~demo-package.demo_function" */>}}
- {{</* pdoc-2 "class" "~demo-package.DemoClass" */>}}
- {{</* pdoc-2 "method" "~demo-package.DemoClass.demo_method" */>}}
```

## Source Code 

{{<notice tip "Want to change the main directory?">}}
You can change the default directory where this shortcode looks for  pdoc collections by updating the value of `$baseurl`. Alternatively, you could make this shortcode more advanced and remove that static baseurl piece altogether. 
{{</notice>}}

{{%include "layouts/shortcodes/pdoc.html" "go" %}}
