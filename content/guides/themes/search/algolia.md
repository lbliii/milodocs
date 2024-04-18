---
title: Enable Algolia Search
description: learn how to add Algolia search to your Hugo site.
---

This guide will show you a quick way to add Algolia search to your Hugo site. It uses the `algoliasearch-lite` script needed to perform search-only operations used to populate your search UI. We'll then rely on a cron task to index your site's content and push it to Algolia.

{{<notice snack>}}
Algolia is a hosted search engine capable of delivering real-time results from the first keystroke. 
Algolia provides a [free tier](https://www.algolia.com/pricing) that includes 10,000 records and 50,000 operations per month. For most projects, startups, and small businesses, this should be more than enough to get started.
{{</notice>}}

## Before You Start 

- Set up [JSON output format templates](/guides/themes/output-formats/json).
- Review the [Algolia API reference](https://www.algolia.com/doc/api-reference/widgets/js/) needed for building your search layout.

--- 

## How to Create an Algolia Index

This section assumes that you have set up your Hugo site to output JSON files for your content. If you haven't done this yet, refer to the [JSON output format templates guide](/guides/themes/output-formats/json).

{{<notice tip>}}
You can perform a quick test by going to `localhost:1313/index.json`; it should look like [this](https://milodocs-theme.netlify.app/index.json).
{{</notice>}}

1. Create a new Algolia account or log in to your existing account.
2. Create a new index in your Algolia dashboard.


## How to Enable Algolia Search

### Add Algolia Search Lite Script

Let's add the Algolia Search Lite script to your Hugo project. This script is needed to perform search-only operations and populate your search UI.

1. Navigate to `layouts/partials/footer.html` in your Hugo project.
2. Add the following Algolia Search Lite script to the file:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/algoliasearch@latest/dist/algoliasearch-lite.umd.js" defer></script>
   ```
   {{<notice tip>}}
   You can also install Algolia InstantSearch.js in your project to add more advanced features, but it's not required for basic search functionality.  
   ```js
   pnpm install algoliasearch instantsearch.js
   ```
   {{</notice>}}

### Define a Results Container

Let's create our search results container element. This element will be hidden by default and will be populated with search results when the user types in the search input.

1. Create a new file named `searchResultsContainer.html` in your theme's `layouts/partials` directory.
2. Input the following code:
   ```html
   <div id="searchResultsContainer" class="hidden w-full lg:w-3/5 p-4">
   <!-- populated by JS -->
   </div>
   ```
3. Add the partial to your theme's `layouts/_default/baseof.html` layout file. Here's where I've put mine:
   ```html
     <main class="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto flex">
       {{partial "navigation/sidebar-left.html" . }}
       <div id="pageContainer" class="w-full lg:w-3/5"> <!-- Make sure your page container has an id for targeting -->
         {{- if .IsHome}}{{ block "home" . }}{{ end }}{{else}}{{ block "main" . }}{{ end }}{{- end}}
       </div>
       {{partial "searchResultsContainer.html" . }} <!-- Add this line -->
       {{partial "navigation/sidebar-right.html" . }}
     </main>
   ```
4. Make sure your page container element has an `id` attribute so that it can be targeted by the JavaScript for toggling visibility.

### Define a SearchBox Input

Let's create a search input element that will be used to trigger the search functionality. Typically this is placed in the layout that defines your top navigation bar.

```html
<!-- Searchbar -->
<div id="topNavSearch" class="flex items-center space-x-4 text-xs">
    <input type="search" id="searchInput" class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand md:w-96 bg-zinc-100 text-black" placeholder="Search..." aria-label="Search" />
</div>
```

### Create a search.js File 

Now that we have our search results container and search input elements set up, let's create a JavaScript file that will handle the search functionality.

1. Create a new file named `search.js` in your theme's `assets/js` directory.
2. Input the following code:
   {{<collapse title="search.js">}}
   ```js
   document.addEventListener("DOMContentLoaded", function () {
     const searchInput = document.getElementById("searchInput");
     const pageContainer = document.getElementById("pageContainer");
     const searchResultsContainer = document.getElementById("searchResultsContainer");

     // Algolia configuration
     const searchClient = algoliasearch(
       "4TYL7GJO66", // APP ID 
       "4b6a7e6e3a2cf663b3e4f8a372e8453a" // Search Only API Key
     );
     const searchIndex = searchClient.initIndex("default"); // Replace 'default' with your Algolia index name

     // Function to group search results by parent
     function groupResultsByParent(hits) {
       const groupedResults = {};

       hits.forEach((hit) => {
         const parent = hit.parent;
         if (!groupedResults[parent]) {
           groupedResults[parent] = [];
         }
         groupedResults[parent].push(hit);
       });

       return groupedResults;
     }

     // Function to perform Algolia search and update results with more details
     function performAlgoliaSearch(query) {
       searchIndex
         .search(query)
         .then(({ hits }) => {
           // Group search results by parent
           const groupedResults = groupResultsByParent(hits);

           // Display grouped search results in the search results container
           const resultsHTML = Object.keys(groupedResults).map((parent) => {
             const parentResults = groupedResults[parent];

             const parentHTML = parentResults
               .map((hit) => {
                 return `
                   <a href="${hit.relURI}">
                   <div class="mb-4 text-black hover:bg-brand hover:text-white rounded-lg p-4 my-2 bg-zinc-100 transition duration-300 shadow-md">
                     <h3 class="text-lg font-bold">${hit.title}</h3>
                     <p class="text-sm text-zinc-200">${hit.description}</p>
                   </div>
                   </a>
                 `;
               })
               .join("");

             return `
               <div class="mb-8">
                 <h2 class="text-xl font-bold text-black">${parent}</h2>
                 ${parentHTML}
               </div>
             `;
           });

           searchResultsContainer.innerHTML = resultsHTML.join("");
         })
         .catch((err) => {
           console.error(err);
         });
     }

     // Event listener for typing in the search input
     searchInput.addEventListener("input", () => {
       const inputValue = searchInput.value.trim();

       // Toggle "hidden" class based on whether there is input in the search field
       if (inputValue !== "") {
         // Show search results container and hide page container
         searchResultsContainer.classList.remove("hidden");
         pageContainer.classList.add("hidden");

         // Trigger Algolia search with the input value
         performAlgoliaSearch(inputValue);
       } else {
         // Show page container and hide search results container
         searchResultsContainer.classList.add("hidden");
         pageContainer.classList.remove("hidden");
       }
     });

   });
   ```
   {{</collapse>}}
3. Replace the IDs in the script with the appropriate IDs from your theme's layout files. You'll need one for the search input, one for the page container, and one for the search results container.
4. Replace the Algolia configuration values with your own Algolia `App ID` and `Search Only API Key`. You can find these values in your [Algolia dashboard](https://dashboard.algolia.com/account/api-keys/). 
  {{<notice warning>}}
  Never expose your Algolia `Admin API Key` in your front-end code. This key should only be used in your back-end code through an environment variable passed in during deployment. For this guide, we are only using the `Search Only API Key`, which is safe to expose in your front-end code.
  {{</notice>}}
5. Replace the `default` value in the `searchIndex` variable with the name of your Algolia index. This is the index where your site's content will be stored and searched.

### Make the Search Script Available

Now that we have our search script set up, let's make it available in our Hugo project.

1. Navigate to your theme's `layouts/partials/head/js.html` file.
2. Add the script to your bundling steps so it gets included in the site build.
   ```html
   {{- $jsResources := slice }}
   {{- $jsResources = $jsResources | append (resources.Get "js/main.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/chat.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/darkmode.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/search.js") }} <!-- here -->
   {{- $jsResources = $jsResources | append (resources.Get "js/chat.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/code-clipboard.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/tiles.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/tabs.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/glossary.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/toc.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/sidebar-left.js") }}
   {{- $jsResources = $jsResources | append (resources.Get "js/chatTocToggle.js") }}

   {{- if eq hugo.Environment "development" }}
     {{- $jsBundle := $jsResources | resources.Concat "js/bundle.js" | js.Build }}
     <script src="{{ $jsBundle.RelPermalink }}"></script>
   {{- else }}
     {{- $opts := dict "minify" true }}
     {{- $jsBundle := $jsResources | resources.Concat "js/bundle.js" | js.Build $opts | fingerprint }}
     <script src="{{ $jsBundle.RelPermalink }}" integrity="{{ $jsBundle.Data.Integrity }}" crossorigin="anonymous"></script>
   {{- end }}
   ```