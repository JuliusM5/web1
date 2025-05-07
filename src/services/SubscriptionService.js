// src/services/subscriptionService.js

import authService from './authService';

class SubscriptionService {
  constructor() {
    this.apiUrl = '/api/subscriptions';
    this.plans = {
      MONTHLY: {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 4.99,
        interval: 'month',
        features: [
          'Unlimited flight alerts',
          'No ads',
          'Priority notifications',
          'Price history graphs'
        ]
      },
      YEARLY: {
        id: 'yearly',
        name: 'Annual Plan',
        price: 39.99,
        interval: 'year',
        features: [
          'Unlimited flight alerts',
          'No ads',
          'Priority notifications',
          'Price history graphs',
          'Personalized deal recommendations',
          '2 months free'
        ]
      }
    };
  }
  
  // Get available subscription plans
  getPlans() {
    return Object.values(this.plans);
  }
  
  // Get current subscription status
  async getSubscriptionStatus() {
    try {
      const response = await fetch(this.apiUrl, {
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      
      // Check if stored locally
      const storedStatus = localStorage.getItem('subscription_status');
      if (storedStatus) {
        try {
          return JSON.parse(storedStatus);
        } catch (e) {
          console.error('Error parsing stored subscription status:', e);
        }
      }
      
      // Default status if nothing available
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        freeAlertsUsed: 0,
        freeAlertsLimit: 3
      };
    }
  }
  
  // Start a new subscription
  async subscribe(planId, paymentMethod) {
    try {
      const response = await fetch(`${this.apiUrl}/create`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          planId,
          paymentMethod
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Subscription creation failed');
      }
      
      const subscriptionData = await response.json();
      
      // Store locally for offline access
      localStorage.setItem('subscription_status', JSON.stringify({
        isActive: true,
        plan: subscriptionData.plan,
        expiresAt: subscriptionData.expiresAt,
        freeAlertsUsed: 0,
        freeAlertsLimit: 3
      }));
      
      return subscriptionData;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }
  
  // Cancel current subscription
  async cancelSubscription() {
    try {
      const response = await fetch(`${this.apiUrl}/cancel`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Subscription cancellation failed');
      }
      
      const result = await response.json();
      
      // Update local storage
      const storedStatus = localStorage.getItem('subscription_status');
      if (storedStatus) {
        try {
          const status = JSON.parse(storedStatus);
          status.isActive = false;
          localStorage.setItem('subscription_status', JSON.stringify(status));
        } catch (e) {
          console.error('Error updating stored subscription status:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw error;
    }
  }
  
  // Check if user has any free alerts remaining
  async hasFreeAlertsRemaining() {
    const status = await this.getSubscriptionStatus();
    
    if (status.isActive) {
      return true; // Subscribed users have unlimited alerts
    }
    
    return status.freeAlertsUsed < status.freeAlertsLimit;
  }
  
  // Use a free alert
  async useFreeAlert() {
    try {
      const response = await fetch(`${this.apiUrl}/use-free-alert`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to use free alert');
      }
      
      const result = await response.json();
      
      // Update local storage
      const storedStatus = localStorage.getItem('subscription_status');
      if (storedStatus) {
        try {
          const status = JSON.parse(storedStatus);
          status.freeAlertsUsed = result.freeAlertsUsed;
          localStorage.setItem('subscription_status', JSON.stringify(status));
        } catch (e) {
          console.error('Error updating stored free alerts:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error using free alert:', error);
      
      // Fallback to updating locally if offline
      if (!navigator.onLine) {
        const storedStatus = localStorage.getItem('subscription_status');
        if (storedStatus) {
          try {
            const status = JSON.parse(storedStatus);
            if (status.freeAlertsUsed < status.freeAlertsLimit) {
              status.freeAlertsUsed++;
              localStorage.setItem('subscription_status', JSON.stringify(status));
              return {
                success: true,
                freeAlertsUsed: status.freeAlertsUsed,
                freeAlertsLimit: status.freeAlertsLimit
              };
            }
          } catch (e) {
            console.error('Error updating stored free alerts:', e);
          }
        }
      }
      
      throw error;
    }
  }
  
  // Get remaining free alerts count
  async getRemainingFreeAlerts() {
    const status = await this.getSubscriptionStatus();
    
    if (status.isActive) {
      return Infinity; // Subscribed users have unlimited alerts
    }
    
    return Math.max(0, status.freeAlertsLimit - status.freeAlertsUsed);
  }
  
  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.apiUrl}/payment-methods`, {
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to get payment methods');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return { paymentMethods: [] };
    }
  }
  
  // Add payment method
  async addPaymentMethod(paymentDetails) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-methods`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(paymentDetails)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add payment method');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
  
  // Get subscription history
  async getSubscriptionHistory() {
    try {
      const response = await fetch(`${this.apiUrl}/history`, {
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to get subscription history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting subscription history:', error);
      return { history: [] };
    }
  }
  
  // Apply promo code
  async applyPromoCode(code) {
    try {
      const response = await fetch(`${this.apiUrl}/promo`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid promo code');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  }
  
  // Create mock payment method UI data for frontend
  getMockPaymentUI() {
    // In a real implementation, this would integrate with Stripe, PayPal, etc.
    return {
      paymentMethods: [
        { type: 'credit_card', name: 'Visa', iconUrl: '/icons/visa.svg' },
        { type: 'credit_card', name: 'Mastercard', iconUrl: '/icons/mastercard.svg' },
        { type: 'paypal', name: 'PayPal', iconUrl: '/icons/paypal.svg' },
        { type: 'apple_pay', name: 'Apple Pay', iconUrl: '/icons/apple-pay.svg' },
        { type: 'google_pay', name: 'Google Pay', iconUrl: '/icons/google-pay.svg' }
      ]
    };
  }
}

export default new SubscriptionService();