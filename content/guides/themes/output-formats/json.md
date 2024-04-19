---
title: JSON Objects
description: Learn how to convert your articles into JSON objects.
---

You can convert your articles into JSON objects by creating a series of templates in your theme. These templates can adhere to any JSON schema you choose.

The JSON output format is advantageous for documentation sites because it can be used to build search indexes, chatbots, dashboards, and other applications that require structured data.

## Before You Start

- Review the [Page Kinds Hugo Documentation](https://gohugo.io/templates/section-templates/#page-kinds)
- Review the [Front Matter Hugo Documentation](https://gohugo.io/content-management/front-matter/)
- Review the [Page Methods Hugo Documentation](https://gohugo.io/quick-reference/methods/#page)
---

## How to Create JSON Output

### Create json.json Partial 

This template acts as the core of your JSON Schema definition. It will be used across all of the other page kind layouts we'll build (`single.json`, `section.json`, `list.json`, `home.json`).

1. Navigate to your theme's `layouts/partials` directory.
2. Create a new file called `json.json`.
3. Define the schema you want. Here is an example:
   ```json
   {
     "id": "",
     "version": "",
     "title": "",
     "description": "",
     "date": "",
     "draft": "",
     "hidden": "",
     "lastCommit": "",
     "section": "",
     "parent": "",
     "pageKind": "",
     "content": "",
     "permalink": "",
     "relPermalink": ""
   }
   ```
4. Add golang template logic to each attribute. This requires you to use a series of page methods for pulling in data. If you'd like to use a custom front matter attribute, such as a [cascaded](https://gohugo.io/content-management/front-matter/#cascade) `version` number from a parent directory's `_index.md`, remember to use the `.Params` method to access it.
   ```go
   {
     "id": "{{ .File.UniqueID }}",
     "version": "{{.Params.version}}",
     "title": "{{ .Title }}",
     "description": "{{ .Description }}",
     "date": "{{ .Date }}",
     "draft": {{ .Draft }}, 
     "hidden": {{ .Hidden }},
     "lastCommit": "{{ .GitInfo.AuthorDate }}",
     "section": "{{ .Section }}",
     "parent": "{{ .Parent }}",
     "pageKind": "{{ .Type }}",
     "bundleType": "{{ .BundleType }}",
     "content": "{{ .Content }}",
     "permalink": "{{ .Permalink }}",
     "relPermalink": "{{ .RelPermalink }}",
   }
   ```
   {{<notice tip >}}
   You can conditionally include or exclude certain attributes. For example, you can exclude the `hidden` attribute if it is not set in the front matter.

   ```go
   {{- with .Page.Params.hidden -}}"hidden": {{- . -}},{{- end -}}
   ```
   {{</notice>}}

5. Save the file.

### Create Default Layouts

#### single.json

This template will be used to render the JSON object for the `page` page kind.

1. Navigate to your theme's `layouts/_default` directory.
2. Create a new file called `single.json`.
3. Add the following code:
   ```go
   {{- partial "json.json" . -}}
   ```
4. Save the file.

#### section.json 

This template will be used to render the JSON object for the `section` page kind. A section is a page that contains an array of page kinds (that can also include other sections!). Knowing this, we need to create a recursive template that will render the JSON object for the section and all of its descendants.

1. Navigate to your theme's `layouts/_default` directory.
2. Create a new file called `section.json`.
3. Add the following code:
   ```go 
   [
       {{- range $index, $page := .Pages }}
       {{- if ne $page.Type "json" }}
       {{- if and $index (gt $index 0) }},{{ end }}
       {{- partial "json.json" . }}
       {{- end }}
       {{- if eq .Kind "section"}}
           {{- template "section" . }}
       {{- end }}
       {{- end }}
   ]

   {{- define "section" }}
   {{- range .Pages }}
       {{- if ne .Type "json" }}
       ,{{- partial "json.json" . }}
       {{- end }}
       {{- if eq .Kind "section"}}
           {{- template "section" . }}
       {{- end }}
   {{- end }}
   {{- end }}
   ```
   {{<notice note>}}
   There may be a more elegant way to define this template, but this one does work. If you come up with a better one please share!
   {{</notice>}}
4. Save the file.


#### list.json

This template will be used to render the JSON object for the `list` page kind.

1. Navigate to your theme's `layouts/_default` directory.
2. Create a new file called `list.json`.
3. Add the following code:
   ```go
   {{- partial "json.json" . -}}
   ```
4. Save the file.

#### home.json

This template will be used to render the JSON object for the `home` page kind.

1. Navigate to your theme's `layouts/_default` directory.
2. Create a new file called `home.json`.
3. Add the following code:
   ```go
   [
       {{- range $index, $page := .Pages }}
       {{- if ne $page.Type "json" }}
       {{- if and $index (gt $index 0) }},{{- end }}
       {{- partial "json.json" . }}
       {{- end }}
       {{- if eq .Kind "section" }}
           {{- template "section" . }}
       {{- end }}
       {{-  end }}
   ]
   {{- define "section" }}
   {{- range .Pages }}
       {{- if ne .Type "json" }}
       ,{{- partial "json.json" . }}
       {{- end }}
       {{- if eq .Kind "section"}}
           {{- template "section" . }}
       {{- end }}
   {{- end }}
   {{- end }}
   ```
5. Save the file.

### Update Hugo Configuration

1. Open your Hugo `outputs` configuration (e.g., `config/_default/outputs.yaml`).
2. Update each page kind to include JSON in the supported array.
   ```yaml
   home: [ "HTML", "JSON"]
   page: [ "HTML", "JSON"]
   section: [ "HTML", "JSON"]
   list: [ "HTML", "JSON"]
   ```
3. Save the file.

### Test

1. Run `hugo server` in your project directory.
2. Navigate to your site's homepage and append `/index.json` to the URL. You should see a JSON index of all of your site's pages. You can append `/index.json` to any url whose page is built using these supported page kind layouts.

Now you can use the JSON output to build search indexes, chatbots, dashboards, and other applications that require structured data.