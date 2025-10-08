const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.model = null;
    
    if (this.genAI) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      } catch (error) {
        console.error('Error initializing Gemini model:', error.message);
      }
    }
  }

  /**
   * Generate a search query for land prices based on location
   */
  async generateSearchQuery(divisionalSecretariat, district = 'Sri Lanka') {
    const prompt = `Generate a concise Google search query to find current land prices per perch in ${divisionalSecretariat}, ${district}. 
    The query should target real estate websites, property listings, and land sale advertisements in Sri Lanka.
    Return ONLY the search query, nothing else. Maximum 10 words.`;

    try {
      const response = await this.callGemini(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error generating search query:', error.message);
      // Fallback to basic query
      return `land price per perch ${divisionalSecretariat} Sri Lanka`;
    }
  }

  /**
   * Extract prices using regex (fallback when Gemini unavailable)
   */
  extractPricesWithRegex(text) {
    const prices = [];
    let match;
    
    // Pattern 1: "Rs. 50,000 per perch" or "*Rs 1,750,000 * per perch"
    const pattern1 = /(?:\*\s*)?(?:Rs\.?|LKR)\s*([\d,]+(?:\.\d+)?)\s*(?:\*\s*)?(?:per\s*perch)/gi;
    while ((match = pattern1.exec(text)) !== null) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (price > 1000 && price < 10000000) { // Sanity check: 1K to 10M LKR
        prices.push(price);
        console.log(`  Found: Rs ${price.toLocaleString()} per perch`);
      }
    }
    
    // Pattern 2: "perch now worth around 30 lakhs" or "goes for about 30 lakhs"
    const pattern2 = /perch\s+(?:now\s+)?(?:worth|goes|price|costs?|valued?)\s+(?:around|about|approximately|at)?\s*([\d.]+)\s*(?:lakhs?|lacs?)/gi;
    while ((match = pattern2.exec(text)) !== null) {
      const lakhs = parseFloat(match[1]);
      const price = lakhs * 100000; // Convert lakhs to rupees
      if (price > 1000 && price < 10000000) {
        prices.push(price);
        console.log(`  Found: ${lakhs} lakhs (${price.toLocaleString()} LKR) per perch`);
      }
    }
    
    // Pattern 3: "([\d.]+) lakhs per perch" or "5 lakh per perch"
    const pattern3 = /([\d.]+)\s*(?:lakhs?|lacs?)\s+per\s*perch/gi;
    while ((match = pattern3.exec(text)) !== null) {
      const lakhs = parseFloat(match[1]);
      const price = lakhs * 100000;
      if (price > 1000 && price < 10000000) {
        prices.push(price);
        console.log(`  Found: ${lakhs} lakhs per perch (${price.toLocaleString()} LKR)`);
      }
    }
    
    // Pattern 4: "Per perche 375000/" (without Rs or lakhs)
    const pattern4 = /per\s*perch[e]?\s*([\d,]+)\s*[\/]?/gi;
    while ((match = pattern4.exec(text)) !== null) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      // Only accept if it's a reasonable price (> 10K to avoid false positives like "12 perch")
      if (price > 10000 && price < 10000000) {
        prices.push(price);
        console.log(`  Found: ${price.toLocaleString()} LKR per perch`);
      }
    }
    
    return prices;
  }

  /**
   * Extract land prices from search results text
   */
  async extractLandPrices(searchResultsText, divisionalSecretariat) {
    // First, try regex extraction (doesn't use API quota)
    const regexPrices = this.extractPricesWithRegex(searchResultsText);
    
    if (regexPrices.length > 0) {
      console.log(`Found ${regexPrices.length} prices using regex extraction`);
      const average = regexPrices.reduce((a, b) => a + b, 0) / regexPrices.length;
      return {
        prices: regexPrices,
        average: Math.round(average),
        currency: 'LKR',
        confidence: regexPrices.length >= 3 ? 'medium' : 'low',
        sources_count: regexPrices.length
      };
    }
    
    // If regex finds nothing, try Gemini (if quota available)
    const prompt = `Analyze the following search results about land prices in ${divisionalSecretariat}, Sri Lanka.
    Extract ALL mentioned land prices per perch in Sri Lankan Rupees (LKR).
    
    Search Results:
    ${searchResultsText}
    
    Return your response in this EXACT JSON format (no markdown, no extra text):
    {
      "prices": [list of numbers only, e.g., [50000, 75000, 100000]],
      "average": calculated average as number,
      "currency": "LKR",
      "confidence": "high/medium/low",
      "sources_count": number of different sources found
    }
    
    Rules:
    - Only extract prices explicitly stated as "per perch"
    - Convert lakhs to full numbers (e.g., "5 lakhs" = 500000)
    - Ignore monthly rental prices
    - If no prices found, return empty prices array
    - Be conservative with confidence rating`;

    try {
      const response = await this.callGemini(prompt);
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Error extracting land prices with Gemini:', error.message);
      // Return empty result to trigger fallback pricing
      return {
        prices: [],
        average: 0,
        currency: 'LKR',
        confidence: 'low',
        sources_count: 0
      };
    }
  }

  /**
   * Analyze and provide insights on land valuation
   */
  async generateValuationInsights(projectData, valuationResults) {
    // Check if API key exists
    if (!this.apiKey) {
      console.error('Gemini API key not configured');
      return 'AI insights unavailable: API key not configured.';
    }

    const prompt = `As a land valuation expert in Sri Lanka, provide brief insights for this project:
    
    Project: ${projectData.projectName}
    Total Plans: ${valuationResults.plans.length}
    Total Estimated Value: LKR ${valuationResults.totalValue.toLocaleString()}
    
    Plans breakdown:
    ${valuationResults.plans.map(p => `- ${p.plan_identifier}: ${p.extent} (${p.divisional_secretary}) = LKR ${p.estimatedValue.toLocaleString()}`).join('\n')}
    
    Provide 3-5 brief bullet points (max 50 words each) about:
    1. Value reasonableness
    2. Location factors
    3. Market trends consideration
    4. Risk factors
    5. Recommendations
    
    Keep it concise and practical.`;

    try {
      console.log('Generating AI insights...');
      const response = await this.callGemini(prompt);
      console.log('AI insights generated successfully');
      return response;
    } catch (error) {
      console.error('Error generating insights:', error.message);
      console.error('Error details:', error.response?.data || error);
      return 'Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.';
    }
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    if (!this.model) {
      throw new Error('Gemini model not initialized. Check API key.');
    }

    try {
      console.log('Calling Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API response received');
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw error;
    }
  }
}

module.exports = new GeminiService();
