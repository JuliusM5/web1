// src/hooks/useSubscription.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';
import subscriptionService from '../services/SubscriptionService';

export const useSubscription = () => {
  // Get subscription context
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  const { subscription, setSubscription } = context;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      try {
        const currentSubscription = await subscriptionService.checkSubscription();
        setSubscription(currentSubscription);
        setError(null);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err.message || 'Failed to check subscription status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [setSubscription]);
  
  // Create subscription
  const createSubscription = useCallback(async (planId, paymentMethodId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSubscription = await subscriptionService.createSubscription(planId, paymentMethodId);
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Failed to create subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setSubscription]);
  
  // Activate with code
  const activateWithCode = useCallback(async (accessCode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const activatedSubscription = await subscriptionService.activateWithCode(accessCode);
      setSubscription(activatedSubscription);
      return activatedSubscription;
    } catch (err) {
      console.error('Error activating with code:', err);
      setError(err.message || 'Failed to activate subscription with code');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setSubscription]);
  
  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.cancelSubscription();
      setSubscription(null);
      return result;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setSubscription]);
  
  // Check feature availability
  const isFeatureAvailable = useCallback(async (featureName) => {
    try {
      return await subscriptionService.isFeatureAvailable(featureName);
    } catch (err) {
      console.error(`Error checking feature availability for ${featureName}:`, err);
      return false;
    }
  }, []);
  
  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    activateWithCode,
    cancelSubscription,
    isFeatureAvailable,
    hasActiveSubscription: Boolean(subscription && subscription.status === 'active')
  };
};