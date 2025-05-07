// src/services/efficientDealService.js

import skyscannerService from './skyscannerService';
import { storageKeys } from '../constants/storageKeys';

class EfficientDealService {
  constructor() {
    // Initialize with an empty locations cache
    this.locationsCache = {};
    
    // Load any previously cached locations from localStorage
    this.loadCachedLocations();
    
    // Track recently searched routes
    this.recentSearches = new Set();
    this.recentSearchesMaxSize = 100;
    
    // Load saved deals
    this.savedDeals = this.loadSavedDeals();
  }
  
  loadCachedLocations() {
    try {
      const cached = localStorage.getItem(storageKeys.LOCATIONS_CACHE);
      if (cached) {
        this.locationsCache = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached locations:', error);
      this.locationsCache = {};
    }
  }
  
  saveCachedLocations() {
    try {
      localStorage.setItem(storageKeys.LOCATIONS_CACHE, JSON.stringify(this.locationsCache));
    } catch (error) {
      console.error('Error saving cached locations:', error);
    }
  }
  
  loadSavedDeals() {
    try {
      const saved = localStorage.getItem(storageKeys.SAVED_DEALS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved deals:', error);
      return [];
    }
  }
  
  saveDeal(deal) {
    try {
      const deals = this.loadSavedDeals();
      const isDuplicate = deals.some(d => 
        d.origin === deal.origin && 
        d.destination === deal.destination &&
        d.price === deal.price
      );
      
      if (!isDuplicate) {
        deals.push({
          ...deal,
          savedAt: new Date().toISOString()
        });
        this.savedDeals = deals;
        localStorage.setItem(storageKeys.SAVED_DEALS, JSON.stringify(deals));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving deal:', error);
      return false;
    }
  }
  
  removeSavedDeal(dealId) {
    try {
      const deals = this.loadSavedDeals();
      const filteredDeals = deals.filter(deal => deal.id !== dealId);
      this.savedDeals = filteredDeals;
      localStorage.setItem(storageKeys.SAVED_DEALS, JSON.stringify(filteredDeals));
      return true;
    } catch (error) {
      console.error('Error removing deal:', error);
      return false;
    }
  }
  
  getSavedDeals() {
    return this.savedDeals;
  }
  
  // Global airport search - allows searching ANY airport
  async searchAirports(query) {
    try {
      // Check cache first
      const cacheKey = `airport-search-${query.toLowerCase()}`;
      const cachedResults = localStorage.getItem(cacheKey);
      
      if (cachedResults) {
        return JSON.parse(cachedResults);
      }
      
      // Not in cache, search via API
      const results = await skyscannerService.locationAutocomplete(query);
      
      if (results && results.places) {
        // Process and format results
        const airports = results.places.map(place => ({
          code: place.iata || place.entityId,
          id: place.entityId || place.id,
          name: place.name,
          city: place.cityName || place.name,
          country: place.countryName,
          type: place.type // e.g., 'CITY', 'AIRPORT'
        }));
        
        // Cache results for future use
        localStorage.setItem(cacheKey, JSON.stringify(airports));
        
        return airports;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching airports:', error);
      return [];
    }
  }
  
  // Search for flights between ANY two airports
  async searchFlights(originCode, originId, destinationCode, destinationId, date = null) {
    // Generate a unique search key
    const searchKey = `${originCode}-${destinationCode}-${date || 'any'}`;
    
    try {
      // Search for one-way flights
      const flightData = await skyscannerService.searchOneWayFlights(
        originCode, 
        destinationCode, 
        originId, 
        destinationId,
        date
      );
      
      return this.processFlightData(
        flightData, 
        originCode, 
        destinationCode, 
        originCode, // Use codes as names if actual names not available
        destinationCode
      );
    } catch (error) {
      console.error(`Error searching flights for ${searchKey}:`, error);
      return null;
    }
  }
  
  // Process flight data (same as before)
  processFlightData(data, originCode, destCode, originName, destName) {
    if (!data || !data.itineraries || data.itineraries.length === 0) {
      return null;
    }
    
    // Find the best (lowest price) deal
    const bestDeal = data.itineraries.reduce((best, current) => {
      const currentPrice = this.extractPrice(current);
      const bestPrice = best ? this.extractPrice(best) : Infinity;
      
      return currentPrice < bestPrice ? current : best;
    }, null);
    
    if (!bestDeal) return null;
    
    const price = this.extractPrice(bestDeal);
    const departureTime = this.extractDepartureTime(bestDeal);
    const arrivalTime = this.extractArrivalTime(bestDeal);
    const duration = this.extractDuration(bestDeal);
    const airline = this.extractAirline(bestDeal);
    
    return {
      id: `${originCode}-${destCode}-${Date.now()}`,
      origin: originCode,
      originName,
      destination: destCode,
      destinationName: destName,
      price,
      departureTime,
      arrivalTime,
      duration,
      airline,
      deep_link: this.createDeepLink(originCode, destCode, departureTime)
    };
  }
  
  // Extract methods remain the same
  extractPrice(itinerary) {
    try {
      return itinerary.price ? itinerary.price.amount || 0 : 0;
    } catch (error) {
      console.error('Error extracting price:', error);
      return 0;
    }
  }
  
  extractDepartureTime(itinerary) {
    try {
      return itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].departure || new Date().toISOString() : 
        new Date().toISOString();
    } catch (error) {
      console.error('Error extracting departure time:', error);
      return new Date().toISOString();
    }
  }
  
  extractArrivalTime(itinerary) {
    try {
      return itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].arrival || new Date().toISOString() : 
        new Date().toISOString();
    } catch (error) {
      console.error('Error extracting arrival time:', error);
      return new Date().toISOString();
    }
  }
  
  extractDuration(itinerary) {
    try {
      return itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].durationInMinutes || 0 : 
        0;
    } catch (error) {
      console.error('Error extracting duration:', error);
      return 0;
    }
  }
  
  extractAirline(itinerary) {
    try {
      return itinerary.legs && itinerary.legs[0] && itinerary.legs[0].carriers ? 
        itinerary.legs[0].carriers.marketing[0].name || 'Unknown Airline' : 
        'Unknown Airline';
    } catch (error) {
      console.error('Error extracting airline:', error);
      return 'Unknown Airline';
    }
  }
  
  createDeepLink(origin, destination, departureDate) {
    const formattedDate = new Date(departureDate).toISOString().split('T')[0];
    return `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${formattedDate}/`;
  }
}

export default new EfficientDealService();