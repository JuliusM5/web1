// src/services/flightDataSharingService.js

/**
 * Service for efficiently sharing flight data across users
 */
class FlightDataSharingService {
  constructor() {
    this.cache = new Map();
    this.signalUsage = new Map();
    
    // Try to load signal usage from localStorage
    try {
      const storedUsage = localStorage.getItem('flight_signal_usage');
      if (storedUsage) {
        this.signalUsage = new Map(JSON.parse(storedUsage));
      }
    } catch (error) {
      console.error('Error loading signal usage:', error);
    }
  }
  
  /**
   * Get flight data, using cache when possible
   */
  async getFlightData(originCode, destinationCode, originId, destinationId, flightService) {
    // Create cache key
    const cacheKey = `${originCode}-${destinationCode}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // If not in cache, fetch from service
    const flightData = await flightService.searchFlights(originId, destinationId);
    
    // Store in cache
    this.cache.set(cacheKey, {
      data: flightData,
      timestamp: Date.now()
    });
    
    return flightData;
  }
  
  /**
   * Check if cached data is still valid (less than 6 hours old)
   */
  isCacheValid(timestamp) {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    return (Date.now() - timestamp) < SIX_HOURS;
  }
  
  /**
   * Record signal usage for a user
   */
  recordSignalUsage(userId) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthKey = `${year}-${month}`;
    
    // Get user's signals
    const userKey = `user_${userId}`;
    const userSignals = this.signalUsage.get(userKey) || {};
    
    // Update or set the count for current month
    userSignals[monthKey] = (userSignals[monthKey] || 0) + 1;
    
    // Save back to the map
    this.signalUsage.set(userKey, userSignals);
    
    // Persist to localStorage
    this.saveSignalUsage();
    
    return userSignals[monthKey];
  }
  
  /**
   * Get the number of signals used this month
   */
  getUsedSignalCount(userId) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthKey = `${year}-${month}`;
    
    const userKey = `user_${userId}`;
    const userSignals = this.signalUsage.get(userKey) || {};
    
    return userSignals[monthKey] || 0;
  }
  
  /**
   * Get the number of remaining free signals
   */
  getRemainingFreeSignals(userId) {
    const usedCount = this.getUsedSignalCount(userId);
    return Math.max(0, 3 - usedCount);
  }
  
  /**
   * Save signal usage to localStorage
   */
  saveSignalUsage() {
    try {
      localStorage.setItem('flight_signal_usage', 
        JSON.stringify(Array.from(this.signalUsage.entries())));
    } catch (error) {
      console.error('Error saving signal usage:', error);
    }
  }
  
  /**
   * Reset signal usage (for testing)
   */
  resetSignalUsage(userId) {
    if (userId) {
      // Reset for a specific user
      const userKey = `user_${userId}`;
      this.signalUsage.delete(userKey);
    } else {
      // Reset for all users
      this.signalUsage.clear();
    }
    
    this.saveSignalUsage();
  }
}

export default new FlightDataSharingService();