// src/services/DealFinderService.js

/**
 * Deal Finder Service
 * 
 * This service is responsible for:
 * 1. Scheduled batch processing of flight deals
 * 2. Efficient Skyscanner API usage
 * 3. Deal detection and storage
 * 
 * It's designed to be run as a scheduled task (cron job)
 * rather than being triggered by user actions.
 */

const axios = require('axios');
const { Pool } = require('pg'); // PostgreSQL client
const cron = require('node-cron');
const Redis = require('ioredis');
const logger = require('../utils/logger');

class DealFinderService {
  constructor() {
    // Configuration
    this.config = {
      // API configuration
      skyscanner: {
        apiKey: process.env.SKYSCANNER_API_KEY,
        baseUrl: 'https://partners.api.skyscanner.net/apiservices/v3',
        maxRetries: 3,
        retryDelay: 1000, // ms
        rateLimit: { // Rate limits from your Skyscanner contract
          requestsPerSecond: 7,
          requestsPerMinute: 100
        }
      },
      
      // Deal finding parameters
      deals: {
        discountThreshold: 20, // % below average to qualify as a deal
        lastMinuteWindow: 14, // Days for last-minute deals
        minPriceDrop: 30, // Minimum price drop in EUR
        maxRoutesPerOrigin: 20, // Top routes to check per origin
        maxOriginsPerDay: 10, // Origins to process per day
      },
      
      // Processing schedule
      schedule: {
        // Run at 2 AM every day
        cronExpression: '0 2 * * *',
        // Also run at 2 PM for more frequent updates
        midDayCronExpression: '0 14 * * *',
      }
    };
    
    // Initialize connections
    this.redis = new Redis(process.env.REDIS_URL);
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Rate limiting queue
    this.requestQueue = [];
    this.processing = false;
  }
  
  /**
   * Initialize the service
   */
  async initialize() {
    try {
      // Load origins and routes from database
      await this.loadOrigins();
      await this.loadPopularRoutes();
      
      // Schedule the job
      this.scheduleJobs();
      
      logger.info('DealFinderService initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize DealFinderService', error);
      throw error;
    }
  }
  
  /**
   * Schedule the deal finding jobs
   */
  scheduleJobs() {
    // Main job at 2 AM
    cron.schedule(this.config.schedule.cronExpression, () => {
      this.runDealFinder('full');
    });
    
    // Additional job at 2 PM (focusing on last-minute deals)
    cron.schedule(this.config.schedule.midDayCronExpression, () => {
      this.runDealFinder('lastMinute');
    });
    
    logger.info('Deal finder jobs scheduled');
  }
  
  /**
   * Load airports/origins from database
   */
  async loadOrigins() {
    try {
      const result = await this.db.query(`
        SELECT * FROM airports 
        WHERE is_active = true
        ORDER BY priority DESC
      `);
      
      this.origins = result.rows;
      this.originRotation = this.createOriginRotation();
      
      logger.info(`Loaded ${this.origins.length} active origins`);
      return this.origins;
    } catch (error) {
      logger.error('Error loading origins', error);
      throw error;
    }
  }
  
  /**
   * Load popular routes from database
   */
  async loadPopularRoutes() {
    try {
      const result = await this.db.query(`
        SELECT origin_code, destination_code, priority, searches_count
        FROM popular_routes
        WHERE is_active = true
        ORDER BY origin_code, priority DESC
      `);
      
      // Group by origin
      this.popularRoutes = {};
      result.rows.forEach(route => {
        if (!this.popularRoutes[route.origin_code]) {
          this.popularRoutes[route.origin_code] = [];
        }
        this.popularRoutes[route.origin_code].push(route);
      });
      
      logger.info(`Loaded popular routes for ${Object.keys(this.popularRoutes).length} origins`);
      return this.popularRoutes;
    } catch (error) {
      logger.error('Error loading popular routes', error);
      throw error;
    }
  }
  
  /**
   * Create the origin rotation schedule
   */
  createOriginRotation() {
    // Create rotation groups for the origins
    // This helps distribute API calls evenly across days
    const rotation = [];
    const originsPerGroup = this.config.deals.maxOriginsPerDay;
    
    // Group origins by priority and location
    const sortedOrigins = [...this.origins].sort((a, b) => b.priority - a.priority);
    
    // Create rotation groups
    for (let i = 0; i < sortedOrigins.length; i += originsPerGroup) {
      rotation.push(
        sortedOrigins.slice(i, i + originsPerGroup).map(o => o.code)
      );
    }
    
    logger.info(`Created ${rotation.length} origin rotation groups`);
    return rotation;
  }
  
  /**
   * Get today's origins to process based on rotation
   */
  getTodaysOrigins(mode = 'full') {
    // For last-minute mode, focus on major airports
    if (mode === 'lastMinute') {
      return this.origins
        .filter(o => o.priority >= 8) // Only high priority airports
        .slice(0, this.config.deals.maxOriginsPerDay)
        .map(o => o.code);
    }
    
    // For full mode, use rotation
    // Get current rotation index from Redis
    return this.redis.get('origin_rotation_index')
      .then(index => {
        const rotationIndex = parseInt(index || '0');
        const groupIndex = rotationIndex % this.originRotation.length;
        
        // Update rotation index for next time
        this.redis.set('origin_rotation_index', (rotationIndex + 1).toString());
        
        return this.originRotation[groupIndex];
      });
  }
  
  /**
   * Main deal finder routine
   */
  async runDealFinder(mode = 'full') {
    try {
      logger.info(`Starting deal finder in ${mode} mode`);
      
      // Get origins to process today
      const originsToProcess = await this.getTodaysOrigins(mode);
      logger.info(`Processing ${originsToProcess.length} origins: ${originsToProcess.join(', ')}`);
      
      // Process each origin
      for (const originCode of originsToProcess) {
        await this.findDealsForOrigin(originCode, mode);
      }
      
      logger.info(`Deal finder completed for ${originsToProcess.length} origins`);
      return true;
    } catch (error) {
      logger.error('Error in deal finder', error);
      // Notify admins if something goes wrong
      await this.notifyAdminsOfError(error);
      return false;
    }
  }
  
  /**
   * Process a single origin to find deals
   */
  async findDealsForOrigin(originCode, mode) {
    logger.info(`Finding deals for origin: ${originCode}`);
    
    try {
      // Get popular routes for this origin
      const routes = this.getRoutesForOrigin(originCode, mode);
      if (!routes || routes.length === 0) {
        logger.warn(`No routes found for origin: ${originCode}`);
        return;
      }
      
      // Create API request for "anywhere" search if supported
      // This is more efficient than individual route searches
      if (mode === 'lastMinute' && this.supportsAnywhereSearch()) {
        await this.processAnywhereSearch(originCode, mode);
      } else {
        // Process routes in batches
        await this.processRoutesBatch(originCode, routes, mode);
      }
      
      logger.info(`Completed deal finding for origin: ${originCode}`);
    } catch (error) {
      logger.error(`Error processing origin ${originCode}`, error);
      // Continue with other origins
    }
  }
  
  /**
   * Get routes to check for an origin
   */
  getRoutesForOrigin(originCode, mode) {
    const routes = this.popularRoutes[originCode] || [];
    
    // Filter routes based on mode
    let filteredRoutes = routes;
    if (mode === 'lastMinute') {
      // For last minute, focus on vacation destinations
      filteredRoutes = routes.filter(r => r.is_vacation_destination);
    }
    
    // Limit to configured max routes
    return filteredRoutes.slice(0, this.config.deals.maxRoutesPerOrigin);
  }
  
  /**
   * Check if API supports "anywhere" searches
   */
  supportsAnywhereSearch() {
    // This would depend on your Skyscanner API contract
    // For now, we'll assume it's supported
    return true;
  }
  
  /**
   * Process an "anywhere" search for an origin
   * This is more efficient as it can get multiple destinations in one call
   */
  async processAnywhereSearch(originCode, mode) {
    logger.info(`Performing "anywhere" search for ${originCode}`);
    
    try {
      // Get date ranges based on mode
      const dates = this.getDateRangesForMode(mode);
      
      // Prepare API call parameters
      const params = {
        market: 'LT', // Default market
        locale: 'en-US',
        currency: 'EUR',
        queryLegs: [
          {
            originPlaceId: { iata: originCode },
            destinationPlaceId: { anywhere: true },
            date: {
              year: dates.outbound.getFullYear(),
              month: dates.outbound.getMonth() + 1,
              day: dates.outbound.getDate()
            }
          }
        ],
        cabinClass: 'CABIN_CLASS_ECONOMY',
        adults: 1,
        childrenAges: []
      };
      
      // Make the API call
      const session = await this.createLivePricesSession(params);
      
      // Poll for results
      const results = await this.pollLivePricesResults(session.sessionToken);
      
      // Process the results to find deals
      await this.processFlightResults(originCode, 'ANYWHERE', results, mode);
      
      logger.info(`Completed "anywhere" search for ${originCode}`);
    } catch (error) {
      logger.error(`Error in "anywhere" search for ${originCode}`, error);
      throw error;
    }
  }
  
  /**
   * Process routes in efficient batches
   */
  async processRoutesBatch(originCode, routes, mode) {
    logger.info(`Processing ${routes.length} routes for ${originCode} in batches`);
    
    // Process in smaller batches to stay within API limits
    const batchSize = 5; // Adjust based on your API capabilities
    
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      logger.info(`Processing batch ${Math.floor(i/batchSize) + 1} for ${originCode}`);
      
      // Create promises for each route in the batch
      const promises = batch.map(route => 
        this.processRoute(originCode, route.destination_code, mode)
          .catch(error => {
            logger.error(`Error processing route ${originCode} to ${route.destination_code}`, error);
            return null; // Continue with other routes
          })
      );
      
      // Process batch in parallel, but respect rate limits
      await Promise.all(promises);
    }
  }
  
  /**
   * Process a single route
   */
  async processRoute(originCode, destinationCode, mode) {
    logger.info(`Processing route: ${originCode} to ${destinationCode}`);
    
    try {
      // Get date ranges based on mode
      const dates = this.getDateRangesForMode(mode);
      
      // Prepare API call parameters
      const params = {
        market: 'LT', // Default market
        locale: 'en-US',
        currency: 'EUR',
        queryLegs: [
          {
            originPlaceId: { iata: originCode },
            destinationPlaceId: { iata: destinationCode },
            date: {
              year: dates.outbound.getFullYear(),
              month: dates.outbound.getMonth() + 1,
              day: dates.outbound.getDate()
            }
          }
        ],
        cabinClass: 'CABIN_CLASS_ECONOMY',
        adults: 1,
        childrenAges: []
      };
      
      // For round trips, add return leg
      if (dates.inbound) {
        params.queryLegs.push({
          originPlaceId: { iata: destinationCode },
          destinationPlaceId: { iata: originCode },
          date: {
            year: dates.inbound.getFullYear(),
            month: dates.inbound.getMonth() + 1,
            day: dates.inbound.getDate()
          }
        });
      }
      
      // Make the API call
      const session = await this.createLivePricesSession(params);
      
      // Poll for results
      const results = await this.pollLivePricesResults(session.sessionToken);
      
      // Process the results to find deals
      await this.processFlightResults(originCode, destinationCode, results, mode);
      
      logger.info(`Completed route processing: ${originCode} to ${destinationCode}`);
    } catch (error) {
      logger.error(`Error processing route ${originCode} to ${destinationCode}`, error);
      throw error;
    }
  }
  
  /**
   * Create Live Prices session with Skyscanner API
   */
  async createLivePricesSession(params) {
    try {
      const response = await this.makeApiRequest({
        method: 'POST',
        url: `${this.config.skyscanner.baseUrl}/flights/live/search/create`,
        headers: {
          'X-RapidAPI-Key': this.config.skyscanner.apiKey,
          'Content-Type': 'application/json'
        },
        data: params
      });
      
      return {
        sessionToken: response.data.sessionToken,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Error creating Live Prices session', error);
      throw error;
    }
  }
  
  /**
   * Poll for Live Prices results
   */
  async pollLivePricesResults(sessionToken) {
    let completed = false;
    let attempts = 0;
    const maxAttempts = 5; // Adjust based on your needs
    
    while (!completed && attempts < maxAttempts) {
      attempts++;
      
      try {
        const response = await this.makeApiRequest({
          method: 'POST',
          url: `${this.config.skyscanner.baseUrl}/flights/live/search/poll/${sessionToken}`,
          headers: {
            'X-RapidAPI-Key': this.config.skyscanner.apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 'RESULT_STATUS_COMPLETE') {
          completed = true;
          return response.data;
        }
        
        // If not complete, wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Error polling Live Prices (attempt ${attempts})`, error);
        
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }
    
    // Return whatever we have even if incomplete
    if (!completed) {
      logger.warn(`Live Prices polling not completed after ${maxAttempts} attempts`);
    }
    
    return null;
  }
  
  /**
   * Process flight results to find deals
   */
  async processFlightResults(originCode, destinationCode, results, mode) {
    if (!results || !results.content) {
      logger.warn(`No results for ${originCode} to ${destinationCode}`);
      return;
    }
    
    try {
      const { itineraries, legs, places, carriers } = results.content;
      
      // Map to store deals
      const deals = [];
      
      // Process each itinerary to find deals
      for (const itinerary of itineraries.results) {
        // Get the pricing options
        const pricingOptions = itinerary.pricingOptions || [];
        
        if (pricingOptions.length === 0) continue;
        
        // Find the cheapest price option
        const cheapestOption = pricingOptions.reduce(
          (min, option) => option.price.amount < min.price.amount ? option : min,
          pricingOptions[0]
        );
        
        // Get the legs for this itinerary
        const outboundLeg = legs.find(leg => leg.id === itinerary.legIds[0]);
        const inboundLeg = itinerary.legIds[1] ? 
          legs.find(leg => leg.id === itinerary.legIds[1]) : null;
        
        if (!outboundLeg) continue;
        
        // Get destination details
        const destination = places.find(p => p.entityId === outboundLeg.destinationPlaceId);
        if (!destination) continue;
        
        // Calculate if this is a deal
        const isDeal = await this.calculateIfDeal(
          originCode,
          destination.iata,
          cheapestOption.price.amount,
          mode
        );
        
        if (isDeal) {
          // Create a deal object
          const deal = {
            id: `${Date.now()}-${originCode}-${destination.iata}`,
            originCode,
            destinationCode: destination.iata,
            destinationName: destination.name,
            outboundDate: outboundLeg.departureDateTime.year + 
              '-' + outboundLeg.departureDateTime.month.toString().padStart(2, '0') + 
              '-' + outboundLeg.departureDateTime.day.toString().padStart(2, '0'),
            inboundDate: inboundLeg ? (
              inboundLeg.departureDateTime.year + 
              '-' + inboundLeg.departureDateTime.month.toString().padStart(2, '0') + 
              '-' + inboundLeg.departureDateTime.day.toString().padStart(2, '0')
            ) : null,
            price: cheapestOption.price.amount,
            currency: cheapestOption.price.unit,
            discount: isDeal.discountPercent,
            normalPrice: isDeal.averagePrice,
            deepLink: cheapestOption.items[0]?.deepLink || null,
            airline: this.getAirlineName(carriers, outboundLeg),
            isLastMinute: this.isLastMinuteDeal(outboundLeg),
            expiresAt: this.calculateExpiry(isDeal.discountPercent),
            createdAt: new Date().toISOString()
          };
          
          deals.push(deal);
        }
      }
      
      // Save deals to database
      if (deals.length > 0) {
        await this.saveDeals(deals);
        logger.info(`Found and saved ${deals.length} deals for ${originCode} to ${destinationCode}`);
      } else {
        logger.info(`No deals found for ${originCode} to ${destinationCode}`);
      }
      
      return deals;
    } catch (error) {
      logger.error(`Error processing results for ${originCode} to ${destinationCode}`, error);
      throw error;
    }
  }
  
  /**
   * Get airline name from carriers
   */
  getAirlineName(carriers, leg) {
    if (!leg.carriers || !leg.carriers.marketing || leg.carriers.marketing.length === 0) {
      return 'Unknown';
    }
    
    const carrierId = leg.carriers.marketing[0].id;
    const carrier = carriers.find(c => c.id === carrierId);
    
    return carrier ? carrier.name : 'Unknown';
  }
  
  /**
   * Determine if a flight is a last-minute deal
   */
  isLastMinuteDeal(leg) {
    const now = new Date();
    const departureDate = new Date(
      leg.departureDateTime.year,
      leg.departureDateTime.month - 1,
      leg.departureDateTime.day
    );
    
    const daysUntilDeparture = Math.round(
      (departureDate - now) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilDeparture <= this.config.deals.lastMinuteWindow;
  }
  
  /**
   * Calculate when a deal expires
   */
  calculateExpiry(discountPercent) {
    const now = new Date();
    let hoursToAdd = 24; // Default 24 hours
    
    // Better deals last longer
    if (discountPercent >= 40) {
      hoursToAdd = 72; // 3 days
    } else if (discountPercent >= 30) {
      hoursToAdd = 48; // 2 days
    }
    
    const expiry = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    return expiry.toISOString();
  }
  
  /**
   * Calculate if a price is a deal based on historical data
   */
  async calculateIfDeal(originCode, destinationCode, currentPrice, mode) {
    try {
      // Get historical prices from database
      const result = await this.db.query(`
        SELECT avg_price, min_price, max_price
        FROM route_prices
        WHERE origin_code = $1 AND destination_code = $2
      `, [originCode, destinationCode]);
      
      if (result.rows.length === 0) {
        // No historical data - use conservative approach
        // Store this price as the first data point
        await this.db.query(`
          INSERT INTO route_prices
          (origin_code, destination_code, avg_price, min_price, max_price, price_count)
          VALUES ($1, $2, $3, $3, $3, 1)
        `, [originCode, destinationCode, currentPrice]);
        
        // Consider it a deal if in last-minute mode with a reasonable price
        if (mode === 'lastMinute' && currentPrice < 150) {
          return {
            isDeal: true,
            discountPercent: 20, // Default discount
            averagePrice: currentPrice * 1.25 // Estimated average
          };
        }
        
        return false;
      }
      
      // Calculate if it's a deal
      const priceData = result.rows[0];
      const avgPrice = parseFloat(priceData.avg_price);
      const minPrice = parseFloat(priceData.min_price);
      
      // Calculate discount percentage
      const discountPercent = Math.round(
        ((avgPrice - currentPrice) / avgPrice) * 100
      );
      
      // Update price history
      await this.updatePriceHistory(
        originCode, 
        destinationCode, 
        currentPrice, 
        avgPrice,
        minPrice,
        parseFloat(priceData.max_price)
      );
      
      // Determine if it's a deal
      if (discountPercent >= this.config.deals.discountThreshold) {
        return {
          isDeal: true,
          discountPercent,
          averagePrice: avgPrice
        };
      }
      
      // Special case for last-minute deals - lower threshold
      if (mode === 'lastMinute' && discountPercent >= 15) {
        return {
          isDeal: true,
          discountPercent,
          averagePrice: avgPrice
        };
      }
      
      return false;
    } catch (error) {
      logger.error(`Error calculating if deal for ${originCode} to ${destinationCode}`, error);
      return false;
    }
  }
  
  /**
   * Update price history for a route
   */
  async updatePriceHistory(originCode, destinationCode, currentPrice, avgPrice, minPrice, maxPrice) {
    try {
      // Calculate new values
      const newMinPrice = Math.min(currentPrice, minPrice);
      const newMaxPrice = Math.max(currentPrice, maxPrice);
      
      // Calculate new average (weighted to reduce impact of outliers)
      const newAvgPrice = (avgPrice * 9 + currentPrice) / 10;
      
      // Update the database
      await this.db.query(`
        UPDATE route_prices
        SET avg_price = $3,
            min_price = $4,
            max_price = $5,
            price_count = price_count + 1,
            last_updated = NOW()
        WHERE origin_code = $1 AND destination_code = $2
      `, [originCode, destinationCode, newAvgPrice, newMinPrice, newMaxPrice]);
      
      return true;
    } catch (error) {
      logger.error(`Error updating price history for ${originCode} to ${destinationCode}`, error);
      return false;
    }
  }
  
  /**
   * Save deals to the database
   */
  async saveDeals(deals) {
    if (!deals || deals.length === 0) return;
    
    try {
      // Begin transaction
      const client = await this.db.connect();
      await client.query('BEGIN');
      
      try {
        // Insert each deal
        for (const deal of deals) {
          await client.query(`
            INSERT INTO flight_deals (
              id, origin_code, destination_code, destination_name,
              outbound_date, inbound_date, price, currency,
              discount_percent, normal_price, deep_link,
              airline, is_last_minute, expires_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (origin_code, destination_code, outbound_date) 
            DO UPDATE SET
              price = EXCLUDED.price,
              discount_percent = EXCLUDED.discount_percent,
              deep_link = EXCLUDED.deep_link,
              expires_at = EXCLUDED.expires_at
          `, [
            deal.id, deal.originCode, deal.destinationCode, deal.destinationName,
            deal.outboundDate, deal.inboundDate, deal.price, deal.currency,
            deal.discount, deal.normalPrice, deal.deepLink,
            deal.airline, deal.isLastMinute, deal.expiresAt, deal.createdAt
          ]);
        }
        
        // Commit transaction
        await client.query('COMMIT');
      } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        throw error;
      } finally {
        // Release client back to pool
        client.release();
      }
      
      // Clear cache for these routes
      await this.clearDealCache(deals);
      
      // Send notifications for exceptional deals
      await this.sendNotificationsForDeals(deals);
      
      return true;
    } catch (error) {
      logger.error('Error saving deals', error);
      return false;
    }
  }
  
  /**
   * Clear cache for deal routes
   */
  async clearDealCache(deals) {
    try {
      // Get unique origins
      const origins = [...new Set(deals.map(d => d.originCode))];
      
      // Clear cache for each origin
      for (const origin of origins) {
        await this.redis.del(`deals:${origin}:lastMinute`);
        await this.redis.del(`deals:${origin}:discounted`);
      }
      
      return true;
    } catch (error) {
      logger.error('Error clearing deal cache', error);
      return false;
    }
  }
  
  /**
   * Send notifications for exceptional deals
   */
  async sendNotificationsForDeals(deals) {
    // Filter for deals worth notifying about
    const notifiableDeals = deals.filter(deal => 
      deal.discount >= 30 || (deal.isLastMinute && deal.discount >= 25)
    );
    
    if (notifiableDeals.length === 0) return;
    
    try {
      // Queue notification jobs for each deal
      for (const deal of notifiableDeals) {
        await this.queueDealNotification(deal);
      }
      
      return true;
    } catch (error) {
      logger.error('Error sending deal notifications', error);
      return false;
    }
  }
  
  /**
   * Queue a deal notification for processing
   */
  async queueDealNotification(deal) {
    try {
      // In a real implementation, this would add to a job queue
      // For example, using Bull or a similar queue system
      logger.info(`Queued notification for deal: ${deal.id}`);
      return true;
    } catch (error) {
      logger.error(`Error queuing notification for deal ${deal.id}`, error);
      return false;
    }
  }
  
  /**
   * Notify admins of errors
   */
  async notifyAdminsOfError(error) {
    // In a real implementation, this would send an email or Slack message
    logger.error('Error in deal finder that requires admin attention', error);
    return true;
  }
  
  /**
   * Make an API request with rate limiting and retries
   */
  async makeApiRequest(config) {
    return new Promise((resolve, reject) => {
      // Add to request queue
      this.requestQueue.push({
        config,
        resolve,
        reject,
        retries: 0
      });
      
      // Start processing if not already running
      if (!this.processing) {
        this.processRequestQueue();
      }
    });
  }
  
  /**
   * Process the API request queue with rate limiting
   */
  async processRequestQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      const request = this.requestQueue.shift();
      
      try {
        const response = await axios(request.config);
        request.resolve(response);
      } catch (error) {
        // Handle retries for failures
        if (
          request.retries < this.config.skyscanner.maxRetries &&
          error.response && 
          (error.response.status === 429 || error.response.status >= 500)
        ) {
          // Exponential backoff
          const delay = this.config.skyscanner.retryDelay * 
            Math.pow(2, request.retries);
          
          logger.warn(`API request failed, retrying in ${delay}ms`, {
            status: error.response.status,
            retryCount: request.retries + 1
          });
          
          request.retries++;
          
          // Add back to queue after delay
          setTimeout(() => {
            this.requestQueue.push(request);
            if (!this.processing) {
              this.processRequestQueue();
            }
          }, delay);
        } else {
          request.reject(error);
        }
      }
      
      // Rate limiting delay
      await new Promise(resolve => 
        setTimeout(resolve, 1000 / this.config.skyscanner.rateLimit.requestsPerSecond)
      );
      
      // Process next request
      this.processing = false;
      this.processRequestQueue();
    } catch (error) {
      logger.error('Error processing request queue', error);
      this.processing = false;
      
      // Continue processing after error
      setTimeout(() => this.processRequestQueue(), 1000);
    }
  }
  
  /**
   * Get date ranges based on search mode
   */
  getDateRangesForMode(mode) {
    const now = new Date();
    let outbound, inbound;
    
    if (mode === 'lastMinute') {
      // For last minute, look at next 1-2 weeks
      outbound = new Date(now);
      outbound.setDate(now.getDate() + 7); // 1 week out
      
      inbound = new Date(outbound);
      inbound.setDate(outbound.getDate() + 7); // 1 week trip
    } else {
      // For regular mode, look further out
      outbound = new Date(now);
      outbound.setDate(now.getDate() + 30); // 1 month out
      
      inbound = new Date(outbound);
      inbound.setDate(outbound.getDate() + 7); // 1 week trip
    }
    
    return { outbound, inbound };
  }
}

module.exports = new DealFinderService();