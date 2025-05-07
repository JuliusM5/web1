// src/context/SubscriptionContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import subscriptionService from '../services/SubscriptionService';
import AuthContext from './AuthContext';

// Create context
export const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [freeAlertsRemaining, setFreeAlertsRemaining] = useState(3);
  
  const { user, isAuthenticated } = useContext(AuthContext);
  
  // Load subscription status when user is authenticated
  useEffect(() => {
    const loadSubscription = async () => {
      if (!isAuthenticated) {
        setSubscription(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get current subscription
        const status = await subscriptionService.getSubscriptionStatus();
        setSubscription(status);
        
        // Get remaining free alerts
        if (!status.isActive) {
          const remainingAlerts = await subscriptionService.getRemainingFreeAlerts();
          setFreeAlertsRemaining(remainingAlerts);
        }
        
        // Get available plans
        setPlans(subscriptionService.getPlans());
      } catch (error) {
        console.error('Error loading subscription:', error);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscription();
  }, [isAuthenticated, user]);
  
  // Subscribe to a plan
  const subscribe = async (planId, paymentMethod) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.subscribe(planId, paymentMethod);
      setSubscription(result);
      return { success: true, subscription: result };
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.message || 'Failed to create subscription');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel subscription
  const cancelSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.cancelSubscription();
      setSubscription(prev => ({ ...prev, isActive: false }));
      return { success: true, result };
    } catch (error) {
      console.error('Cancellation error:', error);
      setError(error.message || 'Failed to cancel subscription');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Use a free alert
  const useFreeAlert = async () => {
    if (subscription?.isActive) {
      return { success: true, unlimited: true };
    }
    
    if (freeAlertsRemaining <= 0) {
      return { success: false, reason: 'no-alerts-remaining' };
    }
    
    try {
      const result = await subscriptionService.useFreeAlert();
      setFreeAlertsRemaining(prev => Math.max(0, prev - 1));
      return { success: true, remaining: freeAlertsRemaining - 1 };
    } catch (error) {
      console.error('Error using free alert:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Check if a user can create an alert (either subscribed or has free alerts)
  const canCreateAlert = () => {
    if (subscription?.isActive) {
      return true;
    }
    
    return freeAlertsRemaining > 0;
  };
  
  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        plans,
        freeAlertsRemaining,
        subscribe,
        cancelSubscription,
        useFreeAlert,
        canCreateAlert,
        isSubscribed: subscription?.isActive || false
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;