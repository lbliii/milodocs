---
title: "env.sh"
description: Learn about how the env.sh works for this theme. 
hidden: true
---

The `env.sh` script simplifies the process of building your site based on a specific environment (`--environment`) passed with the `hugo` build command as an argument. This script also includes some guardrails to ensure the correct configuration file for that environment.

{{<notice tip "Hugo environments">}}
You can use the `hugo.Environment` variable to access the current environment in your templates. This is useful for conditionally loading assets or content based on the environment. See the [Hugo documentation](https://gohugo.io/functions/hugo/environment/) for more information.
{{</notice>}}

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

{{%include "tools/env.sh" "sh" %}}