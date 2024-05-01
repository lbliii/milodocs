---
title: layout-search.js
description: Learn about how the search.js file works for this theme.
---

The `search.js` file is used to manage the [Algolia](https://www.algolia.com/) search integration and experience.

## How it Works

This script automatically toggles the view of a regular page versus the search page when a user inputs a search string. With every added letter, a new search is performed against the index.

Results returned are grouped by parent article and then provided as a stacked series of links.

{{<notice tip "free search limit">}}
Algolia typically allows 10,000 free monthly searches --- though this is subject to change.
{{</notice>}}

## Set Up 

1. Create an **Algolia** account.
2. Provide your **App ID** and **Search Only API Key** to the `searchClient` (these are safe to reveal; the **Admin API Key** is not.).
3. Push or upload your site's index, found at [/index.json](/index.json).

That's it! Start searching. 

I personally just download this file and upload it per release; it's a manual process --- but super easy. You are welcome to integrate the Algolia API with your Admin API Key to push auto updates.

{{<notice snack "have it your way" >}}
There are several ways to implement Algolia; [DocSearch](https://docsearch.algolia.com/) is popular and free. I personally like to integrate the style of the UX more, but this can require more knowledge of [`InstantSearch.js`](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/). 

If you like the default implementation but wish to style the search hits differently, you can do so in the `performAlgoliaSearch(query)` function.
{{</notice>}}


## Source Code 

{{%include "assets/js/layout-search.js" "js" %}}