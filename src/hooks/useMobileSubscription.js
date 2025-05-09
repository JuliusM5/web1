// Enhance hooks/useMobileSubscription.js

import { useContext, useCallback } from 'react';
import { MobileSubscriptionContext } from '../context/MobileSubscriptionContext';
import { deviceDetection } from '../utils/deviceDetection';

export const useMobileSubscription = () => {
  const context = useContext(MobileSubscriptionContext);
  
  if (!context) {
    throw new Error('useMobileSubscription must be used within a MobileSubscriptionProvider');
  }
  
  // Helper to detect platform
  const getPlatform = () => {
    if (deviceDetection.isIOS()) return 'ios';
    if (deviceDetection.isAndroid()) return 'android';
    return 'web';
  };
  
  // Activate subscription with code from web purchase
  const activateWithCode = useCallback(async (code) => {
    try {
      // Get the current platform
      const platform = getPlatform();
      
      // Call the appropriate handler based on platform
      if (platform === 'ios' || platform === 'android') {
        // Make API call to validate and activate code
        const response = await fetch('/api/mobile/activate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            platform
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to activate code');
        }
        
        // Store the receipt locally
        localStorage.setItem('mobile_web_receipt', result.webReceipt);
        
        // Update context
        context.refreshSubscription();
        
        return { success: true };
      } else {
        // Not on a mobile platform
        return { success: false, error: 'This function is only available on mobile devices' };
      }
    } catch (error) {
      console.error('Code activation error:', error);
      return { success: false, error: error.message || 'Failed to activate code' };
    }
  }, [context]);
  
  return {
    ...context,
    activateWithCode
  };
};

export default useMobileSubscription;