import React, { useState, useEffect } from 'react';

function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastSynced, setLastSynced] = useState(localStorage.getItem('lastSyncTime') || null);
  
  // Update online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowIndicator(true);
      
      // Hide the indicator after 5 seconds when going back online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 5000);
      
      // Update last synced time
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      setLastSynced(now);
      
      return () => clearTimeout(timer);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowIndicator(true);
    };
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) {
      setShowIndicator(true);
    }
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Format last synced time
  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    
    try {
      const date = new Date(lastSynced);
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };
  
  if (!showIndicator) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-4 left-4 rounded-lg shadow-lg z-50 p-4 ${
      isOffline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isOffline ? 'bg-red-200' : 'bg-green-200'
        }`}></div>
        <p className="font-medium">
          {isOffline ? 'You are offline' : 'Connected'}
        </p>
        {!isOffline && (
          <button
            onClick={() => setShowIndicator(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
      
      <div className="text-xs mt-1">
        {isOffline ? (
          <p>
            Changes will be saved locally and synchronized when you reconnect.
            <br />
            Last synced: {formatLastSynced()}
          </p>
        ) : (
          <p>Your data has been synchronized.</p>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;