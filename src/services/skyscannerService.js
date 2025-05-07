// src/services/skyscannerService.js

// Mock implementation for testing without real API
const skyscannerService = {
  // Mock cache
  cache: new Map(),
  
  // Search for one-way flights
  async searchOneWayFlights(origin, destination, originId, destinationId, date = null) {
    const cacheKey = `oneway-${origin}-${destination}-${date || 'any'}`;
    
    // Check cache
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Mock API response
    const mockData = {
      itineraries: [
        {
          price: { amount: 299.99 },
          legs: [{
            departure: new Date().toISOString(),
            arrival: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
            durationInMinutes: 120,
            carriers: {
              marketing: [{ name: 'Example Airlines' }]
            }
          }]
        },
        {
          price: { amount: 349.99 },
          legs: [{
            departure: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            arrival: new Date(Date.now() + 10800000).toISOString(), // 3 hours later
            durationInMinutes: 120,
            carriers: {
              marketing: [{ name: 'Budget Air' }]
            }
          }]
        },
        {
          price: { amount: 199.99 },
          legs: [{
            departure: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
            arrival: new Date(Date.now() + 14400000).toISOString(), // 4 hours later
            durationInMinutes: 120,
            carriers: {
              marketing: [{ name: 'Discount Flights' }]
            }
          }]
        }
      ]
    };
    
    // Add to cache
    this.addToCache(cacheKey, mockData);
    
    return mockData;
  },
  
  // Location autocomplete
  async locationAutocomplete(query) {
    const cacheKey = `location-${query.toLowerCase()}`;
    
    // Check cache
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Mock results
    const mockResults = {
      places: [
        {
          id: '123',
          entityId: 'LHR-sky',
          name: 'London Heathrow',
          code: 'LHR',
          iata: 'LHR',
          cityName: 'London',
          countryName: 'United Kingdom',
          type: 'AIRPORT'
        },
        {
          id: '456',
          entityId: 'LON-sky',
          name: 'London',
          code: 'LON',
          cityName: 'London',
          countryName: 'United Kingdom',
          type: 'CITY'
        },
        {
          id: '789',
          entityId: 'LGW-sky',
          name: 'London Gatwick',
          code: 'LGW',
          iata: 'LGW',
          cityName: 'London',
          countryName: 'United Kingdom',
          type: 'AIRPORT'
        }
      ]
    };
    
    // Add to cache
    this.addToCache(cacheKey, mockResults);
    
    return mockResults;
  },
  
  // Cache functions
  getFromCache(key) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key);
      // Check if cache is valid (1 hour)
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
      this.cache.delete(key);
    }
    return null;
  },
  
  addToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
};

export default skyscannerService;