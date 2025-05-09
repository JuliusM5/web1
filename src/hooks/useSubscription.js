// src/hooks/useSubscription.js

import { useState, useEffect } from 'react';
import { storageKeys } from '../constants/storageKeys';

/**
 * Hook for handling subscription state in a token-based system
 * Without requiring user accounts
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    isLoading: true,
    plan: null,
    expiresAt: null
  });

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Check subscription status based on localStorage tokens
  const checkSubscriptionStatus = () => {
    const token = localStorage.getItem(storageKeys.SUBSCRIPTION_TOKEN);
    const expiryDate = localStorage.getItem(storageKeys.SUBSCRIPTION_EXPIRY);
    
    // Not subscribed if no token or expiry date
    if (!token || !expiryDate) {
      setSubscription({
        isSubscribed: false,
        isLoading: false,
        plan: null,
        expiresAt: null
      });
      return;
    }
    
    // Check if subscription is expired
    const isExpired = new Date(expiryDate) <= new Date();
    
    if (isExpired) {
      // Clear expired tokens
      localStorage.removeItem(storageKeys.SUBSCRIPTION_TOKEN);
      localStorage.removeItem(storageKeys.SUBSCRIPTION_EXPIRY);
      
      setSubscription({
        isSubscribed: false,
        isLoading: false,
        plan: null,
        expiresAt: null
      });
      return;
    }
    
    // Valid subscription
    // In a real implementation, you'd verify the token with your server
    setSubscription({
      isSubscribed: true,
      isLoading: false,
      // For now, assume monthly plan - in production you'd store this info
      plan: 'monthly_premium',
      expiresAt: expiryDate
    });
  };

  // Subscribe with email only (no account)
  const purchaseSubscription = async (email, planId) => {
    // For development, simulate a successful purchase
    // In production, this would redirect to Stripe Checkout
    
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate a mock token and expiry date
        const token = 'test_token_' + Date.now();
        const expiryDate = new Date();
        
        // Set expiry based on plan
        if (planId === 'yearly_premium') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        }
        
        // Store in localStorage
        localStorage.setItem(storageKeys.SUBSCRIPTION_TOKEN, token);
        localStorage.setItem(storageKeys.SUBSCRIPTION_EXPIRY, expiryDate.toISOString());
        
        // Update state
        setSubscription({
          isSubscribed: true,
          isLoading: false,
          plan: planId,
          expiresAt: expiryDate.toISOString()
        });
        
        // Generate a mock mobile access code
        const mobileAccessCode = 'DEMO-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                                Math.random().toString(36).substring(2, 6).toUpperCase();
        
        resolve({ 
          success: true, 
          mobileAccessCode 
        });
      }, 1500);
    });
  };

  // Check if a specific premium feature is available
  const isPremiumFeatureAvailable = (featureId) => {
    // If not subscribed, only allow free features
    if (!subscription.isSubscribed) {
      const freeFeatures = ['basic_search', 'limited_alerts'];
      return freeFeatures.includes(featureId);
    }
    
    // Define features available in each plan
    const featureMap = {
      monthly_premium: [
        'premium_deals',
        'unlimited_alerts',
        'priority_notifications',
        'full_search',
      ],
      yearly_premium: [
        'premium_deals',
        'unlimited_alerts', 
        'priority_notifications',
        'full_search',
        'historical_data',
        'price_predictions'
      ]
    };
    
    // Check if feature is available in current plan
    return featureMap[subscription.plan]?.includes(featureId) || false;
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    // In production, this would call your backend to cancel in Stripe
    // For development, just clear the local storage
    
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(storageKeys.SUBSCRIPTION_TOKEN);
        localStorage.removeItem(storageKeys.SUBSCRIPTION_EXPIRY);
        
        setSubscription({
          isSubscribed: false,
          isLoading: false,
          plan: null,
          expiresAt: null
        });
        
        resolve({ success: true });
      }, 1000);
    });
  };

  return {
    isSubscribed: subscription.isSubscribed,
    isLoading: subscription.isLoading,
    plan: subscription.plan,
    expiresAt: subscription.expiresAt,
    purchaseSubscription,
    cancelSubscription,
    refreshSubscription: checkSubscriptionStatus,
    isPremiumFeatureAvailable
  };
};

export default useSubscription;