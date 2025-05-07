// src/context/SubscriptionContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [freeAlertCount, setFreeAlertCount] = useState(0);
  const [expiryDate, setExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load subscription state on mount
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const savedState = localStorage.getItem('user_subscription');
        if (savedState) {
          const state = JSON.parse(savedState);
          setIsSubscribed(state.isSubscribed);
          setSubscriptionPlan(state.plan);
          setFreeAlertCount(state.freeAlertsUsed || 0);
          setExpiryDate(state.expiryDate ? new Date(state.expiryDate) : null);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscription();
  }, []);
  
  const incrementFreeAlertCount = () => {
    if (!isSubscribed && freeAlertCount < 3) {
      const newCount = freeAlertCount + 1;
      setFreeAlertCount(newCount);
      
      // Update localStorage
      try {
        const savedState = localStorage.getItem('user_subscription');
        const state = savedState ? JSON.parse(savedState) : {};
        state.freeAlertsUsed = newCount;
        localStorage.setItem('user_subscription', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving free alert count:', error);
      }
      
      return true;
    }
    return false;
  };
  
  const startSubscription = async (plan) => {
    setLoading(true);
    try {
      // Mock subscription process
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 day subscription
      
      setIsSubscribed(true);
      setSubscriptionPlan(plan);
      setExpiryDate(expiryDate);
      
      // Update localStorage
      const state = {
        isSubscribed: true,
        plan: plan,
        expiryDate: expiryDate.toISOString(),
        freeAlertsUsed: freeAlertCount
      };
      localStorage.setItem('user_subscription', JSON.stringify(state));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const cancelSubscription = async () => {
    setLoading(true);
    try {
      setIsSubscribed(false);
      setSubscriptionPlan(null);
      setExpiryDate(null);
      
      // Update localStorage
      const state = {
        isSubscribed: false,
        plan: null,
        expiryDate: null,
        freeAlertsUsed: freeAlertCount
      };
      localStorage.setItem('user_subscription', JSON.stringify(state));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      subscriptionPlan,
      freeAlertCount,
      expiryDate,
      loading,
      incrementFreeAlertCount,
      startSubscription,
      cancelSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};