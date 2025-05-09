// src/services/MobileSubscriptionService.js

/**
 * Service for handling mobile platform (iOS/Android) subscriptions
 * without requiring user accounts
 */
import { Platform } from 'react-native';
import { storageKeys } from '../constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileSubscriptionService {
  constructor() {
    // We'll initialize the appropriate platform-specific subscription handler
    this.platformHandler = null;
    this.initializePlatformHandler();
  }

  async initializePlatformHandler() {
    if (Platform.OS === 'ios') {
      // Dynamically import to avoid bundling iOS code on Android
      const { IOSSubscriptionHandler } = await import('./platforms/IOSSubscriptionHandler');
      this.platformHandler = new IOSSubscriptionHandler();
    } else if (Platform.OS === 'android') {
      const { AndroidSubscriptionHandler } = await import('./platforms/AndroidSubscriptionHandler');
      this.platformHandler = new AndroidSubscriptionHandler();
    }
    
    // Initialize once imported
    if (this.platformHandler) {
      await this.platformHandler.initialize();
    }
  }

  /**
   * Get available subscription products
   */
  async getProducts() {
    if (!this.platformHandler) await this.initializePlatformHandler();
    return await this.platformHandler.getProducts();
  }

  /**
   * Purchase a subscription and store the receipt
   */
  async purchaseSubscription(productId) {
    if (!this.platformHandler) await this.initializePlatformHandler();
    
    try {
      const purchaseResult = await this.platformHandler.purchaseSubscription(productId);
      
      if (purchaseResult.success) {
        // Store receipt locally for offline verification
        await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_RECEIPT, purchaseResult.receipt);
        await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_PRODUCT_ID, productId);
        
        // Verify the receipt with server when online
        const verificationResult = await this.verifyReceipt(purchaseResult.receipt);
        return { 
          success: true, 
          verified: verificationResult.verified,
          expiresAt: verificationResult.expiresAt,
          productId 
        };
      }
      
      return { success: false, error: purchaseResult.error };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Verify subscription status
   */
  async verifySubscription() {
    if (!this.platformHandler) await this.initializePlatformHandler();
    
    try {
      // First try local receipt verification with platform
      const receipt = await AsyncStorage.getItem(storageKeys.SUBSCRIPTION_RECEIPT);
      const productId = await AsyncStorage.getItem(storageKeys.SUBSCRIPTION_PRODUCT_ID);
      
      if (!receipt || !productId) {
        return { isSubscribed: false };
      }
      
      // Using platform's own verification first (works offline)
      const localVerification = await this.platformHandler.verifyReceipt(receipt, productId);
      
      if (localVerification.isValid) {
        // If online, also verify with server for additional security
        try {
          const serverVerification = await this.verifyReceipt(receipt);
          return { 
            isSubscribed: serverVerification.verified, 
            expiresAt: serverVerification.expiresAt,
            plan: productId
          };
        } catch (e) {
          // If server unreachable, use local verification result
          console.log('Using local verification due to server error:', e);
          return { 
            isSubscribed: true, 
            expiresAt: localVerification.expiresAt,
            plan: productId,
            isOfflineVerified: true
          };
        }
      }
      
      return { isSubscribed: false };
    } catch (error) {
      console.error('Verification failed:', error);
      return { isSubscribed: false, error: error.message };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    if (!this.platformHandler) await this.initializePlatformHandler();
    
    try {
      const restoredPurchases = await this.platformHandler.restorePurchases();
      
      if (restoredPurchases.success && restoredPurchases.purchases.length > 0) {
        // Find the most recent active subscription
        const activeSubscription = restoredPurchases.purchases.find(p => p.isActive);
        
        if (activeSubscription) {
          await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_RECEIPT, activeSubscription.receipt);
          await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_PRODUCT_ID, activeSubscription.productId);
          
          return { 
            success: true, 
            isSubscribed: true,
            productId: activeSubscription.productId
          };
        }
      }
      
      return { success: restoredPurchases.success, isSubscribed: false };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify receipt with the server
   * This adds an extra layer of security beyond the platform's verification
   */
  async verifyReceipt(receipt) {
    // Make API call to verify receipt with Apple/Google servers
    try {
      const platform = Platform.OS;
      const response = await fetch(`https://yourapi.com/verify-${platform}-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Server verification failed:', error);
      throw error;
    }
  }
  
  /**
   * Cross-platform: activate subscription with code from web
   * This allows users who purchased on web to unlock mobile features
   */
  async activateWithCode(accessCode) {
    try {
      const response = await fetch('https://yourapi.com/activate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, platform: Platform.OS })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store "emulated" receipt info for this code-based activation
        await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_RECEIPT, result.webReceipt);
        await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_PRODUCT_ID, result.plan);
        await AsyncStorage.setItem(storageKeys.SUBSCRIPTION_SOURCE, 'webCode');
        
        return { 
          success: true,
          isSubscribed: true,
          expiresAt: result.expiresAt,
          plan: result.plan
        };
      }
      
      return { success: false, error: result.error || 'Invalid code' };
    } catch (error) {
      console.error('Code activation failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new MobileSubscriptionService();