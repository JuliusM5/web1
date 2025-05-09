// src/context/MobileSubscriptionContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import MobileSubscriptionService from '../services/MobileSubscriptionService';

export const MobileSubscriptionContext = createContext();

export const MobileSubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    isLoading: true,
    products: [],
    plan: null,
    expiresAt: null
  });

  useEffect(() => {
    // Initial setup - load products and check subscription status
    const initializeSubscription = async () => {
      try {
        // Load available subscription products
        const products = await MobileSubscriptionService.getProducts();
        
        // Check existing subscription status
        const status = await MobileSubscriptionService.verifySubscription();
        
        setSubscription({
          isSubscribed: status.isSubscribed,
          plan: status.plan,
          expiresAt: status.expiresAt,
          products,
          isLoading: false
        });
      } catch (error) {
        console.error('Subscription initialization failed:', error);
        setSubscription(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    initializeSubscription();
  }, []);

  // Purchase a subscription
  const purchaseSubscription = async (productId) => {
    setSubscription(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await MobileSubscriptionService.purchaseSubscription(productId);
      
      if (result.success) {
        setSubscription({
          ...subscription,
          isSubscribed: true,
          plan: productId,
          expiresAt: result.expiresAt,
          isProcessing: false
        });
      } else {
        setSubscription(prev => ({
          ...prev,
          isProcessing: false,
          error: result.error
        }));
      }
      
      return result;
    } catch (error) {
      setSubscription(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
      return { success: false, error: error.message };
    }
  };

  // Restore previous purchases
  const restorePurchases = async () => {
    setSubscription(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await MobileSubscriptionService.restorePurchases();
      
      if (result.success && result.isSubscribed) {
        // Verify the restored subscription
        const status = await MobileSubscriptionService.verifySubscription();
        
        setSubscription({
          ...subscription,
          isSubscribed: status.isSubscribed,
          plan: status.plan,
          expiresAt: status.expiresAt,
          isProcessing: false,
          restorationComplete: true
        });
      } else {
        setSubscription(prev => ({
          ...prev,
          isProcessing: false,
          restorationComplete: true,
          error: result.error
        }));
      }
      
      return result;
    } catch (error) {
      setSubscription(prev => ({
        ...prev,
        isProcessing: false,
        restorationComplete: true,
        error: error.message
      }));
      return { success: false, error: error.message };
    }
  };

  // Activate with code (cross-platform support)
  const activateWithCode = async (accessCode) => {
    setSubscription(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await MobileSubscriptionService.activateWithCode(accessCode);
      
      if (result.success) {
        setSubscription({
          ...subscription,
          isSubscribed: true,
          plan: result.plan,
          expiresAt: result.expiresAt,
          isProcessing: false
        });
      } else {
        setSubscription(prev => ({
          ...prev,
          isProcessing: false,
          error: result.error
        }));
      }
      
      return result;
    } catch (error) {
      setSubscription(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
      return { success: false, error: error.message };
    }
  };

  // Refresh subscription status
  const refreshSubscription = async () => {
    try {
      const status = await MobileSubscriptionService.verifySubscription();
      
      setSubscription(prev => ({
        ...prev,
        isSubscribed: status.isSubscribed,
        plan: status.plan,
        expiresAt: status.expiresAt
      }));
      
      return status;
    } catch (error) {
      console.error('Refresh failed:', error);
      return { isSubscribed: subscription.isSubscribed };
    }
  };

  const clearError = () => {
    setSubscription(prev => ({ ...prev, error: null }));
  };

  return (
    <MobileSubscriptionContext.Provider value={{
      ...subscription,
      purchaseSubscription,
      restorePurchases,
      activateWithCode,
      refreshSubscription,
      clearError
    }}>
      {children}
    </MobileSubscriptionContext.Provider>
  );
};

export default MobileSubscriptionContext;