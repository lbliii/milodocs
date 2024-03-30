---
title: "env.sh"
description: Learn about how the env.sh works for this theme. 
---

The `env.sh` script makes it easy to build your site based on a specific environment passed as an argument. This script also adds some guardrails to ensure you're using the correct configuration file for that environment.

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
- For all other environments, the script will use the `config` directory to find the appropriate configuration file.

{{<notice info >}}
You will need to fill out the `config` directory with the appropriate configuration files for each environment if you want to use this script.
{{</notice>}}

### Default Environments

You can set the environments by updating the the `ENVIRONMENTS` array in the script. 

- `development`
- `production`
- `offline`
- `enterprise`
- `opensource`


## Source Code 

{{%include "tools/env.sh" "sh" %}}