---
title: "build-offline-site.sh"
description: Learn about how the build-offline-site.sh script works for this theme. 
hidden: true
---

The `build-offline-site.sh` script creates a compressed `.tar.gz` file of the site that can be used for offline viewing. This output is `file://` protocol compatible and can be shared with others for offline viewing.

## Before You Start 

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

## How it Works

- For `production` and `development` environments, the script will use the default top-level `hugo.yaml` configuration file.
- For all other environments, the script will use the `config/` directory to find the appropriate configuration file.

### Default Environments

You can set the environments by updating the the `ENVIRONMENTS` array in the script. 

- `development`
- `production`
- `offline`
- `enterprise`
- `opensource`


## Source Code 

{{%include "tools/build-offline-site.sh" "sh" %}}