// Create a global variable to store the Lunr index
let lunrIndexPromise = null;

// Function to initialize and fetch Lunr index
function initializeLunr() {
  // Define the Lunr configuration
  const lunrConfig = {
    ref: "id",
    fields: ["title", "description", "body", "section", "category"]
  };

  // Define filter configuration
  const filterConfig = {
    field: "section", // Default filter field (can be changed as needed)
    displayName: "Sections" // Display name for the filter field
  };

  // Initialize Lunr index processing as a Promise
  lunrIndexPromise = fetch("/index.json")
    .then(response => response.json())
    .then(data => {
      const documents = data;

      // Safely handle configurable filter
      const filterSelect = document.getElementById("filterSelect");
      if (filterSelect) {
        // Create a mapping of actual values to display text
        const filterValues = [...new Set(documents.map(doc => doc[filterConfig.field]).filter(value => value !== null))].sort();
        
        // Helper function to convert to display text
        const toDisplayText = (value) => {
          return value
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };

        // Populate filter options with display text
        filterValues.forEach((value) => {
          const option = document.createElement("option");
          option.value = value;  // Keep original value
          option.textContent = toDisplayText(value);  // Convert to display text
          filterSelect.appendChild(option);
        });

        // Set default filter if available
        const filterContainer = document.getElementById("filterContainer");
        if (filterContainer) {
          const defaultFilter = filterContainer.getAttribute("data-category"); // Renamed data attribute
          if (defaultFilter) {
            filterSelect.value = defaultFilter;
          }
        }

        // Update filter label or related UI elements with display name
        const filterLabel = document.querySelector("label[for='filterSelect']");
        if (filterLabel) {
          filterLabel.textContent = filterConfig.displayName.charAt(0).toUpperCase() + filterConfig.displayName.slice(1);
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

    console.log(lunrIndexPromise);
}

// Immediately start fetching and processing Lunr index
initializeLunr();

// Function to handle search and filter
function handleSearchAndFilter(idx, documents) {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("filterSelect");
  const pageContainer = document.getElementById("pageContainer");
  const searchResultsContainer = document.getElementById("searchResultsContainer");
  const searchHitsContainer = document.getElementById("searchHitsContainer");

  const inputValue = searchInput ? searchInput.value.trim() : "";
  const selectedCategory = categoryFilter ? categoryFilter.value : "";

  // Only proceed if we have a search input OR a category filter
  if (inputValue !== "" || selectedCategory !== "") {
    // Show search results container and hide page container
    if (searchResultsContainer && pageContainer) {
      searchResultsContainer.classList.remove("hidden");
      pageContainer.classList.add("hidden");
    }

    let detailedResults;
    if (inputValue !== "") {
      // Perform Lunr search if there's a search term
      const results = idx.search(inputValue);
      detailedResults = transformResults(results, documents);
    } else {
      // If no search term but has filter, show all documents
      detailedResults = transformResults(
        documents.map(doc => ({ ref: doc.id })),
        documents
      );
    }

    // Apply category filter if selected
    if (selectedCategory !== "") {
      detailedResults = filterResultsBySection(detailedResults, selectedCategory);
    }

    if (searchHitsContainer) {
      renderResults(detailedResults, searchHitsContainer);
    }
  } else {
    // Hide search results if no search or filter
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
    const categoryFilter = document.getElementById("filterSelect");

    // Add event listeners for search input and category filter if they exist
    if (searchInput) {
      searchInput.addEventListener("input", () => handleSearchAndFilter(idx, documents));
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => handleSearchAndFilter(idx, documents));
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
      const sectionKey = doc.section || 'No Section';
      if (!groupedResults[sectionKey]) {
        groupedResults[sectionKey] = {};
      }

      const parentKey = doc.parent || 'No Parent';
      if (!groupedResults[sectionKey][parentKey]) {
        groupedResults[sectionKey][parentKey] = [];
      }

      groupedResults[sectionKey][parentKey].push(doc);
    }
  });

  return groupedResults;
}

function filterResultsBySection(results, section) {
  // If there are no results for the selected section, return empty object
  if (!results[section]) {
    return {};
  }
  
  // Return only the results for the selected section
  return {
    [section]: results[section]
  };
}

function renderResults(groupedResults, container) {
  container.innerHTML = "";

  Object.keys(groupedResults).forEach((category) => { // Renamed from product
    const categoryDiv = document.createElement("div"); // Renamed from productDiv
    categoryDiv.classList.add("mb-4", "pb-4", "rounded-lg");
    categoryDiv.innerHTML = `<h2 class="text-xl text-black font-bold py-4">Search results for ${category}</h2>`; // Renamed from product

    Object.keys(groupedResults[category]).forEach((parent) => { // Renamed from product
      const parentDiv = document.createElement("div");
      parentDiv.classList.add("mb-4", "p-4", "bg-zinc-100", "rounded-lg");
      parentDiv.innerHTML = `<h3 class="text-xl text-black font-semibold py-4">${parent}</h3>`;
      
      groupedResults[category][parent].forEach((result) => { // Renamed from product
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
                <h4 class="text-md text-black font-medium">${result.title}</h4>
                <p class="text-sm text-black">${result.description}</p>
              </a>
            `;
        parentDiv.appendChild(resultDiv);
      });

      categoryDiv.appendChild(parentDiv);
    });

    container.appendChild(categoryDiv);
  });
}
