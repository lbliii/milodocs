---
title: Enable Algolia Search
description: learn how to add Algolia search to your Hugo site.
---

This guide provides a quick method for integrating [Algolia](https://www.algolia.com) search into your Hugo website. It involves setting up a cron task to update your index and installing the `algoliasearch-lite` script version, which is capable of handling search-only operations.

{{<notice snack>}}
Algolia is a hosted search engine capable of delivering real-time results from the first keystroke. 
Algolia provides a [free tier](https://www.algolia.com/pricing) that includes 10,000 records and 50,000 operations per month. For most projects, startups, and small businesses, this should be more than enough to get started.
{{</notice>}}

## Before You Start 

- Set up [JSON output format templates](/guides/themes/output-formats/json).
- Review the [Algolia API reference](https://www.algolia.com/doc/api-reference/widgets/js/) needed for building your search layout.

{{<notice tip "Check Your Site Index" >}}
You can perform a quick test by going to `localhost:1313/index.json`; it should look like [this](https://milodocs-theme.netlify.app/index.json).
{{</notice>}}

--- 

## How to Create an Algolia Index

1. Create a new Algolia account or log in to your existing account.
2. Navigate to **Data Sources** > **Connectors**.
3. Find the **Json** tile and select **Connect**.
4. Select **Get Started**.

### Configure Data Source 

1. Select **None** for authentication.
2. Input the URL of your hosted `index.json` file. (e.g., `https://milodocs-theme.netlify.app/index.json`).
3. Specify a unique property identifier for your Algolia records (e.g., `id` if you've added one to your json template.).
4. Name the data source. 
5. Select **Create Source**.

### Configure Destination

1. Input a name for your destination index. If it doesn't exist, it will get automatically created.
2. Generate index credentials by selecting **Create one for me**.
3. Name the destination.
4. Select **Create Destination**.

### Configure Task

1. For frequency, select **Scheduled** and choose **Every day**.
2. For behavior, select **Replace**.
3. Select **Create Task**.
4. Press the **Play** button on the task to trigger your first pull.
5. Select **Run** to confirm.


### Configure Index

Searches will return results out of the box, but it's better to configure and rank your searchable attributes.

1. Navigate to **Search** > **Index**.
2. Select the **Configuration** tab.
3. Select the **Searchable Attribute** section.
4. Input all of the searchable attributes you'd like and rank them.
   - `title`
   - `description`
   - `body`
5. Select **Review and Save Settings**.

You now have an Algolia index that is automatically refreshed once a day! No complicated cralwers or plugins needed.

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

### Define Results Container

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

### Define SearchBox Input

Let's create a search input element that will be used to trigger the search functionality. Typically this is placed in the layout that defines your top navigation bar.

```html
<!-- Searchbar -->
<div id="topNavSearch" class="flex items-center space-x-4 text-xs">
    <input type="search" id="searchInput" class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand md:w-96 bg-zinc-100 text-black" placeholder="Search..." aria-label="Search" />
</div>
```

### Create search.js File 

Now that we have our search results container and search input elements set up, let's create a JavaScript file that will handle the search functionality.

This particular script transforms your search results (`hits`) by grouping them by their `parent` value, which is a field in my JSON schema. You can group or transform the returned hits in a variety of ways --- feel free to make this your own.

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
1. Replace the `default` value in the `searchIndex` variable with the name of your Algolia index that we created earlier.

### Make Search Script Available

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

  ## Test

  1. Run `hugo server` locally.
  2. Perform a search in your search bar.
  3. Review the console for any errors.