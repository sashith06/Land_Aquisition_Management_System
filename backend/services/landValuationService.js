const axios = require('axios');
const geminiService = require('./geminiService');

class LandValuationService {
  constructor() {
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    this.googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    this.googleCxId = process.env.GOOGLE_SEARCH_CX;
  }

  /**
   * Search Google Custom Search for land prices
   */
  async searchGoogle(query) {
    try {
      console.log('Searching Google for:', query);
      
      if (!this.googleApiKey || !this.googleCxId) {
        console.log('Google Search API not configured, using fallback');
        return 'Search API not configured';
      }

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: this.googleCxId,
          q: query,
          num: 10 // Get top 10 results
        },
        timeout: 15000
      });

      // Combine snippets from search results
      let searchText = '';
      
      if (response.data.items && Array.isArray(response.data.items)) {
        response.data.items.forEach(item => {
          if (item.title) {
            searchText += item.title + '\n';
          }
          if (item.snippet) {
            searchText += item.snippet + '\n\n';
          }
          // Also include meta tags if available
          if (item.pagemap?.metatags) {
            item.pagemap.metatags.forEach(meta => {
              if (meta['og:description']) {
                searchText += meta['og:description'] + '\n';
              }
            });
          }
        });
      }

      if (searchText.length > 0) {
        console.log(`Found ${response.data.items.length} search results`);
        return searchText;
      }

      return 'No results found';
    } catch (error) {
      console.error('Google Search error:', error.message);
      if (error.response?.status === 429) {
        console.error('Google Search API quota exceeded');
      }
      return 'Search failed';
    }
  }

  /**
   * Search DuckDuckGo for land prices (fallback)
   */
  async searchDuckDuckGo(query) {
    try {
      console.log('Searching DuckDuckGo for:', query);
      
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        },
        timeout: 10000
      });

      // Combine all text sources
      let searchText = '';
      
      if (response.data.AbstractText) {
        searchText += response.data.AbstractText + '\n';
      }
      
      if (response.data.RelatedTopics && Array.isArray(response.data.RelatedTopics)) {
        response.data.RelatedTopics.forEach(topic => {
          if (topic.Text) {
            searchText += topic.Text + '\n';
          }
        });
      }

      return searchText || 'No results found';
    } catch (error) {
      console.error('DuckDuckGo search error:', error.message);
      return 'Search failed';
    }
  }

  /**
   * Get cached price or fetch new one
   */
  getCachedPrice(divisionalSecretariat) {
    const cached = this.cache.get(divisionalSecretariat);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      console.log(`Using cached price for ${divisionalSecretariat}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache for a location
   */
  setCachePrice(divisionalSecretariat, data) {
    this.cache.set(divisionalSecretariat, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Fetch land price per perch for a location
   */
  async fetchLandPricePerPerch(divisionalSecretariat) {
    try {
      // Check cache first
      const cached = this.getCachedPrice(divisionalSecretariat);
      if (cached) {
        return cached;
      }

      console.log(`Fetching price for: ${divisionalSecretariat}`);

      // Step 1: Generate optimized search query using Gemini
      let searchQuery;
      try {
        searchQuery = await geminiService.generateSearchQuery(divisionalSecretariat);
        console.log('Generated search query:', searchQuery);
      } catch (error) {
        console.log('Gemini search query failed, using basic query');
        searchQuery = `land price per perch ${divisionalSecretariat} Sri Lanka`;
      }

      // Step 2: Try Google Search first, fallback to DuckDuckGo
      let searchResults;
      if (this.googleApiKey && this.googleCxId) {
        searchResults = await this.searchGoogle(searchQuery);
        // If Google fails or returns no results, try DuckDuckGo
        if (searchResults === 'Search failed' || searchResults === 'No results found' || searchResults === 'Search API not configured') {
          console.log('Google search failed, trying DuckDuckGo...');
          searchResults = await this.searchDuckDuckGo(searchQuery);
        }
      } else {
        console.log('Google API not configured, using DuckDuckGo');
        searchResults = await this.searchDuckDuckGo(searchQuery);
      }
      
      // Step 3: Use Gemini to extract prices from results
      let priceData;
      try {
        priceData = await geminiService.extractLandPrices(searchResults, divisionalSecretariat);
      } catch (error) {
        console.log('Gemini price extraction failed, using fallback');
        priceData = {
          prices: [],
          average: 0,
          currency: 'LKR',
          confidence: 'low',
          sources_count: 0
        };
      }
      
      // Step 4: If no prices found or average is 0, use fallback estimation
      if (priceData.prices.length === 0 || !priceData.average || priceData.average === 0) {
        console.log('No valid prices found, using fallback estimation');
        priceData.average = this.getFallbackPrice(divisionalSecretariat);
        priceData.confidence = 'estimated';
        priceData.sources_count = 0;
      }

      const result = {
        pricePerPerch: priceData.average || 0,
        currency: 'LKR',
        confidence: priceData.confidence,
        sourcesCount: priceData.sources_count,
        priceRange: priceData.prices.length > 0 ? {
          min: Math.min(...priceData.prices),
          max: Math.max(...priceData.prices)
        } : null,
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.setCachePrice(divisionalSecretariat, result);

      return result;
    } catch (error) {
      console.error(`Error fetching price for ${divisionalSecretariat}:`, error.message);
      
      // Return fallback estimation
      return {
        pricePerPerch: this.getFallbackPrice(divisionalSecretariat),
        currency: 'LKR',
        confidence: 'estimated',
        sourcesCount: 0,
        priceRange: null,
        lastUpdated: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Fallback price estimation based on common Sri Lankan location patterns
   */
  getFallbackPrice(location) {
    const locationLower = location.toLowerCase();
    
    // Major city areas (Colombo, Gampaha, Kandy) - higher prices
    if (locationLower.includes('colombo') || locationLower.includes('dehiwala') || 
        locationLower.includes('nugegoda') || locationLower.includes('maharagama')) {
      return 150000; // 150,000 LKR per perch
    }
    
    // Suburban areas
    if (locationLower.includes('gampaha') || locationLower.includes('kaduwela') || 
        locationLower.includes('homagama') || locationLower.includes('kelaniya')) {
      return 100000; // 100,000 LKR per perch
    }
    
    // Kandy and other major cities
    if (locationLower.includes('kandy') || locationLower.includes('galle') || 
        locationLower.includes('matara') || locationLower.includes('kurunegala')) {
      return 75000; // 75,000 LKR per perch
    }
    
    // Anuradhapura, Polonnaruwa region - agricultural/historical areas
    if (locationLower.includes('anuradhapura') || locationLower.includes('polonnaruwa') ||
        locationLower.includes('hingurakgoda') || locationLower.includes('medirigiriya') ||
        locationLower.includes('thambuttegama')) {
      return 60000; // 60,000 LKR per perch
    }
    
    // Rural/Other areas
    return 50000; // 50,000 LKR per perch (conservative estimate)
  }

  /**
   * Convert various extent formats to perches
   */
  convertToPerches(extentString) {
    if (!extentString) return 0;

    try {
      // Remove commas and extra spaces
      const cleaned = extentString.toString().replace(/,/g, '').trim();

      // Check if it contains keywords (acres, roods, perches, a, r, p) or separators (-, spaces between numbers)
      const hasKeywords = /acres?|roods?|perches?|[arp](?:\s|$)/i.test(cleaned);
      const hasMultipleNumbers = /\d+[\s-]+\d+/.test(cleaned); // At least 2 numbers separated by space or hyphen
      
      // Only try acres-roods-perches pattern if there are keywords OR multiple numbers with separators
      if (hasKeywords || hasMultipleNumbers) {
        // Pattern: "X acres Y roods Z perches" or "X-Y-Z"
        const acresPattern = /(\d+(?:\.\d+)?)\s*(?:acres?|a)?[\s-]+(\d+(?:\.\d+)?)\s*(?:roods?|r)?[\s-]*(\d+(?:\.\d+)?)\s*(?:perches?|p)?/i;
        const match = cleaned.match(acresPattern);

        if (match) {
          const acres = parseFloat(match[1]) || 0;
          const roods = parseFloat(match[2]) || 0;
          const perches = parseFloat(match[3]) || 0;
          
          // 1 acre = 4 roods = 160 perches
          // 1 rood = 40 perches
          return (acres * 160) + (roods * 40) + perches;
        }
      }

      // Default: Parse as just a number (assume perches)
      // This handles cases like "90", "90.00", "150", "1.5"
      const numValue = parseFloat(cleaned);
      if (!isNaN(numValue)) {
        return numValue;
      }

      return 0;
    } catch (error) {
      console.error('Error converting extent:', error);
      return 0;
    }
  }

  /**
   * Calculate valuation for all plans in a project
   */
  async calculateProjectValuation(plans) {
    try {
      // Check for plans with missing extent data (check all extent fields)
      const warnings = [];
      const plansWithMissingData = plans.filter(p => 
        !p.total_extent && !p.current_extent_value && !p.estimated_extent
      );
      
      if (plansWithMissingData.length > 0) {
        warnings.push({
          type: 'missing_extent',
          message: `${plansWithMissingData.length} plan(s) missing extent data`,
          plans: plansWithMissingData.map(p => ({
            id: p.id,
            identifier: p.plan_identifier,
            description: p.description
          }))
        });
        console.warn(`⚠️  ${plansWithMissingData.length} plans have missing extent data`);
      }
      
      // Check for plans using fallback extent fields
      const plansUsingFallback = plans.filter(p => 
        !p.total_extent && (p.current_extent_value || p.estimated_extent)
      );
      
      if (plansUsingFallback.length > 0) {
        console.log(`ℹ️  ${plansUsingFallback.length} plans using fallback extent fields (current_extent_value or estimated_extent)`);
      }
      
      // Group plans by divisional secretariat
      const locationGroups = {};
      plans.forEach(plan => {
        const location = plan.divisional_secretary || 'Unknown';
        if (!locationGroups[location]) {
          locationGroups[location] = [];
        }
        locationGroups[location].push(plan);
      });

      // Fetch prices for each unique location
      const locationPrices = {};
      for (const location of Object.keys(locationGroups)) {
        if (location !== 'Unknown') {
          locationPrices[location] = await this.fetchLandPricePerPerch(location);
        }
      }

      // Calculate valuation for each plan
      const valuatedPlans = plans.map(plan => {
        const location = plan.divisional_secretary || 'Unknown';
        let priceData = locationPrices[location];
        
        // If no price data or price is 0, use fallback
        if (!priceData || !priceData.pricePerPerch || priceData.pricePerPerch === 0) {
          priceData = {
            pricePerPerch: this.getFallbackPrice(location),
            confidence: 'estimated',
            currency: 'LKR'
          };
        }

        // Get extent - use fallback fields if total_extent is null
        let extentValue = plan.total_extent;
        let extentSource = 'total_extent';
        
        if (!extentValue && plan.current_extent_value) {
          extentValue = plan.current_extent_value;
          extentSource = 'current_extent_value';
        } else if (!extentValue && plan.estimated_extent) {
          extentValue = plan.estimated_extent;
          extentSource = 'estimated_extent';
        }

        const extentInPerches = this.convertToPerches(extentValue);
        const estimatedValue = extentInPerches * priceData.pricePerPerch;
        
        // Track if extent is missing
        const hasMissingExtent = !extentValue || extentInPerches === 0;

        return {
          planId: plan.id,
          plan_identifier: plan.plan_identifier,
          description: plan.description,
          divisional_secretary: location,
          extent: extentValue,
          extentSource: extentSource,  // Track which field was used
          extentInPerches: extentInPerches,
          pricePerPerch: priceData.pricePerPerch,
          estimatedValue: Math.round(estimatedValue),
          confidence: priceData.confidence,
          priceRange: priceData.priceRange,
          lastUpdated: priceData.lastUpdated,
          createdDate: plan.created_at,
          warning: hasMissingExtent ? 'Missing extent data - value calculated as 0' : null
        };
      });

      // Calculate totals
      const totalValue = valuatedPlans.reduce((sum, plan) => sum + plan.estimatedValue, 0);
      const totalExtentPerches = valuatedPlans.reduce((sum, plan) => sum + plan.extentInPerches, 0);
      const plansWithData = valuatedPlans.filter(p => p.extentInPerches > 0).length;

      return {
        plans: valuatedPlans,
        totalValue: Math.round(totalValue),
        totalExtentPerches: Math.round(totalExtentPerches),
        averagePricePerPerch: totalExtentPerches > 0 ? Math.round(totalValue / totalExtentPerches) : 0,
        locations: Object.keys(locationPrices).length,
        warnings: warnings,
        plansWithData: plansWithData,
        plansTotal: plans.length,
        locationBreakdown: Object.entries(locationPrices).map(([location, data]) => ({
          location,
          pricePerPerch: data.pricePerPerch,
          confidence: data.confidence,
          plansCount: locationGroups[location].length
        })),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating project valuation:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for admin operations)
   */
  clearCache() {
    this.cache.clear();
    console.log('Land valuation cache cleared');
  }
}

module.exports = new LandValuationService();
