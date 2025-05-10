// src/hooks/useMobileSubscription.js
import { useContext, useCallback } from 'react';
import { MobileSubscriptionContext } from '../context/MobileSubscriptionContext';
import { isIOS, isAndroid } from '../utils/deviceDetection';

export const useMobileSubscription = () => {
  const context = useContext(MobileSubscriptionContext);
  
  // Helper to detect platform
  const getPlatform = useCallback(() => {
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'web';
  }, []);
  
  // Activate subscription with code from web purchase
  const activateWithCode = useCallback(async (code) => {
    try {
      if (!context) {
        return { 
          success: false, 
          error: 'MobileSubscriptionProvider not found' 
        };
      }
      
      // Get the current platform
      const platform = getPlatform();
      
      // Call the appropriate handler based on platform
      if (platform === 'ios' || platform === 'android') {
        // For a fully working version, you would make an API call here
        // But for now we'll use a simpler implementation to avoid dependencies
        
        // Store the code locally
        localStorage.setItem('mobileSubscriptionCode', code);
        localStorage.setItem('mobileSubscriptionActivated', new Date().toISOString());
        
        // Update context
        if (context.refreshSubscription) {
          context.refreshSubscription();
        }
        
        return { 
          success: true,
          status: 'active',
          platform,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };
      } else {
        // Not on a mobile platform, but we'll allow activation anyway for testing
        localStorage.setItem('mobileSubscriptionCode', code);
        localStorage.setItem('mobileSubscriptionActivated', new Date().toISOString());
        
        // Update context
        if (context.refreshSubscription) {
          context.refreshSubscription();
        }
        
        return { 
          success: true,
          status: 'active',
          platform: 'web',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };
      }
    } catch (error) {
      console.error('Code activation error:', error);
      return { success: false, error: error.message || 'Failed to activate code' };
    }
  }, [context, getPlatform]);

  // If no context is available, return a fallback
  if (!context) {
    return {
      subscription: null,
      loading: false,
      error: 'MobileSubscriptionProvider not found',
      activateSubscription: () => Promise.reject(new Error('MobileSubscriptionProvider not found')),
      deactivateSubscription: () => Promise.reject(new Error('MobileSubscriptionProvider not found')),
      hasActiveSubscription: false,
      activateWithCode
    };
  }
  
  // Add the activateWithCode function to the context
  return {
    ...context,
    activateWithCode
  };
};

export default useMobileSubscription;