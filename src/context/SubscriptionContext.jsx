// src/context/SubscriptionContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import { storageKeys } from '../constants/storageKeys';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    isLoading: true,
    plan: null,
    expiresAt: null,
    error: null
  });

  useEffect(() => {
    // Check subscription status on mount
    verifySubscription();
  }, []);

  const verifySubscription = async (showLoading = true) => {
    const token = localStorage.getItem(storageKeys.SUBSCRIPTION_TOKEN);
    
    // No token, not subscribed
    if (!token) {
      setSubscription(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));
      return;
    }
    
    // Show loading state if requested
    if (showLoading) {
      setSubscription(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      // Check if token is expired
      const expiryDate = localStorage.getItem(storageKeys.SUBSCRIPTION_EXPIRY);
      
      if (!expiryDate || new Date(expiryDate) <= new Date()) {
        // Token expired, clear storage
        localStorage.removeItem(storageKeys.SUBSCRIPTION_TOKEN);
        localStorage.removeItem(storageKeys.SUBSCRIPTION_EXPIRY);
        
        setSubscription({
          isSubscribed: false,
          plan: null,
          expiresAt: null,
          isLoading: false,
          error: 'Subscription expired'
        });
        return;
      }
      
      // Valid subscription
      setSubscription({
        isSubscribed: true,
        // For development, assume plan from localStorage or default to monthly
        plan: localStorage.getItem('subscription_plan') || 'monthly_premium',
        expiresAt: expiryDate,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Subscription verification failed:', error);
      
      // Fallback to local verification
      const expiryDate = localStorage.getItem(storageKeys.SUBSCRIPTION_EXPIRY);
      if (expiryDate && new Date(expiryDate) > new Date()) {
        setSubscription(prev => ({
          ...prev,
          isSubscribed: true,
          isOfflineVerified: true,
          isLoading: false
        }));
      } else {
        setSubscription(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
          error: 'Failed to verify subscription status'
        }));
      }
    }
  };

  const purchaseSubscription = async (email, plan) => {
    setSubscription(prev => ({ ...prev, isLoading: true }));
    
    try {
      // For development, simulate a successful subscription
      // In production, this would create a checkout session with Stripe
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data
      const token = 'token_' + Date.now();
      const expiryDate = new Date();
      
      // Set expiration based on plan
      if (plan === 'yearly_premium') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      // Store in localStorage
      localStorage.setItem(storageKeys.SUBSCRIPTION_TOKEN, token);
      localStorage.setItem(storageKeys.SUBSCRIPTION_EXPIRY, expiryDate.toISOString());
      localStorage.setItem('subscription_plan', plan);
      
      // Generate a mock mobile access code
      const mobileAccessCode = 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-CODE';
      
      // Update subscription state
      setSubscription({
        isSubscribed: true,
        plan: plan,
        expiresAt: expiryDate.toISOString(),
        isLoading: false,
        error: null
      });
      
      return {
        success: true,
        mobileAccessCode
      };
    } catch (error) {
      console.error('Purchase subscription error:', error);
      
      setSubscription(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to process subscription'
      }));
      
      return {
        success: false,
        error: 'Failed to process subscription'
      };
    }
  };

  const activateTokenFromEmail = async (token) => {
    setSubscription(prev => ({ ...prev, isLoading: true }));
    
    try {
      // For development, simulate activation
      // In production, this would verify the token with your server
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token in localStorage
      localStorage.setItem(storageKeys.SUBSCRIPTION_TOKEN, token);
      
      // Set expiry to 30 days from now (for demo)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem(storageKeys.SUBSCRIPTION_EXPIRY, expiryDate.toISOString());
      
      // Update subscription state
      setSubscription({
        isSubscribed: true,
        plan: 'monthly_premium', // Assume monthly plan for activation
        expiresAt: expiryDate.toISOString(),
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Token activation failed:', error);
      
      setSubscription(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to activate subscription'
      }));
      
      return {
        success: false,
        error: 'Failed to activate subscription'
      };
    }
  };

  const cancelSubscription = async () => {
    try {
      // For development, just remove from localStorage
      // In production, this would call your backend to cancel in Stripe
      
      // Clear local storage
      localStorage.removeItem(storageKeys.SUBSCRIPTION_TOKEN);
      localStorage.removeItem(storageKeys.SUBSCRIPTION_EXPIRY);
      localStorage.removeItem('subscription_plan');
      
      // Update state
      setSubscription({
        isSubscribed: false,
        plan: null,
        expiresAt: null,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      
      return {
        success: false,
        error: 'Failed to cancel subscription'
      };
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      ...subscription,
      purchaseSubscription,
      activateTokenFromEmail,
      refreshSubscription: verifySubscription,
      cancelSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;