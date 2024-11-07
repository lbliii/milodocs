// Create a global variable to store the Lunr index
let lunrIndexPromise = null;

// Function to initialize and fetch Lunr index
function initializeLunr() {
  // Define the Lunr configuration
  const lunrConfig = {
    ref: "id",
    fields: ["title", "description", "body", "parent", "product"]
  };

  // Initialize Lunr index processing as a Promise
  lunrIndexPromise = fetch("/index.json")
    .then(response => response.json())
    .then(data => {
      const documents = data;

      // Safely handle product filter
      const productFilter = document.getElementById("filterSelect");
      if (productFilter) {
        const products = [...new Set(documents.map(doc => doc.product).filter(product => product !== null))].sort();

        // Populate product filter options
        products.forEach((product) => {
          const option = document.createElement("option");
          option.value = product;
          option.textContent = product;
          productFilter.appendChild(option);
        });

        // Set default product filter if available
        const filterContainer = document.getElementById("filterContainer");
        if (filterContainer) {
          const defaultProduct = filterContainer.getAttribute("data-product");
          if (defaultProduct) {
            productFilter.value = defaultProduct;
          }
        }
      }

      // Initialize Lunr with the configuration
      const idx = lunr(function () {
        this.ref(lunrConfig.ref);
        lunrConfig.fields.forEach(field => {
          this.field(field);
        });

        if (documents.length === 0) {
          console.warn("No documents to index.");
          return;
        } else {
          documents.forEach(function (doc) {
            this.add(doc);
          }, this);
        }
      });

      return { idx, documents };
    })
    .catch(error => {
      console.error("Error fetching index.json:", error);
      return { idx: null, documents: [] }; // Fallback in case of error
    });
}

// Immediately start fetching and processing Lunr index
initializeLunr();

// Function to handle search and filter
function handleSearchAndFilter(idx, documents) {
  const searchInput = document.getElementById("searchInput");
  const productFilter = document.getElementById("filterSelect");
  const pageContainer = document.getElementById("pageContainer");
  const searchResultsContainer = document.getElementById("searchResultsContainer");
  const searchHitsContainer = document.getElementById("searchHitsContainer");

  const inputValue = searchInput ? searchInput.value.trim() : "";
  const selectedProduct = productFilter ? productFilter.value : "";

  // Only show results if the search input is not empty
  if (inputValue !== "") {
    // Show search results container and hide page container
    if (searchResultsContainer && pageContainer) {
      searchResultsContainer.classList.remove("hidden");
      pageContainer.classList.add("hidden");
    }

    // Trigger lunr search with the input value
    const results = idx.search(inputValue);
    let detailedResults = transformResults(results, documents);

    // Filter results by selected product if productFilter exists and a product is selected
    if (selectedProduct !== "") {
      detailedResults = filterResultsByProduct(detailedResults, selectedProduct);
    }

    if (searchHitsContainer) {
      renderResults(detailedResults, searchHitsContainer);
    }
  } else {
    // Hide search results container and show page container
    if (searchResultsContainer && pageContainer) {
      searchResultsContainer.classList.add("hidden");
      pageContainer.classList.remove("hidden");
    }
  }
}

// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the Lunr index to be ready
  lunrIndexPromise.then(({ idx, documents }) => {
    if (!idx) {
      // Handle the case where index initialization failed
      return;
    }

    const searchInput = document.getElementById("searchInput");
    const productFilter = document.getElementById("filterSelect");

    // Add event listeners for search input and product filter if they exist
    if (searchInput) {
      searchInput.addEventListener("input", () => handleSearchAndFilter(idx, documents));
    }

    if (productFilter) {
      productFilter.addEventListener("change", () => handleSearchAndFilter(idx, documents));
    }
  });
});

// Utility Functions

function transformResults(results, documents) {
  const groupedResults = {};

  results.forEach(function (result) {
    const doc = documents.find(function (doc) {
      return doc.id === result.ref;
    });

    if (doc) {
      const productKey = doc.product || 'No Product';
      if (!groupedResults[productKey]) {
        groupedResults[productKey] = {};
      }

      if (!groupedResults[productKey][doc.parent]) {
        groupedResults[productKey][doc.parent] = [];
      }

      groupedResults[productKey][doc.parent].push(doc);
    }
  });

  return groupedResults;
}

function filterResultsByProduct(results, product) {
  const filteredResults = {};
  if (results[product]) {
    filteredResults[product] = results[product];
  }
  return filteredResults;
}

function renderResults(groupedResults, container) {
  container.innerHTML = "";

  Object.keys(groupedResults).forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("mb-4", "pb-4", "rounded-lg");
    productDiv.innerHTML = `<h2 class="text-xl font-bold py-4">Search results for ${product}</h2>`;

    Object.keys(groupedResults[product]).forEach((parent) => {
      const parentDiv = document.createElement("div");
      parentDiv.classList.add("mb-4", "p-4", "bg-zinc-100", "rounded-lg");
      parentDiv.innerHTML = `<h3 class="text-xl font-semibold py-4">${parent}</h3>`;

      groupedResults[product][parent].forEach((result) => {
        const resultDiv = document.createElement("div");
        resultDiv.classList.add(
          "mb-2",
          "p-2",
          "bg-white",
          "rounded-lg",
          "shadow-md",
          "transition",
          "duration-300",
          "hover:bg-brand",
          "hover:text-white"
        );
        resultDiv.innerHTML = `
              <a href="${result.relURI}" class="block p-2 rounded-lg">
                <h4 class="text-md font-medium">${result.title}</h4>
                <p class="text-sm">${result.description}</p>
              </a>
            `;
        parentDiv.appendChild(resultDiv);
      });

      productDiv.appendChild(parentDiv);
    });

    container.appendChild(productDiv);
  });
}
