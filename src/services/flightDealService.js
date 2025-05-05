// src/services/flightDealService.js

import skyscannerService from './skyscannerService';

/**
 * This service provides an efficient layer between your application and the Skyscanner API
 * It implements intelligent caching, batch processing, and deal detection algorithms
 * to maximize value while minimizing API usage
 */
class FlightDealService {
  constructor() {
    this.cache = {
      airports: new Map(), // Cache airport data
      routes: new Map(),   // Cache route price history
      deals: new Map()     // Cache current deals
    };
    
    this.cacheExpiry = {
      airports: 30 * 24 * 60 * 60 * 1000, // 30 days
      routes: 12 * 60 * 60 * 1000,        // 12 hours
      deals: 1 * 60 * 60 * 1000           // 1 hour
    };
    
    // Queue for batching similar requests
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // Deal detection parameters
    this.dealThresholds = {
      minDiscountPercent: 20,     // Minimum % below average to qualify as a deal
      significantDrop: 35,        // % drop that's considered exceptional
      seasonalAdjustment: 15,     // % additional discount during off-season
      lastMinuteWindow: 7,        // Days before departure to consider "last minute"
      lastMinuteThreshold: 40     // % below average for last minute deals
    };
  }
  
  /**
   * Get airport information for a city with caching
   */
  async getAirportByCity(cityName) {
    const cacheKey = cityName.toLowerCase();
    
    // Check cache first
    if (this.cache.airports.has(cacheKey)) {
      const cachedData = this.cache.airports.get(cacheKey);
      
      // Check if cache is still valid
      if (cachedData.timestamp > Date.now() - this.cacheExpiry.airports) {
        return cachedData.data;
      }
    }
    
    // If not in cache or expired, fetch from API
    try {
      const airports = await skyscannerService.getAirportByCity(cityName);
      
      // Store in cache
      this.cache.airports.set(cacheKey, {
        data: airports,
        timestamp: Date.now()
      });
      
      return airports;
    } catch (error) {
      console.error('Error fetching airport data:', error);
      throw error;
    }
  }
  
  /**
   * Add a flight alert to the processing queue for batch processing
   */
  addAlertToQueue(alert) {
    this.requestQueue.push({
      type: 'alert',
      data: alert,
      timestamp: Date.now()
    });
    
    // Start processing the queue if not already running
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
    
    return {
      alertId: alert.id,
      status: 'queued',
      estimatedProcessingTime: this.estimateProcessingTime()
    };
  }
  
  /**
   * Process the request queue in batches to optimize API usage
   */
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    // Group similar requests to reduce API calls
    const batches = this.createBatches();
    
    for (const batch of batches) {
      try {
        await this.processBatch(batch);
      } catch (error) {
        console.error('Error processing batch:', error);
      }
    }
    
    this.isProcessingQueue = false;
    
    // Check if new items were added while processing
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
  
  /**
   * Group similar requests into batches for efficient processing
   */
  createBatches() {
    // This is a simple implementation - in a real system, you would
    // have more sophisticated batching logic based on origins/destinations
    
    const batches = [];
    const originMap = new Map();
    
    // Group requests by origin city
    for (const request of this.requestQueue) {
      const origin = request.data.origin.toLowerCase();
      
      if (!originMap.has(origin)) {
        originMap.set(origin, []);
      }
      
      originMap.get(origin).push(request);
    }
    
    // Create batches from the grouped requests
    for (const [origin, requests] of originMap) {
      batches.push({
        origin,
        requests,
        destinations: requests.map(req => req.data.destination)
      });
    }
    
    // Clear the queue
    this.requestQueue = [];
    
    return batches;
  }
  
  /**
   * Process a batch of similar requests
   */
  async processBatch(batch) {
    // Get airport code for the origin city
    const originAirports = await this.getAirportByCity(batch.origin);
    
    if (!originAirports || originAirports.length === 0) {
      throw new Error(`Could not find airport for ${batch.origin}`);
    }
    
    const originCode = originAirports[0].iata;
    
    // Make a single API call for all destinations from this origin
    const options = {
      // Default options - these would be adjusted based on the batch
      market: 'LT',
      locale: 'en-US',
      currency: 'EUR'
    };
    
    // Get flights from the Skyscanner API
    const flights = await skyscannerService.getCheapFlights(originCode, options);
    
    // Process the results for each request in the batch
    for (const request of batch.requests) {
      const alert = request.data;
      const destination = alert.destination;
      
      // Filter flights for this specific destination
      const matchingFlights = destination.toLowerCase() === 'anywhere' ?
        flights :
        flights.filter(flight => 
          flight.to.toLowerCase() === destination.toLowerCase()
        );
      
      // Process and store the matching flights
      await this.processAndStoreDeals(matchingFlights, alert);
    }
    
    // Update the route price history with this data
    this.updatePriceHistory(batch.origin, flights);
  }
  
  /**
   * Process flights to identify deals based on the alert criteria
   */
  async processAndStoreDeals(flights, alert) {
    const deals = [];
    
    for (const flight of flights) {
      // Check if this flight meets the criteria for the alert
      if (this.meetsCriteria(flight, alert)) {
        // Calculate if this is a "deal" based on historical data
        const dealScore = await this.calculateDealScore(flight);
        
        if (dealScore >= this.dealThresholds.minDiscountPercent) {
          deals.push({
            ...flight,
            dealScore,
            alertId: alert.id,
            expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours from now
          });
        }
      }
    }
    
    // Store the deals in the cache
    if (deals.length > 0) {
      this.cache.deals.set(alert.id, {
        data: deals,
        timestamp: Date.now()
      });
    }
    
    return deals;
  }
  
  /**
   * Check if a flight meets the criteria specified in an alert
   */
  meetsCriteria(flight, alert) {
    // Check destination
    if (alert.destination.toLowerCase() !== 'anywhere' && 
        flight.to.toLowerCase() !== alert.destination.toLowerCase()) {
      return false;
    }
    
    // Check price
    if (flight.price > alert.maxPrice) {
      return false;
    }
    
    // Check dates for specific date range
    if (alert.dateType === 'specific') {
      const departDate = new Date(flight.departure);
      const returnDate = new Date(flight.return);
      const alertStartDate = new Date(alert.startDate);
      const alertEndDate = new Date(alert.endDate);
      
      if (departDate < alertStartDate || returnDate > alertEndDate) {
        return false;
      }
    }
    
    // Check trip length for flexible dates
    if (alert.dateType === 'flexible') {
      const departDate = new Date(flight.departure);
      const returnDate = new Date(flight.return);
      const tripDuration = Math.round((returnDate - departDate) / (1000 * 60 * 60 * 24));
      
      if (tripDuration < alert.tripLength.min || tripDuration > alert.tripLength.max) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate a "deal score" for a flight based on historical data
   */
  async calculateDealScore(flight) {
    const routeKey = `${flight.from}-${flight.to}`;
    
    // Check if we have price history for this route
    if (!this.cache.routes.has(routeKey)) {
      // No history - assume a default discount
      return this.dealThresholds.minDiscountPercent;
    }
    
    const routeHistory = this.cache.routes.get(routeKey).data;
    
    // Calculate average price for this route
    const avgPrice = routeHistory.reduce((sum, item) => sum + item.price, 0) / routeHistory.length;
    
    // Calculate the discount percentage
    let discountPercent = Math.round(((avgPrice - flight.price) / avgPrice) * 100);
    
    // Apply seasonal adjustments if applicable
    const now = new Date();
    const departDate = new Date(flight.departure);
    const daysUntilDeparture = Math.round((departDate - now) / (1000 * 60 * 60 * 24));
    
    // Apply last-minute deal boost if applicable
    if (daysUntilDeparture <= this.dealThresholds.lastMinuteWindow) {
      discountPercent += 10; // Boost the score for last-minute deals
    }
    
    // Check if it's off-season (this would be more sophisticated in a real app)
    const month = departDate.getMonth();
    const isOffSeason = month >= 10 || month <= 2; // Winter months in Northern Hemisphere
    
    if (isOffSeason) {
      discountPercent -= 5; // Reduce the score for off-season (prices are already lower)
    }
    
    return Math.max(0, discountPercent);
  }
  
  /**
   * Update the price history for routes
   */
  updatePriceHistory(origin, flights) {
    for (const flight of flights) {
      const routeKey = `${origin}-${flight.to}`;
      
      if (!this.cache.routes.has(routeKey)) {
        this.cache.routes.set(routeKey, {
          data: [],
          timestamp: Date.now()
        });
      }
      
      const routeData = this.cache.routes.get(routeKey);
      
      // Add the new price data
      routeData.data.push({
        price: flight.price,
        date: flight.departure,
        timestamp: Date.now()
      });
      
      // Limit history to the last 50 entries
      if (routeData.data.length > 50) {
        routeData.data.shift();
      }
      
      // Update the timestamp
      routeData.timestamp = Date.now();
    }
  }
  
  /**
   * Get deals for a specific alert
   */
  getDealsForAlert(alertId) {
    if (!this.cache.deals.has(alertId)) {
      return [];
    }
    
    const cachedDeals = this.cache.deals.get(alertId);
    
    // Check if cache is still valid
    if (cachedDeals.timestamp > Date.now() - this.cacheExpiry.deals) {
      return cachedDeals.data;
    }
    
    // Cache expired but return stale data while we refresh in the background
    this.refreshDealsForAlert(alertId);
    return cachedDeals.data;
  }
  
  /**
   * Refresh deals for a specific alert in the background
   */
  async refreshDealsForAlert(alertId) {
    // This would trigger a re-processing of the alert
    // In a real implementation, you would load the alert details and requeue it
    
    console.log(`Refreshing deals for alert ${alertId}`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just update the timestamp
    if (this.cache.deals.has(alertId)) {
      const deals = this.cache.deals.get(alertId);
      deals.timestamp = Date.now();
    }
  }
  
  /**
   * Estimate processing time for a queued request
   */
  estimateProcessingTime() {
    // This would be based on queue length and current processing rate
    return this.requestQueue.length * 500; // Rough estimate in milliseconds
  }
  
  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    
    // Cleanup airports cache
    for (const [key, value] of this.cache.airports.entries()) {
      if (value.timestamp < now - this.cacheExpiry.airports) {
        this.cache.airports.delete(key);
      }
    }
    
    // Cleanup routes cache
    for (const [key, value] of this.cache.routes.entries()) {
      if (value.timestamp < now - this.cacheExpiry.routes) {
        this.cache.routes.delete(key);
      }
    }
    
    // Cleanup deals cache
    for (const [key, value] of this.cache.deals.entries()) {
      if (value.timestamp < now - this.cacheExpiry.deals) {
        this.cache.deals.delete(key);
      }
    }
  }
  
  /**
   * Setup automated cache cleanup
   */
  setupCacheCleanup() {
    setInterval(() => this.cleanupCache(), 30 * 60 * 1000); // Run every 30 minutes
  }
}

export default new FlightDealService();