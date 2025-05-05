// src/context/SubscriptionContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create subscription context
const SubscriptionContext = createContext();

// Custom hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
};

// Subscription provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState('free'); // 'free' or 'premium'
  const [notificationsUsed, setNotificationsUsed] = useState(0);
  const [maxFreeNotifications] = useState(3);
  
  // Load subscription data from localStorage on initial render
  useEffect(() => {
    const savedStatus = localStorage.getItem('subscriptionStatus');
    const savedNotificationsUsed = localStorage.getItem('notificationsUsed');
    
    if (savedStatus) {
      setSubscriptionStatus(savedStatus);
    }
    
    if (savedNotificationsUsed) {
      setNotificationsUsed(parseInt(savedNotificationsUsed, 10));
    }
  }, []);
  
  // Save subscription data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('subscriptionStatus', subscriptionStatus);
    localStorage.setItem('notificationsUsed', notificationsUsed.toString());
  }, [subscriptionStatus, notificationsUsed]);
  
  // Function to use a notification
  const useNotification = () => {
    if (subscriptionStatus === 'premium') {
      return true; // Premium users can always use notifications
    }
    
    if (notificationsUsed < maxFreeNotifications) {
      setNotificationsUsed(prev => prev + 1);
      return true;
    }
    
    return false; // Out of free notifications
  };
  
  // Function to upgrade to premium
  const upgradeToPremium = () => {
    setSubscriptionStatus('premium');
  };
  
  // Function to reset notifications (for testing)
  const resetNotifications = () => {
    setNotificationsUsed(0);
  };
  
  // Provide the subscription context value
  const value = {
    subscriptionStatus,
    notificationsUsed,
    maxFreeNotifications,
    useNotification,
    upgradeToPremium,
    resetNotifications,
    freeNotificationsRemaining: maxFreeNotifications - notificationsUsed
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;