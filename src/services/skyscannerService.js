// src/services/skyscannerService.js

/**
 * Service for integrating with Skyscanner API via RapidAPI
 */
class SkyscannerService {
  constructor() {
    this.apiKey = process.env.REACT_APP_RAPIDAPI_KEY || '';
    this.baseUrl = 'https://skyscanner-api.p.rapidapi.com';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Common headers for RapidAPI requests
   */
  getHeaders() {
    return {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Caching mechanism
   */
  getFromCache(key) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key);
      if (Date.now() - timestamp < this.cacheExpiry) {
        return data;
      }
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  addToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Search for airports and locations by query string
   */
  async locationAutocomplete(query) {
    const cacheKey = `location-${query.toLowerCase()}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/locations/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      this.addToCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in locationAutocomplete:', error);
      // Return minimal fallback data structure
      return { places: [] };
    }
  }

  /**
   * Search for one-way flights
   */
  async searchOneWayFlights(origin, destination, originId, destinationId, date = null) {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : this.getDefaultDepartureDate();
    const cacheKey = `oneway-${origin}-${destination}-${formattedDate}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      // Create the session first
      const sessionResponse = await fetch(`${this.baseUrl}/flights/search/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: {
            market: 'LT',
            locale: 'en-US',
            currency: 'EUR',
            queryLegs: [
              {
                originPlaceId: { iata: origin },
                destinationPlaceId: { iata: destination },
                date: {
                  year: parseInt(formattedDate.split('-')[0]),
                  month: parseInt(formattedDate.split('-')[1]),
                  day: parseInt(formattedDate.split('-')[2])
                }
              }
            ],
            adults: 1,
            childrenAges: [],
            cabinClass: 'CABIN_CLASS_ECONOMY'
          }
        })
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`API error: ${sessionResponse.status}`);
      }
      
      const sessionData = await sessionResponse.json();
      const sessionToken = sessionData.sessionToken;
      
      // Poll for results
      const results = await this.pollResults(sessionToken);
      
      if (results) {
        this.addToCache(cacheKey, results);
      }
      
      return results;
    } catch (error) {
      console.error('Error in searchOneWayFlights:', error);
      // Return minimal fallback data structure
      return {
        itineraries: [],
        legs: [],
        segments: [],
        places: [],
        carriers: [],
        agents: []
      };
    }
  }

  /**
   * Poll for results after creating a search session
   */
  async pollResults(sessionToken, maxAttempts = 5) {
    let attempts = 0;
    let results = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const pollResponse = await fetch(`${this.baseUrl}/flights/search/poll/${sessionToken}`, {
          method: 'POST',
          headers: this.getHeaders()
        });
        
        if (!pollResponse.ok) {
          throw new Error(`API error: ${pollResponse.status}`);
        }
        
        const data = await pollResponse.json();
        
        if (data.status === 'RESULT_STATUS_COMPLETE' || 
            data.status === 'RESULT_STATUS_INCOMPLETE' && data.content && data.content.results) {
          return data.content;
        }
        
        // If not ready, wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error polling results (attempt ${attempts}):`, error);
        // Wait longer between retries if there's an error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  /**
   * Get cheap flights for a given origin
   */
  async getCheapFlights(origin, options = {}) {
    const cacheKey = `cheapflights-${origin}-${JSON.stringify(options)}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      const departureDate = this.getDefaultDepartureDate();
      const returnDate = this.getDefaultReturnDate(departureDate);
      
      // Create the session for "anywhere" search
      const sessionResponse = await fetch(`${this.baseUrl}/flights/search/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: {
            market: options.market || 'LT',
            locale: options.locale || 'en-US',
            currency: options.currency || 'EUR',
            queryLegs: [
              {
                originPlaceId: { iata: origin },
                destinationPlaceId: { anywhere: true },
                date: {
                  year: parseInt(departureDate.split('-')[0]),
                  month: parseInt(departureDate.split('-')[1]),
                  day: parseInt(departureDate.split('-')[2])
                }
              }
            ],
            adults: options.adults || 1,
            childrenAges: [],
            cabinClass: options.cabinClass || 'CABIN_CLASS_ECONOMY'
          }
        })
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`API error: ${sessionResponse.status}`);
      }
      
      const sessionData = await sessionResponse.json();
      const sessionToken = sessionData.sessionToken;
      
      // Poll for results
      const results = await this.pollResults(sessionToken);
      
      if (!results || !results.itineraries || !results.itineraries.results) {
        return [];
      }
      
      // Transform the data into a simpler format
      const cheapFlights = this.transformCheapFlightsResults(results, origin);
      
      if (cheapFlights.length > 0) {
        this.addToCache(cacheKey, cheapFlights);
      }
      
      return cheapFlights;
    } catch (error) {
      console.error('Error in getCheapFlights:', error);
      return [];
    }
  }

  /**
   * Transform raw API results into a simpler format for cheap flights
   */
  transformCheapFlightsResults(results, origin) {
    const { itineraries, legs, places, carriers } = results;
    
    if (!itineraries || !itineraries.results || !legs || !places) {
      return [];
    }
    
    return itineraries.results.map(itinerary => {
      const leg = legs.find(l => l.id === itinerary.legIds[0]);
      if (!leg) return null;
      
      const destinationPlace = places.find(p => p.entityId === leg.destinationPlaceId);
      if (!destinationPlace) return null;
      
      const carrierInfo = leg.carriers && leg.carriers.marketing && leg.carriers.marketing[0];
      const carrier = carrierInfo ? carriers.find(c => c.id === carrierInfo.id) : null;
      
      const cheapestPrice = itinerary.pricingOptions && itinerary.pricingOptions.length > 0
        ? itinerary.pricingOptions.reduce((min, option) => 
            option.price.amount < min ? option.price.amount : min, 
            itinerary.pricingOptions[0].price.amount)
        : 0;
      
      return {
        from: origin,
        to: destinationPlace.iata || destinationPlace.id,
        destinationName: destinationPlace.name,
        country: destinationPlace.parentId ? places.find(p => p.entityId === destinationPlace.parentId)?.name : '',
        price: cheapestPrice,
        currency: itinerary.pricingOptions?.[0]?.price?.unit || 'EUR',
        departure: leg.departureDateTime ? 
          `${leg.departureDateTime.year}-${String(leg.departureDateTime.month).padStart(2, '0')}-${String(leg.departureDateTime.day).padStart(2, '0')}` : 
          '',
        return: '',
        airline: carrier ? carrier.name : 'Multiple Airlines',
        duration: leg.durationInMinutes || 0,
        direct: leg.stopCount === 0,
        deep_link: itinerary.deepLink || ''
      };
    }).filter(Boolean);
  }

  /**
   * Get default departure date (2 weeks from now)
   */
  getDefaultDepartureDate() {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default return date (1 week after departure)
   */
  getDefaultReturnDate(departureDate) {
    const date = new Date(departureDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }
}

export default new SkyscannerService();