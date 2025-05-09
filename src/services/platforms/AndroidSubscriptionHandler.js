// src/services/platforms/AndroidSubscriptionHandler.js

import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';

/**
 * Android specific subscription handling using Google Play Billing
 */
export class AndroidSubscriptionHandler {
  constructor() {
    this.products = [];
    this.isInitialized = false;
    this.productIds = [
      'com.yourapp.monthly_premium',
      'com.yourapp.yearly_premium'
    ];
  }

  /**
   * Initialize Google Play Billing
   */
  async initialize() {
    if (Platform.OS !== 'android') return;
    
    try {
      await RNIap.initConnection();
      this.isInitialized = true;
      
      // Pre-load product information
      await this.getProducts();
      
      // Set up purchase listeners
      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
        async (purchase) => {
          // For subscriptions, we need to acknowledge the purchase
          if (purchase) {
            try {
              const acknowledgePurchase = purchase.purchaseToken 
                ? await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
                : true;
              
              if (acknowledgePurchase) {
                console.log('Purchase acknowledged successfully');
              }
            } catch (ackErr) {
              console.error('Error acknowledging purchase:', ackErr);
            }
          }
        }
      );
      
      this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
        (error) => {
          console.error('Purchase error:', error);
        }
      );
      
      return true;
    } catch (error) {
      console.error('Google Play Billing initialization failed:', error);
      return false;
    }
  }

  /**
   * Get available subscription products from Google Play
   */
  async getProducts() {
    if (!this.isInitialized) await this.initialize();
    
    try {
      this.products = await RNIap.getSubscriptions(this.productIds);
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(productId) {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Request the purchase
      const purchase = await RNIap.requestSubscription(productId);
      
      if (purchase) {
        // For Android, we'll use the purchase token as our "receipt"
        return {
          success: true,
          receipt: JSON.stringify({
            packageName: purchase.packageNameAndroid,
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
            purchaseTime: purchase.transactionDate
          }),
          productId
        };
      }
      
      return { success: false, error: 'Purchase did not complete' };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Verify receipt locally (basic checks)
   * For true validation, use the server verification
   */
  async verifyReceipt(receiptString, productId) {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Parse the receipt string back to an object
      const receipt = JSON.parse(receiptString);
      
      // Get all active purchases
      const purchases = await RNIap.getAvailablePurchases();
      
      // Find this specific purchase
      const matchingPurchase = purchases.find(
        p => p.productId === productId && p.purchaseToken === receipt.purchaseToken
      );
      
      if (matchingPurchase) {
        // Check if the purchase is still active
        // For subscriptions, check purchaseState === 0 (purchased)
        // and check that it hasn't been cancelled or expired
        if (matchingPurchase.purchaseState === 0 && !matchingPurchase.isAcknowledged) {
          // Acknowledge if not already acknowledged
          await RNIap.acknowledgePurchaseAndroid(matchingPurchase.purchaseToken);
        }
        
        // For Google Play subscriptions, we need to calculate expiry date
        // based on purchase date and subscription period
        const purchaseDate = new Date(matchingPurchase.transactionDate);
        let expiresAt;
        
        // Calculate expiry based on product ID (simplified example)
        if (productId.includes('monthly')) {
          expiresAt = new Date(purchaseDate);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (productId.includes('yearly')) {
          expiresAt = new Date(purchaseDate);
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        
        return {
          isValid: true,
          expiresAt: expiresAt?.toISOString()
        };
      }
      
      return { isValid: false };
    } catch (error) {
      console.error('Receipt verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Get all past purchases
      const purchases = await RNIap.getAvailablePurchases();
      
      if (purchases && purchases.length > 0) {
        // Filter for subscription purchases and create receipt objects
        const subscriptions = await Promise.all(
          purchases
            .filter(p => this.productIds.includes(p.productId))
            .map(async (purchase) => {
              // Create a receipt string similar to our purchase format
              const receipt = JSON.stringify({
                packageName: purchase.packageNameAndroid,
                productId: purchase.productId,
                purchaseToken: purchase.purchaseToken,
                purchaseTime: purchase.transactionDate
              });
              
              // Verify the receipt to check if it's still active
              const verification = await this.verifyReceipt(receipt, purchase.productId);
              
              return {
                productId: purchase.productId,
                receipt,
                isActive: verification.isValid,
                expiresAt: verification.expiresAt
              };
            })
        );
        
        return {
          success: true,
          purchases: subscriptions
        };
      }
      
      return { success: true, purchases: [] };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cleanup method to remove listeners
   */
  cleanup() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
    
    // End IAP connection
    RNIap.endConnection();
  }
}