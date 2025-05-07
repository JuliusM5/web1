// src/utils/mobileFeatures.js

import { getMobileConfig } from '../config/mobileConfig';

class MobileFeatures {
  constructor() {
    this.config = getMobileConfig();
    this.platform = this.detectPlatform();
    this.initialized = false;
  }
  
  detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    } else if (/android/i.test(userAgent)) {
      return 'android';
    }
    return 'web';
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Initialize based on platform
    if (this.platform === 'ios' || this.platform === 'android') {
      await this.initializeMobileFeatures();
    } else {
      await this.initializeWebFeatures();
    }
    
    this.initialized = true;
  }
  
  async initializeMobileFeatures() {
    // Initialize push notifications
    if (this.config.pushNotifications.enabled) {
      await this.initializePushNotifications();
    }
    
    // Initialize location tracking
    if (this.config.locationTracking.enabled) {
      await this.initializeLocationTracking();
    }
  }
  
  async initializeWebFeatures() {
    // PWA-specific initializations
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
  
  async initializePushNotifications() {
    // For demonstration purposes - would integrate with platform-specific APIs
    console.log('Initializing push notifications for', this.platform);
    // Implementation depends on native bridge/capacitor/cordova
  }
  
  async initializeLocationTracking() {
    // For demonstration purposes - would integrate with platform-specific APIs
    console.log('Initializing location tracking for', this.platform);
    // Implementation depends on native bridge/capacitor/cordova
  }
  
  async scheduleFlightAlert(dealInfo) {
    if (!this.initialized) await this.initialize();
    
    // Schedule platform-specific notification
    if (this.platform === 'ios' || this.platform === 'android') {
      // Native notification code would go here
      console.log('Scheduling native notification for', dealInfo);
      return { success: true, id: Date.now() };
    } else {
      // Web notification
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const notification = new Notification('Flight Deal Alert', {
            body: `Great deal: ${dealInfo.origin} to ${dealInfo.destination} for $${dealInfo.price}`,
            icon: '/logo192.png'
          });
          return { success: true, id: Date.now() };
        }
      }
    }
    
    return { success: false, error: 'Notifications not available' };
  }
  
  // Additional native features can be added here
}

export default new MobileFeatures();