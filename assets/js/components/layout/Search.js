/**
 * Search Component
 * Extensible search foundation with support for multiple search backends
 */

import { Component, ComponentManager } from '../../core/ComponentManager.js';
import { SearchFilter } from '../ui/SearchFilter.js';
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
    
    // Initialize SearchFilter component
    this.searchFilter = null;
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
    if (!e || !e.target || typeof e.target.value !== 'string') {
      console.warn('Search: Invalid input event', e);
      return;
    }
    
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
      
      // Initialize SearchFilter component
      this.initializeSearchFilter();

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
      console.log(`Lunr search found ${results.length} results for "${query}"`);
      
      // Transform results to our format
      const transformedResults = this.transformLunrResults(results, documents);
      console.log('Transformed results:', transformedResults);
      return transformedResults;
      
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

      // Build Lunr index - fix binding issue
      const lunrConfig = this.lunrConfig;
      const idx = lunr(function () {
        this.ref(lunrConfig?.ref || 'id');
        const fields = lunrConfig?.fields || ['title', 'description', 'body', 'section', 'category'];
        fields.forEach(field => {
          this.field(field);
        });

        documents.forEach(function (doc) {
          this.add(doc);
        }, this);
      });

      console.log(`Search: Lunr index built with ${documents.length} documents`);
      return { idx, documents };

    } catch (error) {
      console.error('Search: Failed to fetch or build index:', error);
      return { idx: null, documents: [] };
    }
  }

  /**
   * Initialize SearchFilter component
   */
  initializeSearchFilter() {
    if (!this.lunrIndexPromise) return;

    // Create SearchFilter instance
    this.searchFilter = new SearchFilter({
      filterField: this.filterConfig.field,
      displayName: this.filterConfig.displayName,
      onFilterChange: (filterValue) => this.handleFilterChange(filterValue),
      onFilterReady: (filterValues) => {
        this.emit('search:filterReady', { filterValues, totalDocuments: this.documents?.length || 0 });
      }
    });

    // Initialize filter when documents are ready
    this.lunrIndexPromise.then(({ documents }) => {
      this.documents = documents;
      if (this.searchFilter) {
        this.searchFilter.initializeWithDocuments(documents);
      }
    });
  }

  /**
   * Handle filter dropdown changes
   */
  handleFilterChange(filterValue = null) {
    // Get filter value from parameter or SearchFilter component
    const currentFilter = filterValue || this.searchFilter?.getCurrentFilter()?.value || '';
    
    // Re-run search with current query and new filter
    if (this.currentQuery && this.currentQuery.length >= this.minQueryLength) {
      this.debouncedSearch(this.currentQuery);
    } else if (currentFilter) {
      // If no query but filter is set, show filtered results
      this.showFilteredResults(currentFilter);
    } else {
      // Clear results if no query and no filter
      this.hideSearchMode();
    }
    
    this.emit('search:filterChanged', {
      filter: currentFilter,
      filterInfo: this.searchFilter?.getCurrentFilter() || null
    });
  }

  /**
   * Show filtered results without search query
   */
  async showFilteredResults(filterValue) {
    if (!this.lunrIndexPromise) return;
    
    try {
      const { documents } = await this.lunrIndexPromise;
      
      // Use SearchFilter component to filter documents
      const filteredDocs = this.searchFilter ? 
        this.searchFilter.filterDocuments(documents) :
        documents.filter(doc => doc[this.filterConfig.field] === filterValue);
      
      if (filteredDocs.length === 0) {
        this.displayNoResults(`No documents in ${this.formatDisplayText(filterValue)}`);
        return;
      }
      
      // Create pseudo-results for all documents in the filtered section
      const pseudoResults = filteredDocs.map(doc => ({ ref: doc.id, score: 1 }));
      
      // Transform and display
      const groupedResults = this.transformLunrResults(pseudoResults, documents);
      const filterInfo = this.searchFilter?.getCurrentFilter() || { displayText: this.formatDisplayText(filterValue) };
      
      this.displayResults(groupedResults, `${this.filterConfig.displayName}: ${filterInfo.displayText}`);
      this.showSearchMode();
      
      this.emit('search:filterResults', {
        filter: filterValue,
        count: filteredDocs.length,
        filterInfo
      });
    } catch (error) {
      console.error('Filter results failed:', error);
      this.displayError('Failed to filter results. Please try again.');
    }
  }

  /**
   * Transform Lunr results to sophisticated grouped format
   */
  transformLunrResults(results, documents) {
    const groupedResults = {};

    results.forEach(result => {
      const doc = documents.find(d => d.id === result.ref);
      if (doc) {
        const sectionKey = doc.section || 'Other';
        if (!groupedResults[sectionKey]) {
          groupedResults[sectionKey] = {};
        }

        const parentKey = doc.parent || doc.currentSection || 'No Parent';
        if (!groupedResults[sectionKey][parentKey]) {
          groupedResults[sectionKey][parentKey] = [];
        }

        // Rich document object with all Hugo data
        groupedResults[sectionKey][parentKey].push({
          ...doc,
          score: result.score,
          searchResult: true
        });
      }
    });

    // Apply current filter if set via SearchFilter component
    if (this.searchFilter) {
      const currentFilter = this.searchFilter.getCurrentFilter();
      if (currentFilter.value) {
        return this.filterResultsBySection(groupedResults, currentFilter.value);
      }
    }

    return groupedResults;
  }

  /**
   * Get placeholder results for demo/fallback
   */
  getPlaceholderResults(query) {
    // Return grouped format to match displayResults expectations
    return {
      'System': {
        'Search': [
          {
            title: `Search results for "${query}"`,
            description: 'Search functionality is not yet configured. This is a placeholder result.',
            relURI: '#',
            url: '#',
            parent: 'Search',
            section: 'System',
            score: 1
          }
        ]
      }
    };
  }

  /**
   * Display search results with sophisticated grouping
   */
  displayResults(groupedResults, query) {
    if (!this.searchResultsContainer) return;

    // Debug logging
    console.log('displayResults called with:', { groupedResults, query });

    // Handle empty results
    if (!groupedResults || Object.keys(groupedResults).length === 0) {
      this.displayNoResults(query);
      return;
    }

    // Calculate total results for display
    const totalResults = Object.values(groupedResults).reduce((total, sections) => {
      return total + Object.values(sections).reduce((sectionTotal, items) => {
        return sectionTotal + items.length;
      }, 0);
    }, 0);

    // Create sophisticated results HTML matching design system
    const resultsHTML = Object.keys(groupedResults).map(section => {
      const sectionData = groupedResults[section];
      const sectionResultCount = Object.values(sectionData).reduce((count, items) => count + items.length, 0);
      
      const categoryHTML = `
        <div class="search-section animate-fadeIn">
          <div class="search-section-header">
            <div class="search-section-badge">
              ${sectionResultCount}
            </div>
            <h2 class="search-section-title">
              ${this.formatDisplayText(section)}
            </h2>
          </div>
          ${this.renderSectionGroups(sectionData)}
        </div>
      `;
      
      return categoryHTML;
    }).join('');

    // Add sophisticated results header with count and animation
    const headerHTML = `
      <div class="search-results-header">
        <div class="flex items-center justify-between">
          <div>
            <h1>Found ${totalResults} result${totalResults !== 1 ? 's' : ''}</h1>
            <p>Search results for "<span class="font-medium">${query}</span>"</p>
          </div>
          <div class="search-stats">
            <div>${Object.keys(groupedResults).length} section${Object.keys(groupedResults).length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    `;

    this.searchResultsContainer.innerHTML = headerHTML + resultsHTML;
    
    // Add click tracking and micro interactions
    this.addResultInteractions();
    
    this.emit('search:resultsDisplayed', { 
      query, 
      totalResults, 
      sections: Object.keys(groupedResults).length 
    });
  }

  /**
   * Display no results message with sophisticated styling
   */
  displayNoResults(query) {
    if (!this.searchResultsContainer) return;
    
    this.searchResultsContainer.innerHTML = `
      <div class="search-no-results">
        <span class="emoji">🔍</span>
        <h2>No results found</h2>
        <p>No results found for "<span class="font-medium">${query}</span>"</p>
        <div>Try different keywords or explore our documentation sections.</div>
      </div>
    `;
  }

  /**
   * Display error message with sophisticated styling
   */
  displayError(message) {
    if (!this.searchResultsContainer) return;
    
    this.searchResultsContainer.innerHTML = `
      <div class="search-error">
        <span class="emoji">⚠️</span>
        <h2>Search Error</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    `;
  }

  /**
   * Filter grouped results by section
   */
  filterResultsBySection(groupedResults, section) {
    if (!groupedResults[section]) {
      return {};
    }
    return {
      [section]: groupedResults[section]
    };
  }

  /**
   * Format text for display with smart transformations
   */
  formatDisplayText(value) {
    if (!value) return 'Other';
    return value
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Render section groups with sophisticated styling matching design system
   */
  renderSectionGroups(sectionData) {
    return Object.keys(sectionData).map(parent => {
      const parentResults = sectionData[parent];
      
      // Ensure parentResults is an array
      if (!Array.isArray(parentResults)) {
        console.warn('Expected parentResults to be an array, got:', typeof parentResults, parentResults);
        return '';
      }
      
      const parentHTML = `
        <div class="search-parent-group">
          <h3>${this.formatDisplayText(parent)}</h3>
          <div class="space-y-3">
            ${parentResults.map(result => this.renderSearchHit(result)).join('')}
          </div>
        </div>
      `;
      
      return parentHTML;
    }).join('');
  }

  /**
   * Render individual search hit with sophisticated styling matching design system
   */
  renderSearchHit(result) {
    const description = result.description || result.summary || 'No description available.';
    const lastCommit = result.lastCommit ? new Date(result.lastCommit).toLocaleDateString() : '';
    const wordCount = result.wordCount || 0;
    const readingTime = result.readingTime || Math.ceil(wordCount / 200);
    
    return `
      <a href="${result.relURI || result.url || '#'}" 
         class="search-hit" 
         data-section="${result.section || ''}" 
         data-parent="${result.parent || ''}">
        <div class="search-hit-content">
          
          <!-- Hit Header -->
          <div class="search-hit-header">
            <div class="flex-1">
              <div class="search-hit-section">
                ${this.formatDisplayText(result.section || '')}
              </div>
              <h4 class="search-hit-title">
                ${result.title || 'Untitled'}
              </h4>
            </div>
            ${result.score ? `<div class="search-hit-score">
                               ${Math.round(result.score * 100)}%
                             </div>` : ''}
          </div>
          
          <!-- Hit Description -->
          <p class="search-hit-description">
            ${this.truncateText(description, 150)}
          </p>
          
          <!-- Hit Metadata -->
          <div class="search-hit-metadata">
            <div class="flex items-center space-x-4">
              ${readingTime ? `<span>📖 ${readingTime} min read</span>` : ''}
              ${wordCount ? `<span>📝 ${wordCount} words</span>` : ''}
            </div>
            ${lastCommit ? `<span>📅 ${lastCommit}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  /**
   * Truncate text with smart word boundaries
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated) + '...';
  }

  /**
   * Add interactive behaviors to search results
   */
  addResultInteractions() {
    const searchHits = this.searchResultsContainer.querySelectorAll('.search-hit');
    
    searchHits.forEach(hit => {
      // Hover effects
      hit.addEventListener('mouseenter', () => {
        hit.querySelector('.search-hit-content').style.transform = 'translateY(-1px)';
        hit.querySelector('.search-hit-content').style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });
      
      hit.addEventListener('mouseleave', () => {
        hit.querySelector('.search-hit-content').style.transform = 'translateY(0)';
        hit.querySelector('.search-hit-content').style.boxShadow = '';
      });
      
      // Click tracking
      hit.addEventListener('click', (e) => {
        const section = hit.getAttribute('data-section');
        const parent = hit.getAttribute('data-parent');
        const title = hit.querySelector('.search-hit-title').textContent;
        
        this.emit('search:resultClicked', {
          section,
          parent,
          title,
          url: hit.href
        });
        
        // Visual feedback
        hit.style.opacity = '0.7';
        setTimeout(() => {
          hit.style.opacity = '1';
        }, 150);
      });
    });
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
ComponentManager.register('search', Search);