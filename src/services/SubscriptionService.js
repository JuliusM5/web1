// src/services/subscriptionService.js

const TokenizedSubscription = require('../models/TokenizedSubscription');
// Or use the in-memory version for development
// const TokenizedSubscription = require('../models/inMemoryTokenizedSubscription');

const appleReceiptVerifier = require('./platforms/appleReceiptVerifier');
const googleReceiptVerifier = require('./platforms/googleReceiptVerifier');

/**
 * Service for managing accountless subscriptions
 */
class SubscriptionService {
  /**
   * Create a new subscription from web purchase
   * @param {string} email - User's email (only for receipts)
   * @param {string} plan - Subscription plan ID
   * @param {string} paymentId - Reference to payment processor's transaction ID
   * @returns {Promise<Object>} - Created subscription details
   */
  async createSubscription(email, plan, paymentId) {
    try {
      // Calculate expiry date
      const expiresAt = this.calculateExpiryDate(plan);
      
      // For MongoDB implementation
      // Create new subscription document
      const subscription = await TokenizedSubscription.create({
        email,
        accessToken: TokenizedSubscription.generateToken(),
        mobileAccessCode: TokenizedSubscription.generateMobileAccessCode(),
        plan,
        expiresAt,
        paymentId,
        active: true
      });
      
      return {
        success: true,
        accessToken: subscription.accessToken,
        mobileAccessCode: subscription.mobileAccessCode,
        expiresAt: subscription.expiresAt
      };
      
      // For in-memory implementation
      /*
      return await TokenizedSubscription.create({
        email,
        plan,
        expiresAt,
        paymentId
      });
      */
    } catch (error) {
      console.error('Failed to create subscription:', error);
      return { success: false, error: 'Subscription creation failed' };
    }
  }

  /**
   * Verify a subscription token
   * @param {string} token - Subscription access token
   * @returns {Promise<Object>} - Verification result
   */
  async verifyToken(token) {
    try {
      return await TokenizedSubscription.verifyToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  /**
   * Verify an Apple receipt
   * @param {string} receipt - Apple receipt data
   * @returns {Promise<Object>} - Verification result
   */
  async verifyAppleReceipt(receipt) {
    try {
      // Use Apple's verification service
      const verificationResult = await appleReceiptVerifier.verify(receipt);
      
      if (verificationResult.valid) {
        // Store the verified receipt for future reference
        // This could be in a separate collection/table
        
        return {
          verified: true,
          expiresAt: verificationResult.expiresAt,
          productId: verificationResult.productId
        };
      }
      
      return { verified: false };
    } catch (error) {
      console.error('Apple receipt verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Verify a Google Play receipt
   * @param {string|Object} receipt - Google Play receipt data
   * @returns {Promise<Object>} - Verification result
   */
  async verifyGoogleReceipt(receipt) {
    try {
      // Parse the receipt if it's a string
      const receiptData = typeof receipt === 'string' ? JSON.parse(receipt) : receipt;
      
      // Use Google's API to verify
      const verificationResult = await googleReceiptVerifier.verify(
        receiptData.packageName,
        receiptData.productId,
        receiptData.purchaseToken
      );
      
      if (verificationResult.valid) {
        // Store the verified receipt for future reference
        
        return {
          verified: true,
          expiresAt: verificationResult.expiresAt,
          productId: receiptData.productId
        };
      }
      
      return { verified: false };
    } catch (error) {
      console.error('Google receipt verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Activate subscription on mobile with web access code
   * @param {string} accessCode - Mobile access code from web purchase
   * @param {string} platform - Mobile platform ('ios' or 'android')
   * @returns {Promise<Object>} - Activation result
   */
  async activateWithCode(accessCode, platform) {
    try {
      // Find the subscription by mobile access code
      const verification = await TokenizedSubscription.verifyMobileCode(accessCode);
      
      if (!verification.valid) {
        return { success: false, error: 'Invalid or expired code' };
      }
      
      // Create a "web receipt" that can be stored on the mobile device
      const webReceipt = JSON.stringify({
        accessToken: verification.accessToken,
        code: accessCode,
        platform
      });
      
      return {
        success: true,
        webReceipt,
        plan: verification.plan,
        expiresAt: verification.expiresAt
      };
    } catch (error) {
      console.error('Code activation failed:', error);
      return { success: false, error: 'Activation failed' };
    }
  }

  /**
   * Verify a "web receipt" from mobile device
   * @param {string|Object} webReceipt - Web receipt data
   * @returns {Promise<Object>} - Verification result
   */
  async verifyWebReceipt(webReceipt) {
    try {
      // Parse the receipt if it's a string
      const receiptData = typeof webReceipt === 'string' ? JSON.parse(webReceipt) : webReceipt;
      
      // Verify the access token
      return await this.verifyToken(receiptData.accessToken);
    } catch (error) {
      console.error('Web receipt verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Cancel a subscription
   * @param {string} token - Subscription token
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelSubscription(token) {
    try {
      // For MongoDB implementation
      const subscription = await TokenizedSubscription.findOne({ accessToken: token });
      
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }
      
      subscription.active = false;
      await subscription.save();
      
      return { success: true };
      
      // For in-memory implementation
      /*
      return await TokenizedSubscription.cancelSubscription(token);
      */
    } catch (error) {
      console.error('Cancellation failed:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  /**
   * Calculate subscription expiry date based on plan
   * @param {string} plan - Subscription plan ID
   * @returns {Date} - Expiry date
   */
  calculateExpiryDate(plan) {
    const now = new Date();
    
    if (plan === 'monthly_premium') {
      return new Date(now.setMonth(now.getMonth() + 1));
    } else if (plan === 'yearly_premium') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      // Default to 1 month if plan is unknown
      return new Date(now.setMonth(now.getMonth() + 1));
    }
  }
}

module.exports = new SubscriptionService();