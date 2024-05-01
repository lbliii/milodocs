---
title: Makefile
description: learn how to use the Makefile commands for this Hugo theme.
---

Makefiles are a great way to automate repetitive tasks. This theme comes with a Makefile that has a few commands to help you build documentation or reference assets for various scenarios. It is a great way to keep your project organized and to help you remember the commands you need to run to build your project --- especially if you begin to rely on scripts to generate parts of your documentation.

## How it Works

To execute a make command, you need to open a terminal and navigate to the root of your project. From there, you can run the following commands:

`make <command>`

## Use Cases

### Generate REST API Docs

If you are supporting a project that has a REST API documented using an **OpenAPI 3.0** specification, you can use the Makefile to generate documentation native to this theme. 

To generate the REST API documentation, you can run the following commands:

- `make api-gen <INPUT.YAML> <OUTPUT.JSON>`: This command generates the REST API documentation

This command runs your OpenAPI 3.0 specification through the `tools/spec-preprocessor.py` script to generate a JSON file that resolves all of the component references in your specification. This JSON file can then be referenced in a page to be rendered as a REST API documentation page.

```yaml
---
title: Example API (TESTING)
layout: api
reference: "<NAME_OF_FILE>" # /data
---
```


### Build Offline Docs

If you are supporting a project that customers may need to access offline in an air-gapped environment, you can build your documentation into a `file://` protocol-compatible format that is tarred and zipped for easy distribution. 

Your developer colleagues can utilize this make target by adding it into their build process to ensure that the documentation is delivered with the product.

To build the offline documentation, you can run the following commands:

- `make offline`: This command builds the offline documentation as a `.tar.gz` file
- `make offline-drafts`: This command builds the offline documentation with drafts as a `.tar.gz` file

## Source Code 

{{%include "makefile" "bash" %}}