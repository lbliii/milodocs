---
title: csv.html
description: learn how to use the CSV shortcode
---

The `{{</*csv*/>}}` shortcode provides a simple way to embed CSV files in your documentation from a global `static/csv` directory. This approach works well for large and/or complex tables that you want to keep separate from your markdown files.

Using this shortcode also enables you to update your CSV files programmatically without needing to update the markdown files that reference them.

## How it works

The `{{</*csv*/>}}` shortcode accepts 3 **positional** arguments: `filename`, `delimiter`, and `excludedColumns`.

- `filename` specifies the CSV file to embed. The file resides in the `static/csv` directory. You don't need to include the `.csv` extension.
- `delimiter` defines the character that separates columns in the CSV file. Default: `,`.
- `excludedColumns` accepts a comma-separated list of column numbers to exclude from the table. This parameter has case-sensitivity and defaults to an empty string.

### Examples 

The table in the following examples comes from `/static/csv/food.csv`.

#### Full table with default delimiter

`{{</*csv food*/>}}`

{{<csv food >}}

#### Full table with excluded column

`{{</*csv food "," "Origin"*/>}}`

{{<csv food "," "Origin" >}}

## Source code 

{{%include "layouts/shortcodes/csv.html" "go" %}}