---
title: Enable AsciiDoc
description: learn how to enable AsciiDoc Markup in your Hugo docs site.
---

To utilize AsciiDoc markup in a Hugo site, some extra configuration is required --- both on your **local machine** and in your **deployment solution** (Netlify, AWS Amplify, a container image). 

Once set up, you will be able to use the [ascii shortcode](/reference/layouts/shortcodes/ascii) and/or create your own.

## Before you start 

- Read about Hugo's [security model](https://gohugo.io/about/security/)
- Read about Hugo's [AsciiDoc configuration options](https://gohugo.io/getting-started/configuration-markup/#asciidoc)

---

## How to enable AsciiDoc markup

{{<notice info >}}
The following steps have been tested with **Netlify**. By providing a Gemfile at the root level, Netlify knows to automatically install both Ruby and the required gems listed in the Gemfile. This may not be the case in your deployment solution.
{{</notice>}}

### Install

1. Install [Ruby](https://www.ruby-lang.org/en/downloads/).
   ```s
   brew install rbenv ruby-build
   ```
2. Install `asciidoctor`.
   ```s
   brew install asciidoctor
   ```
3. Create a Gemfile at the root of your Hugo project and add the following:
   ```s
   source 'https://rubygems.org'
   gem 'asciidoctor'
   ```
4. Open your Hugo `security` configuration (e.g. `config/_default/security.yaml`).
5. Update `security.exec`:
   - We need to whitelist the ascii processor tool, `asciidoctor`.
   - We need to whitelist the `GEM_PATH`.
   ```yaml
   exec:
     allow:
       - '^dart-sass-embedded$'
       - '^go$'
       - '^npx$'
       - '^postcss$'
       - '^rst2html.py$'
       - '^rst2html$'
       - '^asciidoctor$'
     osEnv: 
       - (?i)^(PATH|PATHEXT|APPDATA|TMP|TEMP|TERM|HOME|GEM_PATH)$
   ```

### Configure

You can use basic AsciiDoc markup without any additional configuration. However, you can customize and extend the support by adding extensions and updating the optional attributes.

1. Open your Hugo `markup` configuration (e.g. `config/_default/markup.yaml`).
2. Add the following [attributes](https://gohugo.io/getting-started/configuration-markup/#asciidoc-settings-explained):
   ```yaml
     asciidocExt:
       attributes: {}
       backend: html5
       extensions: []
       failureLevel: fatal
       noHeaderOrFooter: true
       preserveTOC: false
       safeMode: unsafe
       sectionNumbers: false
       trace: false
       verbose: false
       workingFolderCurrent: true
   ```
3. Update the list of [extensions](https://gohugo.io/getting-started/configuration-markup/#extensions) you'd like to support.


## Deployment Configuration

### Netlify

Netlify automatically detects the Gemfile and installs Ruby dependencies. No additional configuration is required if you follow the basic setup above.

### Vercel

Vercel requires additional configuration to properly handle Ruby gems and Python dependencies. Create a `vercel.json` file in your project root:

```json
{
  "build": {
    "env": {
      "HUGO_VERSION": "0.148.0",
      "BUNDLE_PATH": "./vendor/bundle",
      "BUNDLE_BIN": "./vendor/bundle/bin",
      "GEM_PATH": "./vendor/bundle:$GEM_PATH",
      "PATH": "./vendor/bundle/bin:/usr/local/bin:/opt/python/3.9.16/bin:$PATH"
    }
  },
  "installCommand": "cd exampleSite && bundle install --path vendor/bundle --deployment && pip3 install -r requirements.txt --user && npm install",
  "buildCommand": "cd exampleSite && bundle exec hugo --environment production --minify"
}
```

Also create a `.bundle/config` file in your Hugo site directory:

```yaml
---
BUNDLE_PATH: "vendor/bundle"
BUNDLE_DEPLOYMENT: "true"
BUNDLE_WITHOUT: "development:test"
```

### Docker/Container Deployments

For container-based deployments, ensure your Dockerfile includes:

```dockerfile
# Install Ruby and Bundler
RUN apt-get update && apt-get install -y ruby-full build-essential
RUN gem install bundler

# Install Python and pip
RUN apt-get install -y python3 python3-pip

# Copy and install dependencies
COPY Gemfile* ./
RUN bundle install --path vendor/bundle

COPY requirements.txt ./
RUN pip3 install -r requirements.txt --user

# Add paths to environment
ENV PATH="/root/.local/bin:./vendor/bundle/bin:${PATH}"
ENV GEM_PATH="./vendor/bundle:${GEM_PATH}"
```

## Troubleshooting

### Common Issues

- **"Could not find asciidoctor in locally installed gems"**: This usually indicates a gem path issue. Ensure you're using `bundle exec` before Hugo commands and that `GEM_PATH` is properly configured.

- **"rst2html not found in $PATH"**: The Python package was installed but isn't in the system PATH. Add the Python user bin directory to your PATH environment variable.

- **Bundler deployment errors**: Make sure you have a `.bundle/config` file with the correct path configuration.

It's possible that whitelisting `GEM_PATH` does not work for you. In that case, try to whitelist `GEM_HOME` or `RVM_*`. See this [related Github issue](https://github.com/gohugoio/hugo/issues/9741) for historical context.

