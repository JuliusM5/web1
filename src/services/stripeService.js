// src/services/stripeService.js
// Simplified Stripe service using the global Stripe.js

import ApiClient from './ApiClient';
import { captureError } from '../utils/errorMonitoring';

class StripeService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.apiKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || '';
    this.initialized = false;
  }

  // Load Stripe.js and initialize
  async init() {
    if (this.initialized) return;
    
    try {
      // Check if Stripe.js is already loaded
      if (window.Stripe) {
        this.stripe = window.Stripe(this.apiKey);
        this.initialized = true;
        return;
      }
      
      // Load Stripe.js dynamically
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        
        script.onload = () => {
          this.stripe = window.Stripe(this.apiKey);
          this.initialized = true;
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Stripe.js:', error);
          reject(new Error('Failed to load Stripe.js'));
        };
        
        document.body.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      captureError(error, { context: 'Stripe initialization' });
      throw error;
    }
  }

  // Make sure Stripe is initialized before using it
  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
    
    if (!this.stripe) {
      throw new Error('Stripe failed to initialize');
    }
  }

  // Create a payment method from a card element
  async createPaymentMethod(cardElement, billingDetails) {
    await this.ensureInitialized();
    
    try {
      const result = await this.stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails
      });
      
      if (result.error) {
        throw result.error;
      }
      
      return result.paymentMethod;
    } catch (error) {
      console.error('Failed to create payment method:', error);
      captureError(error, { context: 'Create payment method' });
      throw error;
    }
  }

  // Create a subscription through API
  async createSubscription(paymentMethodId, planId) {
    try {
      // We'll use our API client to call our backend
      const response = await ApiClient.post('/api/subscriptions', {
        paymentMethodId,
        planId
      });
      
      return response;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      captureError(error, { context: 'Create subscription' });
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await ApiClient.post(`/api/subscriptions/${subscriptionId}/cancel`);
      return response;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      captureError(error, { context: 'Cancel subscription' });
      throw error;
    }
  }

  // For displaying card input in the UI
  createCardElement(options = {}) {
    if (!this.stripe) {
      console.error('Stripe not initialized');
      return null;
    }
    
    if (!this.elements) {
      this.elements = this.stripe.elements();
    }
    
    // Default styling options
    const defaultOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: 'Arial, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    };
    
    return this.elements.create('card', {
      ...defaultOptions,
      ...options
    });
  }

  // Mock method for testing without Stripe
  mockCreateSubscription(planId) {
    return {
      id: `sub_mock_${Math.random().toString(36).substring(2, 11)}`,
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      plan: {
        id: planId,
        amount: planId === 'premium_monthly' ? 999 : 9999 // $9.99 or $99.99
      }
    };
  }
}

export default new StripeService();