
import dealAlertService from './dealAlertService';
import notificationService from './notificationService';
import { captureError } from '../utils/errorMonitoring';

/**
 * Service for running background tasks like deal checking
 */
class BackgroundService {
  constructor() {
    this.isInitialized = false;
    this.intervalIds = [];
    this.lastProcessTime = null;
    this.processingFrequency = 3 * 60 * 60 * 1000; // 3 hours
    this.setupTries = 0;
    this.maxSetupTries = 3;
  }
  
  /**
   * Initialize background processing
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Request notification permission if not already granted
      if ('Notification' in window) {
        const permissionResult = await notificationService.checkPermission();
        
        if (permissionResult.permission === 'default') {
          // Defer asking for permission until there's user interaction
          document.addEventListener('click', this.requestNotificationPermission, { once: true });
        }
      }
      
      // Schedule background tasks
      this.scheduleBackgroundTasks();
      
      this.isInitialized = true;
      console.log('Background service initialized');
      return true;
    } catch (error) {
      captureError(error, { context: 'BackgroundService.initialize' });
      this.setupTries++;
      
      if (this.setupTries < this.maxSetupTries) {
        // Retry initialization after delay
        setTimeout(() => this.initialize(), 5000);
      }
      
      return false;
    }
  }
  
  /**
   * Request notification permission after user interaction
   */
  requestNotificationPermission = async () => {
    try {
      await notificationService.requestPermission();
    } catch (error) {
      console.warn('Could not request notification permission:', error);
    }
  };
  
  /**
   * Schedule background tasks
   */
  scheduleBackgroundTasks() {
    // Clear any existing intervals
    this.clearIntervals();
    
    // Schedule alert processing
    const alertIntervalId = setInterval(() => {
      this.processAlerts();
    }, this.processingFrequency);
    
    this.intervalIds.push(alertIntervalId);
    
    // Run initial processing after short delay
    setTimeout(() => {
      this.processAlerts();
    }, 10000);
    
    // Schedule service worker registration checks
    if ('serviceWorker' in navigator) {
      const swCheckIntervalId = setInterval(() => {
        this.checkServiceWorker();
      }, 24 * 60 * 60 * 1000); // Check once a day
      
      this.intervalIds.push(swCheckIntervalId);
      
      // Run initial check after delay
      setTimeout(() => {
        this.checkServiceWorker();
      }, 5000);
    }
  }
  
  /**
   * Clear all scheduled intervals
   */
  clearIntervals() {
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
  }
  
  /**
   * Process alerts in the background
   */
  async processAlerts() {
    // Skip if we've processed recently
    if (this.lastProcessTime && Date.now() - this.lastProcessTime < this.processingFrequency / 2) {
      return;
    }
    
    console.log('Processing alerts in background');
    this.lastProcessTime = Date.now();
    
    try {
      // Use the dealAlertService to process all alerts
      await dealAlertService.processAllAlerts();
    } catch (error) {
      captureError(error, { context: 'BackgroundService.processAlerts' });
    }
  }
  
  /**
   * Check and register service worker if needed
   */
  async checkServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      // Check if service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered:', registration.scope);
      }
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  }
  
  /**
   * Start background sync if supported
   */
  async requestBackgroundSync() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      return false;
    }
    
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Register for periodic sync if supported
      if ('periodicSync' in registration) {
        // Try to get permission
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync'
        });
        
        if (status.state === 'granted') {
          // Register for periodic sync
          await registration.periodicSync.register('flight-deals-sync', {
            minInterval: 6 * 60 * 60 * 1000 // 6 hours
          });
          
          return true;
        }
      }
      
      // Fall back to regular background sync
      await registration.sync.register('flight-deals-sync');
      return true;
    } catch (error) {
      console.warn('Background sync registration failed:', error);
      return false;
    }
  }
}

// Create and initialize the service
const backgroundService = new BackgroundService();

// Initialize on import
setTimeout(() => {
  backgroundService.initialize();
}, 1000);

export default backgroundService;