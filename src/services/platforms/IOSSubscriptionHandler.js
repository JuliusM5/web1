// src/services/platforms/IOSSubscriptionHandler.js

import { Platform } from 'react-native';
import * as StoreKit from 'react-native-iap';

/**
 * iOS specific subscription handling using StoreKit
 */
export class IOSSubscriptionHandler {
  constructor() {
    this.products = [];
    this.isInitialized = false;
    this.productIds = [
      'com.yourapp.monthly_premium',
      'com.yourapp.yearly_premium'
    ];
  }

  /**
   * Initialize StoreKit
   */
  async initialize() {
    if (Platform.OS !== 'ios') return;
    
    try {
      await StoreKit.initConnection();
      this.isInitialized = true;
      
      // Pre-load product information
      await this.getProducts();
      
      // Set up purchase listener
      this.purchaseUpdateSubscription = StoreKit.purchaseUpdatedListener(
        (purchase) => {
          // Handle purchase updates in real-time
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            // Finish the transaction after saving the receipt
            StoreKit.finishTransaction(purchase);
          }
        }
      );
      
      this.purchaseErrorSubscription = StoreKit.purchaseErrorListener(
        (error) => {
          console.error('Purchase error:', error);
        }
      );
      
      return true;
    } catch (error) {
      console.error('StoreKit initialization failed:', error);
      return false;
    }
  }

  /**
   * Get available subscription products from App Store
   */
  async getProducts() {
    if (!this.isInitialized) await this.initialize();
    
    try {
      this.products = await StoreKit.getSubscriptions(this.productIds);
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
      const purchase = await StoreKit.requestSubscription(productId);
      
      if (purchase && purchase.transactionReceipt) {
        return {
          success: true,
          receipt: purchase.transactionReceipt,
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
  async verifyReceipt(receipt, productId) {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Check if receipt is still valid (basic validation)
      // This uses StoreKit's validation capabilities
      const validationResult = await StoreKit.validateReceiptIos({
        receiptBody: receipt,
      });
      
      if (validationResult && validationResult.isValid) {
        // Find the matching subscription in the validation result
        const subscription = validationResult.purchases.find(
          p => p.productId === productId && new Date(p.expirationDate) > new Date()
        );
        
        if (subscription) {
          return {
            isValid: true,
            expiresAt: subscription.expirationDate
          };
        }
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
      // Get available purchases from iOS
      const availablePurchases = await StoreKit.getAvailablePurchases();
      
      if (availablePurchases && availablePurchases.length > 0) {
        // Filter for valid subscriptions
        const subscriptions = await Promise.all(
          availablePurchases.map(async (purchase) => {
            const verification = await this.verifyReceipt(
              purchase.transactionReceipt,
              purchase.productId
            );
            
            return {
              productId: purchase.productId,
              receipt: purchase.transactionReceipt,
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
    
    // End StoreKit connection
    StoreKit.endConnection();
  }
}