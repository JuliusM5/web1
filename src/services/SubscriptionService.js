// src/services/SubscriptionService.js
// Simplified subscription service without external dependencies

import dataProvider from '../data/dataProvider';
import stripeService from './stripeService';
import analyticsService from './analyticsService';
import { captureError } from '../utils/errorMonitoring';

class SubscriptionService {
  constructor() {
    this.currentSubscription = null;
    this.deviceId = this.getOrCreateDeviceId();
  }

  // Get or create a unique device ID for this browser
  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Create a new subscription using Stripe
  async createSubscription(planId, paymentMethodId) {
    try {
      // Create a subscription with Stripe (or mock it for testing)
      const stripeSubscription = paymentMethodId 
        ? await stripeService.createSubscription(paymentMethodId, planId)
        : stripeService.mockCreateSubscription(planId);
      
      // Generate a unique access code
      const accessCode = this.generateAccessCode();
      
      // Store the subscription in our database
      const subscription = await dataProvider.createSubscription({
        accessCode,
        platform: 'web',
        originalTransactionId: stripeSubscription.id,
        status: 'active',
        expiresAt: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        planId,
        deviceId: this.deviceId,
        activations: [
          {
            deviceId: this.deviceId,
            platform: 'web',
            activatedAt: new Date().toISOString()
          }
        ]
      });
      
      // Set as current subscription
      this.currentSubscription = subscription;
      localStorage.setItem('accessCode', accessCode);
      
      // Track the subscription event
      analyticsService.trackSubscriptionStarted(
        planId, 
        stripeSubscription.plan.amount / 100,
        'web'
      );
      
      return subscription;
    } catch (error) {
      captureError(error, { context: 'Creating subscription' });
      throw error;
    }
  }

  // Activate a subscription using an access code
  async activateWithCode(accessCode) {
    try {
      // Check if the code is valid
      const subscription = await dataProvider.getSubscriptionByAccessCode(accessCode);
      
      if (!subscription) {
        throw new Error('Invalid access code');
      }
      
      if (subscription.status !== 'active') {
        throw new Error('Subscription is not active');
      }
      
      // If the subscription has an expiration date, check if it's expired
      if (subscription.expiresAt) {
        const expiresAt = new Date(subscription.expiresAt);
        if (expiresAt < new Date()) {
          await dataProvider.updateSubscription(accessCode, { status: 'expired' });
          throw new Error('Subscription has expired');
        }
      }
      
      // Activate the subscription on this device
      const activatedSubscription = await dataProvider.activateSubscriptionOnDevice(
        accessCode,
        this.deviceId,
        'web'
      );
      
      // Set as current subscription
      this.currentSubscription = activatedSubscription;
      localStorage.setItem('accessCode', accessCode);
      
      // Track code activation
      const daysRemaining = Math.ceil(
        (new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
      );
      analyticsService.trackCodeActivated('web', daysRemaining);
      
      return activatedSubscription;
    } catch (error) {
      captureError(error, { context: 'Activating subscription with code' });
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription() {
    try {
      if (!this.currentSubscription) {
        throw new Error('No active subscription');
      }
      
      // Cancel with Stripe if it's a web subscription
      if (this.currentSubscription.platform === 'web' && 
          this.currentSubscription.originalTransactionId) {
        await stripeService.cancelSubscription(this.currentSubscription.originalTransactionId);
      }
      
      // Update subscription status in database
      const updatedSubscription = await dataProvider.updateSubscription(
        this.currentSubscription.accessCode,
        { status: 'cancelled' }
      );
      
      // Track cancellation
      const createdAt = new Date(this.currentSubscription.createdAt);
      const daysSinceSubscribed = Math.floor(
        (new Date() - createdAt) / (1000 * 60 * 60 * 24)
      );
      
      analyticsService.trackSubscriptionCancelled(
        this.currentSubscription.planId,
        'user_initiated',
        daysSinceSubscribed
      );
      
      // Clear current subscription
      this.currentSubscription = null;
      localStorage.removeItem('accessCode');
      
      return updatedSubscription;
    } catch (error) {
      captureError(error, { context: 'Cancelling subscription' });
      throw error;
    }
  }

  // Check current subscription status
  async checkSubscription() {
    try {
      const accessCode = localStorage.getItem('accessCode');
      
      if (!accessCode) {
        return null;
      }
      
      const subscription = await dataProvider.getSubscriptionByAccessCode(accessCode);
      
      if (!subscription || subscription.status !== 'active') {
        localStorage.removeItem('accessCode');
        this.currentSubscription = null;
        return null;
      }
      
      // Check if subscription is expired
      if (subscription.expiresAt) {
        const expiresAt = new Date(subscription.expiresAt);
        if (expiresAt < new Date()) {
          // Update subscription status to expired
          await dataProvider.updateSubscription(accessCode, { status: 'expired' });
          localStorage.removeItem('accessCode');
          this.currentSubscription = null;
          return null;
        }
      }
      
      this.currentSubscription = subscription;
      return subscription;
    } catch (error) {
      captureError(error, { context: 'Checking subscription' });
      // Return null instead of throwing, to prevent app crashes on status checks
      return null;
    }
  }

  // Check if a specific feature is available with the current subscription
  async isFeatureAvailable(featureName) {
    try {
      const subscription = await this.checkSubscription();
      
      if (!subscription) {
        return false;
      }
      
      // In a real implementation, you would check if the specific plan includes this feature
      // For now, we'll assume all subscriptions include all premium features
      
      // Track premium feature usage
      analyticsService.trackPremiumFeatureUsed(featureName);
      
      return true;
    } catch (error) {
      captureError(error, { context: 'Checking feature availability' });
      return false;
    }
  }

  // Get current subscription
  async getCurrentSubscription() {
    return await this.checkSubscription();
  }

  // Generate a random access code (format: XXXX-XXXX-XXXX)
  generateAccessCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 12; i++) {
      if (i === 4 || i === 8) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
}

export default new SubscriptionService();