---
title: "build-offline-site.sh"
description: Learn about how the build-offline-site.sh script works for this theme. 
hidden: true
---

The `build-offline-site.sh` script creates a compressed `.tar.gz` file of the site used for offline viewing. This output uses the `file://` protocol, meaning that it works directly in a browser without any setup.

## Before you start 

- You should fill out the `config/` directory with the appropriate configuration files for each environment if you want to use this script.

---

## Usage

```bash
sh tools/env.sh offline
```
```s
# Runs the following:
hugo server --config config/offline.yaml --environment offline
```

## How it works

- For `production` and `development` environments, the script will use the default top-level `hugo.yaml` configuration file.
- For all other environments, the script will use the `config/` directory to find the appropriate configuration file.

### Default environments

You can set the environments by updating the `ENVIRONMENTS` array in the script. 

- `development`
- `production`
- `offline`
- `enterprise`
- `opensource`


## Source code 

{{%include "tools/build-offline-site.sh" "sh" %}}