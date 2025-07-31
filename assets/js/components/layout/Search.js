/**
 * Search Component
 * Extensible search foundation with support for multiple search backends
 */

import { Component } from '../../core/ComponentManager.js';
import { debounce } from '../../utils/dom.js';

export class Search extends Component {
  constructor(config = {}) {
    super({
      name: 'search',
      selector: config.selector || '#searchInput',
      ...config
    });
    
    this.searchInput = null;
    this.searchResultsContainer = null;
    this.pageContainer = null;
    this.searchBackend = config.searchBackend || 'lunr'; // Default to Lunr - 'algolia', 'lunr', 'custom', 'none'
    this.debounceDelay = config.debounceDelay || 300;
    this.minQueryLength = config.minQueryLength || 2;
    
    // Search configuration
    this.config = {
      algolia: {
        appId: config.algolia?.appId || '',
        apiKey: config.algolia?.apiKey || '',
        indexName: config.algolia?.indexName || 'default'
      },
      ...config
    };
    
    this.debouncedSearch = null;
    this.currentQuery = '';
    this.isSearching = false;
  }

  async onInit() {
    this.cacheElements();
    
    if (!this.searchInput) {
      console.warn('Search: No search input found');
      return;
    }

    this.setupEventListeners();
    this.initializeSearchBackend();
    
    console.log(`Search: Initialized with backend "${this.searchBackend}"`);
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.searchInput = document.getElementById('searchInput');
    this.searchResultsContainer = document.getElementById('searchResultsContainer');
    this.pageContainer = document.getElementById('pageContainer');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Create debounced search function
    this.debouncedSearch = debounce((query) => {
      this.performSearch(query);
    }, this.debounceDelay);

    // Input event listener
    this.searchInput.addEventListener('input', (e) => {
      this.handleInput(e);
    });

    // Focus and blur events
    this.searchInput.addEventListener('focus', () => {
      this.emit('search:focused');
    });

    this.searchInput.addEventListener('blur', () => {
      this.emit('search:blurred');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Clear search on escape
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  /**
   * Handle input events
   */
  handleInput(e) {
    const query = e.target.value.trim();
    this.currentQuery = query;

    if (query.length >= this.minQueryLength) {
      this.showSearchMode();
      this.debouncedSearch(query);
    } else if (query.length === 0) {
      this.hideSearchMode();
      this.clearResults();
    }

    this.emit('search:input', { query, length: query.length });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(e) {
    // Ctrl+K or Cmd+K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.focusSearch();
    }
  }

  /**
   * Initialize search backend
   */
  async initializeSearchBackend() {
    // Wait for Lunr to be available if using Lunr backend
    if (this.searchBackend === 'lunr') {
      await this.waitForLunr();
    }
    
    switch (this.searchBackend) {
      case 'algolia':
        await this.initializeAlgolia();
        break;
      case 'lunr':
        await this.initializeLunr();
        break;
      case 'custom':
        await this.initializeCustomSearch();
        break;
      case 'none':
      default:
        console.log('Search: No search backend configured');
        break;
    }
  }

  /**
   * Wait for Lunr.js to be available
   */
  async waitForLunr() {
    return new Promise((resolve) => {
      const checkLunr = () => {
        if (typeof lunr !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkLunr, 100);
        }
      };
      checkLunr();
    });
  }

  /**
   * Initialize Algolia search
   */
  async initializeAlgolia() {
    try {
      if (!this.config.algolia.appId || !this.config.algolia.apiKey) {
        console.warn('Search: Algolia configuration missing');
        return;
      }

      // Note: This would require the Algolia library to be loaded
      // For now, just prepare the configuration
      console.log('Search: Algolia backend ready');
      this.emit('search:backendReady', { backend: 'algolia' });
    } catch (error) {
      console.error('Search: Failed to initialize Algolia:', error);
    }
  }

  /**
   * Initialize Lunr.js search
   */
  async initializeLunr() {
    try {
      if (typeof lunr === 'undefined') {
        console.warn('Search: Lunr.js library not loaded');
        return;
      }

      // Lunr configuration
      this.lunrConfig = {
        ref: "id",
        fields: ["title", "description", "body", "section", "category"]
      };

      // Filter configuration
      this.filterConfig = {
        field: "section",
        displayName: "Sections"
      };

      // Initialize Lunr index
      this.lunrIndexPromise = this.fetchAndBuildIndex();
      
      // Setup filter dropdown if available
      this.setupFilterDropdown();

      console.log('Search: Lunr backend ready');
      this.emit('search:backendReady', { backend: 'lunr' });
    } catch (error) {
      console.error('Search: Failed to initialize Lunr:', error);
    }
  }

  /**
   * Initialize custom search
   */
  async initializeCustomSearch() {
    console.log('Search: Custom backend ready');
    this.emit('search:backendReady', { backend: 'custom' });
  }

  /**
   * Perform search based on configured backend
   */
  async performSearch(query) {
    if (this.isSearching) return;
    
    this.isSearching = true;
    this.showLoadingState();

    try {
      let results = [];
      
      switch (this.searchBackend) {
        case 'algolia':
          results = await this.searchAlgolia(query);
          break;
        case 'lunr':
          results = await this.searchLunr(query);
          break;
        case 'custom':
          results = await this.searchCustom(query);
          break;
        default:
          results = this.getPlaceholderResults(query);
          break;
      }

      this.displayResults(results, query);
      this.emit('search:completed', { query, results: results.length });
      
    } catch (error) {
      console.error('Search error:', error);
      this.displayError('Search failed. Please try again.');
      this.emit('search:error', { query, error });
    } finally {
      this.isSearching = false;
      this.hideLoadingState();
    }
  }

  /**
   * Search using Algolia
   */
  async searchAlgolia(query) {
    // Placeholder for Algolia implementation
    console.log('Searching Algolia for:', query);
    return this.getPlaceholderResults(query);
  }

  /**
   * Search using Lunr.js
   */
  async searchLunr(query) {
    try {
      if (!this.lunrIndexPromise) {
        return this.getPlaceholderResults(query);
      }

      const { idx, documents } = await this.lunrIndexPromise;
      
      if (!idx || !documents) {
        console.warn('Search: Lunr index not available');
        return this.getPlaceholderResults(query);
      }

      // Perform Lunr search
      const results = idx.search(query);
      
      // Transform results to our format
      return this.transformLunrResults(results, documents);
      
    } catch (error) {
      console.error('Search: Lunr search failed:', error);
      return this.getPlaceholderResults(query);
    }
  }

  /**
   * Search using custom implementation
   */
  async searchCustom(query) {
    // Placeholder for custom search implementation
    console.log('Custom search for:', query);
    return this.getPlaceholderResults(query);
  }

  /**
   * Fetch and build Lunr index
   */
  async fetchAndBuildIndex() {
    try {
      const response = await fetch('/index.json');
      const documents = await response.json();

      if (!documents || documents.length === 0) {
        console.warn('Search: No documents found in index.json');
        return { idx: null, documents: [] };
      }

      // Build Lunr index
      const idx = lunr(function () {
        this.ref(this.lunrConfig?.ref || 'id');
        const fields = this.lunrConfig?.fields || ['title', 'description', 'body', 'section', 'category'];
        fields.forEach(field => {
          this.field(field);
        });

        documents.forEach(function (doc) {
          this.add(doc);
        }, this);
      }.bind({ lunrConfig: this.lunrConfig }));

      console.log(`Search: Lunr index built with ${documents.length} documents`);
      return { idx, documents };

    } catch (error) {
      console.error('Search: Failed to fetch or build index:', error);
      return { idx: null, documents: [] };
    }
  }

  /**
   * Setup filter dropdown with categories
   */
  setupFilterDropdown() {
    if (!this.lunrIndexPromise) return;

    this.lunrIndexPromise.then(({ documents }) => {
      const filterSelect = document.getElementById('filterSelect');
      if (!filterSelect) return;

      // Get unique filter values
      const filterValues = [...new Set(
        documents.map(doc => doc[this.filterConfig.field])
          .filter(value => value !== null && value !== undefined)
      )].sort();

      // Helper function to convert to display text
      const toDisplayText = (value) => {
        return value
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      // Clear existing options (except first one which might be "All")
      const firstOption = filterSelect.firstElementChild;
      filterSelect.innerHTML = '';
      if (firstOption) {
        filterSelect.appendChild(firstOption);
      }

      // Add filter options
      filterValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = toDisplayText(value);
        filterSelect.appendChild(option);
      });

      // Set default filter if available
      const filterContainer = document.getElementById('filterContainer');
      if (filterContainer) {
        const defaultFilter = filterContainer.getAttribute('data-category');
        if (defaultFilter && filterValues.includes(defaultFilter)) {
          filterSelect.value = defaultFilter;
        }
      }

      // Update filter label
      const filterLabel = document.querySelector('label[for="filterSelect"]');
      if (filterLabel) {
        filterLabel.textContent = this.filterConfig.displayName;
      }

      // Add filter change listener
      filterSelect.addEventListener('change', () => {
        this.handleFilterChange();
      });

      this.emit('search:filterReady', { filterValues });
    });
  }

  /**
   * Handle filter dropdown changes
   */
  handleFilterChange() {
    if (this.currentQuery) {
      this.debouncedSearch(this.currentQuery);
    }
  }

  /**
   * Transform Lunr results to standard format
   */
  transformLunrResults(results, documents) {
    const transformedResults = [];
    
    results.forEach(result => {
      const doc = documents.find(d => d.id === result.ref);
      if (doc) {
        transformedResults.push({
          title: doc.title,
          description: doc.description,
          url: doc.relURI || doc.url,
          parent: doc.section || doc.parent || 'Other',
          section: doc.section,
          category: doc.category,
          score: result.score
        });
      }
    });

    // Apply current filter if set
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect && filterSelect.value) {
      const selectedFilter = filterSelect.value;
      return transformedResults.filter(result => 
        result[this.filterConfig.field] === selectedFilter
      );
    }

    return transformedResults;
  }

  /**
   * Get placeholder results for demo/fallback
   */
  getPlaceholderResults(query) {
    return [
      {
        title: `Search results for "${query}"`,
        description: 'Search functionality is not yet configured. This is a placeholder result.',
        url: '#',
        parent: 'System'
      }
    ];
  }

  /**
   * Display search results
   */
  displayResults(results, query) {
    if (!this.searchResultsContainer) return;

    if (results.length === 0) {
      this.displayNoResults(query);
      return;
    }

    const groupedResults = this.groupResultsByParent(results);
    const resultsHTML = Object.keys(groupedResults).map(parent => {
      const parentResults = groupedResults[parent];
      const parentHTML = parentResults.map(result => `
        <a href="${result.url || '#'}" class="block">
          <div class="mb-4 text-black hover:bg-brand hover:text-white rounded-lg p-4 my-2 bg-zinc-100 transition duration-300 shadow-md">
            <h3 class="text-lg font-bold">${result.title}</h3>
            <p class="text-sm">${result.description || ''}</p>
          </div>
        </a>
      `).join('');

      return `
        <div class="mb-8">
          <h2 class="text-xl font-bold text-black">${parent}</h2>
          ${parentHTML}
        </div>
      `;
    });

    this.searchResultsContainer.innerHTML = resultsHTML.join('');
  }

  /**
   * Display no results message
   */
  displayNoResults(query) {
    if (!this.searchResultsContainer) return;
    
    this.searchResultsContainer.innerHTML = `
      <div class="text-center py-8">
        <h2 class="text-xl font-bold text-gray-600 mb-2">No results found</h2>
        <p class="text-gray-500">No results found for "${query}". Try different keywords.</p>
      </div>
    `;
  }

  /**
   * Display error message
   */
  displayError(message) {
    if (!this.searchResultsContainer) return;
    
    this.searchResultsContainer.innerHTML = `
      <div class="text-center py-8">
        <h2 class="text-xl font-bold text-red-600 mb-2">Search Error</h2>
        <p class="text-red-500">${message}</p>
      </div>
    `;
  }

  /**
   * Group results by parent category
   */
  groupResultsByParent(results) {
    const grouped = {};
    results.forEach(result => {
      const parent = result.parent || 'Other';
      if (!grouped[parent]) {
        grouped[parent] = [];
      }
      grouped[parent].push(result);
    });
    return grouped;
  }

  /**
   * Show search mode (hide page, show results)
   */
  showSearchMode() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.classList.remove('hidden');
    }
    if (this.pageContainer) {
      this.pageContainer.classList.add('hidden');
    }
    document.body.classList.add('search-active');
    this.emit('search:modeChanged', { active: true });
  }

  /**
   * Hide search mode (show page, hide results)
   */
  hideSearchMode() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.classList.add('hidden');
    }
    if (this.pageContainer) {
      this.pageContainer.classList.remove('hidden');
    }
    document.body.classList.remove('search-active');
    this.emit('search:modeChanged', { active: false });
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin h-8 w-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-2"></div>
          <p class="text-gray-500">Searching...</p>
        </div>
      `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    // Loading state is replaced by results or error message
  }

  /**
   * Clear search results
   */
  clearResults() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.innerHTML = '';
    }
  }

  /**
   * Clear search and return to normal mode
   */
  clearSearch() {
    this.searchInput.value = '';
    this.currentQuery = '';
    this.hideSearchMode();
    this.clearResults();
    this.emit('search:cleared');
  }

  /**
   * Focus the search input
   */
  focusSearch() {
    this.searchInput.focus();
    this.emit('search:focused');
  }

  /**
   * Get current search state
   */
  getState() {
    return {
      query: this.currentQuery,
      isSearching: this.isSearching,
      backend: this.searchBackend,
      isActive: !this.searchResultsContainer?.classList.contains('hidden')
    };
  }

  /**
   * Update search configuration
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    if (newConfig.searchBackend) {
      this.searchBackend = newConfig.searchBackend;
      this.initializeSearchBackend();
    }
  }

  /**
   * Component cleanup
   */
  onDestroy() {
    this.clearSearch();
    console.log('Search: Component destroyed');
  }
}

// Auto-register component
import { ComponentManager } from '../../core/ComponentManager.js';
ComponentManager.register('search', Search);