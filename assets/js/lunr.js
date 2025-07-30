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

// Wait for Lunr.js to be available, then start fetching and processing index
function waitForLunr() {
  if (typeof lunr !== 'undefined') {
    initializeLunr();
    setupSearchEventListeners();
  } else {
    // Wait 100ms and try again
    setTimeout(waitForLunr, 100);
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', waitForLunr);

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

// Setup event listeners once Lunr index is ready
function setupSearchEventListeners() {
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
}

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

  // Handle empty results
  if (Object.keys(groupedResults).length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-lg font-medium" style="color: var(--color-text-secondary);">
          No results found
        </p>
        <p class="text-sm" style="color: var(--color-text-tertiary);">
          Try a different search query or explore our documentation.
        </p>
      </div>
    `;
    return;
  }

  Object.keys(groupedResults).forEach((category) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("mb-8");
    
    // Enhanced category header with NVIDIA styling
    categoryDiv.innerHTML = `
      <div class="flex items-center mb-6">
        <div class="w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs font-bold" 
             style="background-color: var(--color-brand); color: white;">
          ${Object.keys(groupedResults[category]).length}
        </div>
        <h2 class="text-2xl font-bold" style="color: var(--color-text-primary); font-family: var(--font-family-brand);">
          ${category}
        </h2>
      </div>
    `;

    Object.keys(groupedResults[category]).forEach((parent) => {
      const parentDiv = document.createElement("div");
      parentDiv.classList.add("mb-6");
      
      // Enhanced parent section header
      parentDiv.innerHTML = `
        <h3 class="text-lg font-semibold mb-4" style="color: var(--color-text-secondary); font-family: var(--font-family-brand);">
          ${parent}
        </h3>
      `;
      
      groupedResults[category][parent].forEach((result) => {
        const resultDiv = document.createElement("div");
        resultDiv.className = "search-hit";
        resultDiv.onclick = () => window.location.href = result.relURI;
        
        resultDiv.innerHTML = `
          <div class="search-hit-section">${category}</div>
          <h4 class="search-hit-title">${result.title}</h4>
          <p class="search-hit-description">${result.description || 'No description available.'}</p>
        `;
        
        parentDiv.appendChild(resultDiv);
      });

      categoryDiv.appendChild(parentDiv);
    });

    container.appendChild(categoryDiv);
  });
}
