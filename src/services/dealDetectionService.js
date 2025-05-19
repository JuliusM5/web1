
import skyscannerService from './skyscannerService';

/**
 * Service for detecting flight deals based on historical price data and market analysis
 */
class DealDetectionService {
  constructor() {
    this.priceDb = new Map(); // In-memory storage for price history
    this.dealThresholds = {
      minDiscount: 20,           // Minimum % below average to be considered a deal
      significantDiscount: 30,   // % below average to be considered a significant deal
      lastMinuteThreshold: 7,    // Days before departure to be considered last-minute
      lastMinuteDiscount: 40,    // % below average for last-minute deals
      priceHistoryMinEntries: 3  // Minimum number of price points to establish a baseline
    };
    
    // Try to load price history from localStorage
    this.loadPriceHistory();
  }
  
  /**
   * Load price history from localStorage
   */
  loadPriceHistory() {
    try {
      const savedHistory = localStorage.getItem('flight_price_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        
        // Convert back to Map
        Object.entries(parsedHistory).forEach(([route, history]) => {
          this.priceDb.set(route, history);
        });
        
        console.log(`Loaded price history for ${this.priceDb.size} routes`);
      }
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  }
  
  /**
   * Save price history to localStorage
   */
  savePriceHistory() {
    try {
      // Convert Map to object for storage
      const historyObj = {};
      this.priceDb.forEach((history, route) => {
        historyObj[route] = history;
      });
      
      localStorage.setItem('flight_price_history', JSON.stringify(historyObj));
    } catch (error) {
      console.error('Error saving price history:', error);
    }
  }
  
  /**
   * Add a price point to the history
   */
  recordPrice(origin, destination, price, date = new Date().toISOString()) {
    const routeKey = `${origin}-${destination}`;
    
    // Get existing history or create new
    const history = this.priceDb.get(routeKey) || {
      prices: [],
      min: Infinity,
      max: 0,
      sum: 0,
      count: 0
    };
    
    // Add new price point
    history.prices.push({
      price,
      date
    });
    
    // Update statistics
    history.min = Math.min(history.min, price);
    history.max = Math.max(history.max, price);
    history.sum += price;
    history.count += 1;
    
    // Keep only the last 90 days of data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    history.prices = history.prices.filter(entry => {
      return new Date(entry.date) >= ninetyDaysAgo;
    });
    
    // Recalculate stats if we removed old entries
    if (history.prices.length < history.count) {
      history.min = Math.min(...history.prices.map(p => p.price));
      history.max = Math.max(...history.prices.map(p => p.price));
      history.sum = history.prices.reduce((sum, entry) => sum + entry.price, 0);
      history.count = history.prices.length;
    }
    
    // Save updated history
    this.priceDb.set(routeKey, history);
    this.savePriceHistory();
    
    return history;
  }
  
  /**
   * Check if a price is considered a deal
   */
  isDeal(origin, destination, price, departureDate) {
    const routeKey = `${origin}-${destination}`;
    const history = this.priceDb.get(routeKey);
    
    // If we don't have enough history, can't determine if it's a deal
    if (!history || history.count < this.dealThresholds.priceHistoryMinEntries) {
      return {
        isDeal: false,
        reason: 'insufficient_history',
        confidence: 0
      };
    }
    
    // Calculate average price
    const avgPrice = history.sum / history.count;
    
    // Calculate discount percentage
    const discountPercent = ((avgPrice - price) / avgPrice) * 100;
    
    // Check if it's a last-minute deal
    const today = new Date();
    const departure = new Date(departureDate);
    const daysUntilDeparture = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));
    const isLastMinute = daysUntilDeparture <= this.dealThresholds.lastMinuteThreshold;
    
    // For last-minute deals, apply a different threshold
    const thresholdToUse = isLastMinute ? 
      this.dealThresholds.lastMinuteDiscount : 
      this.dealThresholds.minDiscount;
    
    // Check if discount exceeds threshold
    if (discountPercent >= thresholdToUse) {
      return {
        isDeal: true,
        reason: isLastMinute ? 'last_minute_deal' : 'price_drop',
        discountPercent,
        avgPrice,
        lastMinute: isLastMinute,
        daysUntilDeparture,
        // Calculate confidence based on how much data we have and how significant the discount is
        confidence: Math.min(
          0.5 + (history.count / 20) * 0.25 + (discountPercent / 100) * 0.25, 
          0.99
        )
      };
    }
    
    // Not a deal
    return {
      isDeal: false,
      reason: 'price_not_low_enough',
      discountPercent,
      avgPrice,
      confidence: 0
    };
  }
  
  /**
   * Find deals for a specific route
   */
  async findDealsForRoute(origin, destination, dateRange = {}) {
    try {
      // Default date range if not provided
      const defaultDepartureDate = new Date();
      defaultDepartureDate.setDate(defaultDepartureDate.getDate() + 14);
      
      const departureDate = dateRange.departure || defaultDepartureDate.toISOString().split('T')[0];
      
      // Search flights for this route
      const results = await skyscannerService.searchOneWayFlights(
        origin, 
        destination,
        origin,  // Using IATA code as ID for simplicity
        destination
      );
      
      if (!results || !results.itineraries || !results.itineraries.results || results.itineraries.results.length === 0) {
        return [];
      }
      
      const deals = [];
      
      // Process each itinerary to find deals
      for (const itinerary of results.itineraries.results) {
        if (!itinerary.pricingOptions || itinerary.pricingOptions.length === 0) continue;
        
        // Find the cheapest price option
        const cheapestOption = itinerary.pricingOptions.reduce(
          (min, option) => option.price.amount < min.price.amount ? option : min,
          itinerary.pricingOptions[0]
        );
        
        const price = cheapestOption.price.amount;
        
        // Record this price in our history
        this.recordPrice(origin, destination, price);
        
        // Check if this is a deal
        const dealStatus = this.isDeal(origin, destination, price, departureDate);
        
        if (dealStatus.isDeal) {
          // Get leg details
          const leg = results.legs.find(leg => leg.id === itinerary.legIds[0]);
          if (!leg) continue;
          
          // Get destination details from places
          const destinationPlace = results.places.find(place => place.entityId === leg.destinationPlaceId);
          if (!destinationPlace) continue;
          
          // Create deal object
          deals.push({
            id: `deal-${origin}-${destination}-${Date.now()}`,
            origin,
            destination,
            destinationName: destinationPlace.name,
            price,
            currency: cheapestOption.price.unit || 'EUR',
            departureDate,
            returnDate: null,  // One-way flight
            discountPercent: Math.round(dealStatus.discountPercent),
            averagePrice: Math.round(dealStatus.avgPrice),
            savings: Math.round(dealStatus.avgPrice - price),
            deepLink: cheapestOption.deepLink || '',
            lastMinute: dealStatus.lastMinute,
            expiryTime: this.calculateDealExpiry(dealStatus),
            confidence: dealStatus.confidence
          });
        }
      }
      
      return deals;
    } catch (error) {
      console.error(`Error finding deals for ${origin} to ${destination}:`, error);
      return [];
    }
  }
  
  /**
   * Calculate when a deal expires (better deals last longer)
   */
  calculateDealExpiry(dealStatus) {
    const now = new Date();
    let hoursToAdd = 24; // Default 24 hours
    
    // Better deals last longer
    if (dealStatus.discountPercent >= 40) {
      hoursToAdd = 72; // 3 days
    } else if (dealStatus.discountPercent >= 30) {
      hoursToAdd = 48; // 2 days
    }
    
    // Last minute deals expire quicker
    if (dealStatus.lastMinute) {
      hoursToAdd = Math.min(hoursToAdd, 36);
    }
    
    const expiry = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    return expiry.toISOString();
  }
  
  /**
   * Find deals from a specific origin to anywhere
   */
  async findDealsFromOrigin(origin, limit = 10) {
    try {
      // Get cheap flights from this origin to anywhere
      const flights = await skyscannerService.getCheapFlights(origin);
      
      if (!flights || flights.length === 0) {
        return [];
      }
      
      const deals = [];
      
      // Process each flight to find deals
      for (const flight of flights) {
        if (!flight.price) continue;
        
        // Record this price in our history
        this.recordPrice(origin, flight.to, flight.price);
        
        // Check if this is a deal
        const dealStatus = this.isDeal(origin, flight.to, flight.price, flight.departure);
        
        if (dealStatus.isDeal) {
          // Create deal object
          deals.push({
            id: `deal-${origin}-${flight.to}-${Date.now()}`,
            origin,
            destination: flight.to,
            destinationName: flight.destinationName,
            price: flight.price,
            currency: flight.currency || 'EUR',
            departureDate: flight.departure,
            returnDate: flight.return || null,
            discountPercent: Math.round(dealStatus.discountPercent),
            averagePrice: Math.round(dealStatus.avgPrice),
            savings: Math.round(dealStatus.avgPrice - flight.price),
            deepLink: flight.deep_link || '',
            lastMinute: dealStatus.lastMinute,
            expiryTime: this.calculateDealExpiry(dealStatus),
            confidence: dealStatus.confidence,
            airline: flight.airline,
            duration: flight.duration
          });
        }
      }
      
      // Sort by discount percentage and limit results
      return deals
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error finding deals from ${origin}:`, error);
      return [];
    }
  }
}

export default new DealDetectionService();