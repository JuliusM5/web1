// src/services/SubscriptionService.js

import { storageKeys } from '../constants/storageKeys';
import { deviceDetection } from '../utils/deviceDetection';

class SubscriptionService {
  constructor() {
    // Read subscription status from storage
    this.loadSubscriptionState();
    
    // Platform-specific payment handlers
    this.paymentHandlers = {
      android: this.handleGooglePayment,
      ios: this.handleApplePayment,
      web: this.handleWebPayment
    };
  }
  
  loadSubscriptionState() {
    try {
      const savedState = localStorage.getItem(storageKeys.USER_SUBSCRIPTION);
      if (savedState) {
        this.subscriptionState = JSON.parse(savedState);
      } else {
        this.subscriptionState = {
          isSubscribed: false,
          plan: null,
          expiryDate: null,
          paymentMethod: null,
          subscriptionId: null
        };
      }
    } catch (error) {
      console.error('Error loading subscription state:', error);
      // Default state if error
      this.subscriptionState = {
        isSubscribed: false,
        plan: null,
        expiryDate: null,
        paymentMethod: null,
        subscriptionId: null
      };
    }
  }
  
  saveSubscriptionState() {
    try {
      localStorage.setItem(storageKeys.USER_SUBSCRIPTION, JSON.stringify(this.subscriptionState));
    } catch (error) {
      console.error('Error saving subscription state:', error);
    }
  }
  
  getSubscriptionState() {
    return { ...this.subscriptionState };
  }
  
  // Check if a user still has free signals available (3 total)
  checkFreeSignalAvailability(userId) {
    try {
      const userSignals = localStorage.getItem(`user_signals_${userId}`);
      if (!userSignals) {
        return { available: true, remaining: 3 };
      }
      
      const signalData = JSON.parse(userSignals);
      const remaining = Math.max(0, 3 - signalData.count);
      
      return { 
        available: remaining > 0, 
        remaining,
        used: signalData.count 
      };
    } catch (error) {
      console.error('Error checking free signal availability:', error);
      return { available: false, remaining: 0, error: true };
    }
  }
  
  // Record usage of a free signal (increment count)
  useFreeSignal(userId) {
    if (this.subscriptionState.isSubscribed) {
      return { success: true, unlimited: true }; // Subscribed users don't count
    }
    
    try {
      const userSignals = localStorage.getItem(`user_signals_${userId}`);
      const signalData = userSignals ? JSON.parse(userSignals) : { 
        count: 0, 
        firstUsed: Date.now() 
      };
      
      if (signalData.count >= 3) {
        return { success: false, reason: 'No free signals remaining' };
      }
      
      signalData.count++;
      signalData.lastUsed = Date.now();
      
      localStorage.setItem(`user_signals_${userId}`, JSON.stringify(signalData));
      
      return { 
        success: true, 
        remaining: 3 - signalData.count,
        used: signalData.count
      };
    } catch (error) {
      console.error('Error using free signal:', error);
      return { success: false, reason: 'Error processing request' };
    }
  }
  
  // Reset a user's free signals (when they subscribe)
  resetFreeSignals(userId) {
    try {
      // When a user subscribes, we can reset their signal count
      localStorage.removeItem(`user_signals_${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error resetting free signals:', error);
      return { success: false, error: error.message };
    }
  }
  
  async startSubscription(plan, userId) {
    try {
      // Detect platform for payment method
      const deviceInfo = deviceDetection();
      const platform = deviceInfo.isIOS ? 'ios' : 
                      deviceInfo.isAndroid ? 'android' : 'web';
                      
      // Select payment handler based on platform
      const handler = this.paymentHandlers[platform] || this.paymentHandlers.web;
      const result = await handler(plan);
      
      if (result.success) {
        // Reset free signals when user subscribes
        this.resetFreeSignals(userId);
        
        // Update subscription state
        this.subscriptionState.isSubscribed = true;
        this.subscriptionState.plan = plan;
        this.subscriptionState.expiryDate = result.expiryDate;
        this.subscriptionState.paymentMethod = result.paymentMethod;
        this.subscriptionState.subscriptionId = result.subscriptionId;
        this.saveSubscriptionState();
        
        return { success: true, subscription: this.subscriptionState };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error starting subscription:', error);
      return { success: false, error: error.message };
    }
  }
  
  async cancelSubscription() {
    // Logic to cancel subscription
    try {
      // API call to cancel subscription with payment provider
      const result = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: this.subscriptionState.subscriptionId
        })
      });
      
      if (result.ok) {
        // Update local state
        this.subscriptionState.isSubscribed = false;
        this.subscriptionState.plan = null;
        this.subscriptionState.expiryDate = null;
        this.subscriptionState.subscriptionId = null;
        this.saveSubscriptionState();
        return { success: true };
      }
      
      const data = await result.json();
      return { success: false, error: data.message };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Platform-specific payment handlers
  async handleGooglePayment(plan) {
    // Google Pay implementation
    // For testing, we'll return a mock successful result
    return {
      success: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentMethod: 'google_pay',
      subscriptionId: 'gp_' + Math.random().toString(36).substring(2, 15)
    };
  }
  
  async handleApplePayment(plan) {
    // Apple Pay implementation
    return {
      success: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentMethod: 'apple_pay',
      subscriptionId: 'ap_' + Math.random().toString(36).substring(2, 15)
    };
  }
  
  async handleWebPayment(plan) {
    // Stripe/PayPal implementation for web
    return {
      success: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentMethod: 'stripe',
      subscriptionId: 'st_' + Math.random().toString(36).substring(2, 15)
    };
  }
  
  // Check if subscription is about to expire
  isSubscriptionExpiringSoon() {
    if (!this.subscriptionState.isSubscribed || !this.subscriptionState.expiryDate) {
      return false;
    }
    
    const expiryDate = new Date(this.subscriptionState.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 3; // Consider "soon" as 3 days or less
  }
  
  // Get subscription details for display
  getFormattedSubscriptionDetails() {
    if (!this.subscriptionState.isSubscribed) {
      return { status: 'Not subscribed' };
    }
    
    const expiryDate = new Date(this.subscriptionState.expiryDate);
    
    return {
      status: 'Active',
      plan: this.subscriptionState.plan,
      expiryDate: expiryDate.toLocaleDateString(),
      daysRemaining: Math.max(0, Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24))),
      paymentMethod: this.subscriptionState.paymentMethod
    };
  }
}

export default new SubscriptionService();