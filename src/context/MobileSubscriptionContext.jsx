// src/context/MobileSubscriptionContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { isMobileDevice, isIOS, isAndroid } from '../utils/deviceDetection';

// Create context
export const MobileSubscriptionContext = createContext(null);

// Provider component
export const MobileSubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect device platform
  const isMobile = isMobileDevice();
  const platform = isIOS() ? 'ios' : (isAndroid() ? 'android' : 'web');

  // Function to check mobile subscription status
  const checkMobileSubscription = useCallback(() => {
    setLoading(true);
    try {
      // Check localStorage for any mobile subscription code
      const mobileCode = localStorage.getItem('mobileSubscriptionCode');
      
      if (mobileCode) {
        // In a real app, this would verify the code with a server
        setSubscription({
          status: 'active',
          platform,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          activatedAt: localStorage.getItem('mobileSubscriptionActivated') || new Date().toISOString()
        });
      } else {
        setSubscription(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error checking mobile subscription:', err);
      setError('Failed to check mobile subscription status');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [platform]);

  // Check for mobile subscription on mount
  useEffect(() => {
    if (isMobile) {
      checkMobileSubscription();
    } else {
      // Not a mobile device, still check for activation codes
      checkMobileSubscription();
      setLoading(false);
    }
  }, [isMobile, checkMobileSubscription]);

  // Refresh subscription data - can be called from outside to force a refresh
  const refreshSubscription = useCallback(() => {
    checkMobileSubscription();
  }, [checkMobileSubscription]);

  // Activate subscription
  const activateSubscription = async (code) => {
    setLoading(true);
    try {
      // In a real app, this would verify the code with a server
      localStorage.setItem('mobileSubscriptionCode', code);
      localStorage.setItem('mobileSubscriptionActivated', new Date().toISOString());
      
      const newSubscription = {
        status: 'active',
        platform,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        activatedAt: new Date().toISOString()
      };
      
      setSubscription(newSubscription);
      setError(null);
      setLoading(false);
      return newSubscription;
    } catch (err) {
      console.error('Error activating mobile subscription:', err);
      setError('Failed to activate mobile subscription');
      setLoading(false);
      throw err;
    }
  };

  // Deactivate subscription
  const deactivateSubscription = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('mobileSubscriptionCode');
      localStorage.removeItem('mobileSubscriptionActivated');
      
      setSubscription(null);
      setError(null);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deactivating mobile subscription:', err);
      setError('Failed to deactivate mobile subscription');
      setLoading(false);
      throw err;
    }
  };

  // Context value
  const value = {
    subscription,
    loading,
    error,
    activateSubscription,
    deactivateSubscription,
    refreshSubscription, // Add the refresh function
    hasActiveSubscription: Boolean(subscription && subscription.status === 'active'),
    platform
  };

  return (
    <MobileSubscriptionContext.Provider value={value}>
      {children}
    </MobileSubscriptionContext.Provider>
  );
};

export default MobileSubscriptionContext;