---
title: csv.html
description: learn how to use the csv shortcode
---

The `{{</*csv*/>}}` shortcode is a simple way to embed CSV files in your documentation from a global `static/csv` directory. This is great for large and/or complex tables that you want to keep separate from your markdown files.

Using this shortcode also enables you to more easily update your CSV files programmatically, without having to update the markdown files that reference them.

## How it Works

The `{{</*csv*/>}}` shortcode accepts 3 **positional** args: `filename`, `delimiter`, and `excludedColumns`.

- `filename` is the name of the CSV file you want to embed. This file should be located in the `static/csv` directory. It does not need to include the `.csv` extension.
- `delimiter` is the character that separates the columns in the CSV file. The default is `,`.
- `excludedColumns` is a comma-separated list of column numbers that you want to exclude from the table. The default is an empty string. This field is case-sensitive.


### Examples 

The table in the following examples is pulled from `/static/csv/food.csv`.

#### Full Table with Default Delimiter

`{{</*csv food*/>}}`

{{<csv food >}}

#### Full Table with Excluded Column

`{{</*csv food "," "Origin"*/>}}`

{{<csv food "," "Origin" >}}

## Source Code 

{{%include "layouts/shortcodes/csv.html" "go" %}}