// src/components/UI/MobileAppWrapper.jsx

import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import mobileFeatures from '../../utils/mobileFeatures';
import { deviceDetection } from '../../utils/deviceDetection';

const MobileAppWrapper = ({ children }) => {
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { isSubscribed } = useContext(SubscriptionContext);
  const deviceInfo = deviceDetection();
  
  useEffect(() => {
    // Initialize mobile features
    mobileFeatures.initialize();
    
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setIsInstallPromptAvailable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Handle online/offline status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  const installApp = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setIsInstallPromptAvailable(false);
  };
  
  return (
    <div className={`app-container ${deviceInfo.isMobile ? 'mobile-layout' : ''}`}>
      {isOffline && (
        <div className="offline-banner">
          You're currently offline. Some features may be limited.
        </div>
      )}
      
      {children}
      
      {isInstallPromptAvailable && deviceInfo.isMobile && (
        <div className="install-prompt">
          <p>Install our app for a better experience!</p>
          <button onClick={installApp}>Install</button>
        </div>
      )}
      
      {deviceInfo.isMobile && !isSubscribed && (
        <div className="mobile-ad-container">
          {/* Ad container for mobile - only shown for non-subscribers */}
          <div className="ad-placeholder">
            <p>Advertisement</p>
            {/* Google AdMob or other ad would be placed here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAppWrapper;