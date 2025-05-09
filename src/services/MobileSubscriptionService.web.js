// src/services/MobileSubscriptionService.web.js

/**
 * Web implementation of MobileSubscriptionService
 * This version is used when running in a browser environment
 */
class MobileSubscriptionService {
  constructor() {
    this.storage = window.localStorage;
    this.isWeb = true;
  }

  /**
   * Initialize the subscription service
   */
  async initialize() {
    // Nothing to initialize in web version
    return { success: true };
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus() {
    try {
      // Check for a web receipt (from code activation)
      const webReceipt = this.storage.getItem('mobile_web_receipt');
      
      if (webReceipt) {
        try {
          const receiptData = JSON.parse(webReceipt);
          const currentTime = new Date().getTime();
          
          // Check if the receipt has an expiry date
          if (receiptData.expiresAt && new Date(receiptData.expiresAt) > new Date()) {
            return {
              isSubscribed: true,
              plan: receiptData.plan || 'premium',
              expiresAt: receiptData.expiresAt,
              source: 'web_code'
            };
          }
        } catch (err) {
          console.error('Error parsing web receipt:', err);
          // Continue to check other methods
        }
      }
      
      // Check for a web token in localStorage
      const token = this.storage.getItem('subscription_token');
      const expiryDate = this.storage.getItem('subscription_expiry');
      
      if (token && expiryDate && new Date(expiryDate) > new Date()) {
        return {
          isSubscribed: true,
          plan: this.storage.getItem('subscription_plan') || 'premium',
          expiresAt: expiryDate,
          source: 'web'
        };
      }
      
      // No valid subscription found
      return {
        isSubscribed: false,
        plan: null,
        expiresAt: null
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isSubscribed: false,
        error: error.message
      };
    }
  }

  /**
   * Activate subscription with web access code
   */
  async activateWithCode(code) {
    try {
      // Validate code format
      if (!code || !/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
        return { success: false, error: 'Invalid code format' };
      }
      
      // In a real implementation, this would make an API call
      // For now, we'll simulate a successful activation
      const response = await fetch('/api/mobile/activate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          platform: 'web'
        })
      });
      
      // For development, simulate success if API is not available
      let result;
      try {
        result = await response.json();
      } catch (err) {
        console.warn('API not available, using mock response');
        
        // Generate mock expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        result = {
          success: true,
          webReceipt: JSON.stringify({
            accessToken: 'mock_token_' + Date.now(),
            code: code,
            expiresAt: expiryDate.toISOString(),
            plan: 'premium'
          }),
          plan: 'premium',
          expiresAt: expiryDate.toISOString()
        };
      }
      
      if (!result.success) {
        return result; // Pass through the error
      }
      
      // Store the receipt
      this.storage.setItem('mobile_web_receipt', result.webReceipt);
      
      // Also store standard web tokens for compatibility
      const receiptData = JSON.parse(result.webReceipt);
      this.storage.setItem('subscription_token', receiptData.accessToken);
      this.storage.setItem('subscription_expiry', result.expiresAt);
      this.storage.setItem('subscription_plan', result.plan);
      
      return { success: true };
    } catch (error) {
      console.error('Code activation error:', error);
      return { success: false, error: error.message || 'Failed to activate code' };
    }
  }

  /**
   * Restore purchases from app store
   */
  async restorePurchases() {
    // Not applicable for web
    return { success: false, message: 'Not applicable in web environment' };
  }
}

export default new MobileSubscriptionService();