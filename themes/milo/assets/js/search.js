document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const pageContainer = document.getElementById("pageContainer");
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );

  // Algolia configuration
  const searchClient = algoliasearch(
    "4TYL7GJO66",
    "4b6a7e6e3a2cf663b3e4f8a372e8453a"
  );
  const searchIndex = searchClient.initIndex("default"); // Replace 'your_index_name' with your Algolia index name

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
                <a href="${hit.uri}">
                <div class="mb-4 text-black hover:bg-brand hover:text-white tile rounded-lg p-4 my-2 bg-zinc-100 transition duration-300 shadow-md">
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
