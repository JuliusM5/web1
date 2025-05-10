// src/context/SubscriptionContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import subscriptionService from '../services/SubscriptionService';

// Create context
export const SubscriptionContext = createContext(null);

// Provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize subscription status on mount
  useEffect(() => {
    const initSubscription = async () => {
      setIsLoading(true);
      try {
        const currentSubscription = await subscriptionService.checkSubscription();
        setSubscription(currentSubscription);
        setError(null);
      } catch (error) {
        console.error('Error initializing subscription:', error);
        setError('Failed to check subscription status');
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    initSubscription();
  }, []);
  
  // Context value
  const value = {
    subscription,
    setSubscription,
    isInitialized,
    isLoading,
    error,
    hasActiveSubscription: Boolean(subscription && subscription.status === 'active')
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;