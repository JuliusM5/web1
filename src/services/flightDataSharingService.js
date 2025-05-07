// src/services/flightDataSharingService.js

// Mock implementation for testing
const flightDataSharingService = {
    // Mock flight data cache
    flightDataCache: {},
    
    // Mock user signals
    userSignals: {},
    
    // Get flight data
    async getFlightData(originCode, destinationCode, originId, destinationId, skyscannerService) {
      // Create a unique route key
      const routeKey = `${originCode}-${destinationCode}`;
      
      // Check cache first
      if (this.flightDataCache[routeKey] && 
          Date.now() - this.flightDataCache[routeKey].timestamp < 3600000) { // 1 hour cache
        return this.flightDataCache[routeKey].data;
      }
      
      try {
        // For testing, return mock data
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
        
        // Cache the data
        this.flightDataCache[routeKey] = {
          data: mockData,
          timestamp: Date.now()
        };
        
        return mockData;
      } catch (error) {
        console.error(`Error fetching flight data for ${routeKey}:`, error);
        throw error;
      }
    },
    
    // Check if user has free signals remaining
    getRemainingFreeSignals(userId) {
      if (!userId) return 0;
      
      try {
        // Get from localStorage for persistence
        const userSignalsData = localStorage.getItem(`user_signals_${userId}`);
        if (!userSignalsData) return 3; // No signals used yet
        
        const signalData = JSON.parse(userSignalsData);
        return Math.max(0, 3 - signalData.count);
      } catch (error) {
        console.error('Error getting remaining signals:', error);
        return 0;
      }
    },
    
    // Record when a user uses a free signal
    recordFreeSignalUsage(userId) {
      if (!userId) return 3; // Max usage
      
      try {
        // Get current signal usage
        const userSignalsData = localStorage.getItem(`user_signals_${userId}`);
        const signalData = userSignalsData ? 
          JSON.parse(userSignalsData) : 
          { count: 0, firstUsed: Date.now() };
        
        // Increment count
        signalData.count++;
        signalData.lastUsed = Date.now();
        
        // Save back to localStorage
        localStorage.setItem(`user_signals_${userId}`, JSON.stringify(signalData));
        
        // Return the new count
        return signalData.count;
      } catch (error) {
        console.error('Error recording signal usage:', error);
        return 3; // Assume max usage on error
      }
    }
  };
  
  export default flightDataSharingService;