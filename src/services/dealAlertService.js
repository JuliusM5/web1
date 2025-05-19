
import notificationService from './notificationService';
import dealDetectionService from './dealDetectionService';
import analyticsService from './analyticsService';

/**
 * Service for managing and sending flight deal alerts
 */
class DealAlertService {
  constructor() {
    this.userAlerts = new Map();
    this.dealCache = new Map();
    this.lastCheckTime = new Map();
    this.minimumCheckInterval = 3 * 60 * 60 * 1000; // 3 hours minimum between checks
    
    // Load saved alerts from localStorage
    this.loadSavedAlerts();
  }
  
  /**
   * Load saved alerts from localStorage
   */
  loadSavedAlerts() {
    try {
      const savedAlerts = localStorage.getItem('deal_alerts');
      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts);
        
        // Convert back to Map - userId -> alerts[]
        Object.entries(parsedAlerts).forEach(([userId, alerts]) => {
          this.userAlerts.set(userId, alerts);
        });
        
        console.log(`Loaded ${this.userAlerts.size} user alert configurations`);
      }
    } catch (error) {
      console.error('Error loading saved alerts:', error);
    }
  }
  
  /**
   * Save alerts to localStorage
   */
  saveAlerts() {
    try {
      // Convert Map to object for storage
      const alertsObj = {};
      this.userAlerts.forEach((alerts, userId) => {
        alertsObj[userId] = alerts;
      });
      
      localStorage.setItem('deal_alerts', JSON.stringify(alertsObj));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }
  
  /**
   * Get all alerts for a user
   */
  getUserAlerts(userId) {
    return this.userAlerts.get(userId) || [];
  }
  
  /**
   * Create a new alert for a user
   */
  createAlert(userId, alertData) {
    if (!alertData.origin) {
      throw new Error('Origin is required');
    }
    
    // Get existing alerts for user
    const userAlerts = this.getUserAlerts(userId);
    
    // Check if alert already exists
    const existingAlertIndex = userAlerts.findIndex(alert => 
      alert.origin === alertData.origin && 
      alert.destination === alertData.destination &&
      alert.dateType === alertData.dateType
    );
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      userId,
      origin: alertData.origin,
      destination: alertData.destination || 'anywhere',
      dateType: alertData.dateType || 'flexible',
      startDate: alertData.startDate || null,
      endDate: alertData.endDate || null,
      tripLength: alertData.tripLength || { min: 3, max: 14 },
      maxPrice: alertData.maxPrice || null,
      active: true,
      createdAt: new Date().toISOString(),
      lastChecked: null,
      lastNotified: null
    };
    
    // Replace existing alert or add new one
    if (existingAlertIndex >= 0) {
      userAlerts[existingAlertIndex] = newAlert;
    } else {
      userAlerts.push(newAlert);
    }
    
    // Save updated alerts
    this.userAlerts.set(userId, userAlerts);
    this.saveAlerts();
    
    // Track alert creation
    analyticsService.trackEvent('alert_created', {
      alert_id: newAlert.id,
      origin: newAlert.origin,
      destination: newAlert.destination,
      date_type: newAlert.dateType
    });
    
    return newAlert;
  }
  
  /**
   * Update an existing alert
   */
  updateAlert(userId, alertId, updates) {
    const userAlerts = this.getUserAlerts(userId);
    const alertIndex = userAlerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) {
      throw new Error('Alert not found');
    }
    
    // Update the alert
    userAlerts[alertIndex] = {
      ...userAlerts[alertIndex],
      ...updates,
      lastChecked: updates.active !== false ? userAlerts[alertIndex].lastChecked : null
    };
    
    // Save updated alerts
    this.userAlerts.set(userId, userAlerts);
    this.saveAlerts();
    
    return userAlerts[alertIndex];
  }
  
  /**
   * Delete an alert
   */
  deleteAlert(userId, alertId) {
    const userAlerts = this.getUserAlerts(userId);
    const filteredAlerts = userAlerts.filter(alert => alert.id !== alertId);
    
    if (filteredAlerts.length === userAlerts.length) {
      throw new Error('Alert not found');
    }
    
    // Save updated alerts
    this.userAlerts.set(userId, filteredAlerts);
    this.saveAlerts();
    
    // Track alert deletion
    analyticsService.trackEvent('alert_deleted', {
      alert_id: alertId
    });
    
    return true;
  }
  
  /**
   * Check for deals that match an alert
   */
  async checkAlert(alert) {
    // Skip inactive alerts
    if (!alert.active) return [];
    
    // Check if we've checked this alert recently
    const lastCheck = this.lastCheckTime.get(alert.id);
    const now = Date.now();
    
    if (lastCheck && (now - lastCheck < this.minimumCheckInterval)) {
      return [];
    }
    
    try {
      // Update last check time
      this.lastCheckTime.set(alert.id, now);
      
      let deals = [];
      
      // Check if destination is "anywhere" or a specific place
      if (alert.destination === 'anywhere') {
        deals = await dealDetectionService.findDealsFromOrigin(alert.origin);
      } else {
        deals = await dealDetectionService.findDealsForRoute(
          alert.origin, 
          alert.destination,
          {
            departure: alert.startDate,
            return: alert.endDate
          }
        );
      }
      
      // Filter deals based on alert criteria
      let matchingDeals = deals.filter(deal => {
        // Filter by max price if set
        if (alert.maxPrice && deal.price > alert.maxPrice) {
          return false;
        }
        
        // Filter by date range if specific dates
        if (alert.dateType === 'specific') {
          if (!alert.startDate || !alert.endDate) return true;
          
          const dealDate = new Date(deal.departureDate);
          const startDate = new Date(alert.startDate);
          const endDate = new Date(alert.endDate);
          
          return dealDate >= startDate && dealDate <= endDate;
        }
        
        return true;
      });
      
      // Update last checked time for the alert
      this.updateAlert(alert.userId, alert.id, {
        lastChecked: new Date().toISOString()
      });
      
      // Cache and return the matching deals
      this.dealCache.set(alert.id, matchingDeals);
      
      return matchingDeals;
    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error);
      return [];
    }
  }
  
  /**
   * Check all alerts for a user and return matching deals
   */
  async checkAllAlertsForUser(userId) {
    const userAlerts = this.getUserAlerts(userId);
    const allDeals = [];
    
    // Check each active alert
    for (const alert of userAlerts) {
      if (alert.active) {
        const alertDeals = await this.checkAlert(alert);
        
        // Add alert info to each deal
        alertDeals.forEach(deal => {
          deal.alertId = alert.id;
        });
        
        allDeals.push(...alertDeals);
      }
    }
    
    return allDeals;
  }
  
  /**
   * Send notifications for new deals
   */
  async notifyUserOfDeals(userId, deals, options = {}) {
    if (!deals || deals.length === 0) return [];
    
    const notifiedDeals = [];
    const userAlerts = this.getUserAlerts(userId);
    
    for (const deal of deals) {
      // Find the corresponding alert
      const alert = userAlerts.find(a => a.id === deal.alertId);
      if (!alert) continue;
      
      // Check if we've already notified for this deal recently
      // This prevents repeated notifications for the same deal
      if (this.hasRecentlyNotified(alert, deal)) {
        continue;
      }
      
      // Prepare notification message
      const title = `Flight Deal: ${deal.origin} to ${deal.destinationName}`;
      let message = `${deal.discountPercent}% off! `;
      message += `${deal.currency} ${deal.price} (Usually ${deal.currency} ${deal.averagePrice})`;
      
      if (deal.departureDate) {
        const date = new Date(deal.departureDate);
        message += ` on ${date.toLocaleDateString()}`;
      }
      
      // Send browser notification
      const notificationSent = await notificationService.showNotification(title, {
        body: message,
        icon: '/logo192.png',
        data: {
          dealId: deal.id,
          deepLink: deal.deepLink
        },
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Deal' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
      
      if (notificationSent) {
        // Update alert with last notification time
        this.updateAlert(userId, alert.id, {
          lastNotified: new Date().toISOString()
        });
        
        // Track notification sent
        analyticsService.trackEvent('deal_notification_sent', {
          alert_id: alert.id,
          deal_id: deal.id,
          price: deal.price,
          discount: deal.discountPercent
        });
        
        notifiedDeals.push(deal);
      }
    }
    
    return notifiedDeals;
  }
  
  /**
   * Check if we've recently notified about a similar deal
   */
  hasRecentlyNotified(alert, deal) {
    if (!alert.lastNotified) return false;
    
    const lastNotification = new Date(alert.lastNotified);
    const now = new Date();
    
    // Don't notify more than once per day for the same route
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return lastNotification > oneDayAgo;
  }
  
  /**
   * Get cached deals for an alert
   */
  getCachedDealsForAlert(alertId) {
    return this.dealCache.get(alertId) || [];
  }
  
  /**
   * Process alerts in the background at regular intervals
   */
  startBackgroundProcessing(intervalMinutes = 180) {
    // Schedule periodic checks
    setInterval(() => {
      this.processAllAlerts();
    }, intervalMinutes * 60 * 1000);
    
    // Also do an initial check
    setTimeout(() => {
      this.processAllAlerts();
    }, 5000);
    
    console.log(`Background alert processing started, interval: ${intervalMinutes} minutes`);
  }
  
  /**
   * Process all active alerts
   */
  async processAllAlerts() {
    console.log('Processing all alerts...');
    
    // Process alerts for each user
    for (const [userId, alerts] of this.userAlerts.entries()) {
      const activeAlerts = alerts.filter(alert => alert.active);
      
      if (activeAlerts.length === 0) continue;
      
      // Check for new deals
      const deals = await this.checkAllAlertsForUser(userId);
      
      // Send notifications if there are deals
      if (deals.length > 0) {
        await this.notifyUserOfDeals(userId, deals);
      }
    }
    
    console.log('Alert processing completed');
  }
}

export default new DealAlertService();