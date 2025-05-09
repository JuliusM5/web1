// src/api/subscriptionApi.js

import { API_BASE_URL } from '../config';

/**
 * API client for subscription-related operations
 */
const subscriptionApi = {
  /**
   * Create a checkout session
   * @param {Object} params - Checkout parameters
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(params) {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
      return this.mockCreateCheckoutSession(params);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  /**
   * Verify a checkout session
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyCheckoutSession(sessionId) {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
      return this.mockVerifyCheckoutSession(sessionId);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/verify/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying checkout session:', error);
      throw error;
    }
  },
  
  /**
   * Cancel a subscription
   * @param {string} token - Subscription token
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(token) {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
      return this.mockCancelSubscription(token);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },
  
  /**
   * Verify a mobile access code
   * @param {string} code - Mobile access code
   * @returns {Promise<Object>} Verification result
   */
  async verifyMobileCode(code) {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
      return this.mockVerifyMobileCode(code);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/mobile-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying mobile code:', error);
      throw error;
    }
  },
  
  // Mock implementations for development
  mockCreateCheckoutSession(params) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          id: 'cs_mock_' + Date.now(),
          url: '/subscription/mock-checkout'
        });
      }, 500);
    });
  },
  
  mockVerifyCheckoutSession(sessionId) {
    return new Promise(resolve => {
      setTimeout(() => {
        const token = 'tok_' + Date.now();
        const mobileCode = 'MOCK-CODE-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        resolve({
          success: true,
          accessToken: token,
          mobileAccessCode: mobileCode,
          plan: 'monthly_premium',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }, 500);
    });
  },
  
  mockCancelSubscription(token) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Subscription cancelled successfully'
        });
      }, 500);
    });
  },
  
  mockVerifyMobileCode(code) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (code === 'INVALID-CODE') {
          resolve({
            valid: false,
            error: 'Invalid code'
          });
          return;
        }
        
        resolve({
          valid: true,
          accessToken: 'tok_mobile_' + Date.now(),
          plan: 'monthly_premium',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }, 500);
    });
  }
};

export default subscriptionApi;