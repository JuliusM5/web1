import React, { useState, useEffect } from 'react';
import { triggerSync } from '../../serviceWorkerRegistration';

function EnhancedOfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastSynced, setLastSynced] = useState(localStorage.getItem('lastSyncTime') || null);
  const [unsyncedChanges, setUnsyncedChanges] = useState(0);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  
  // Update online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowIndicator(true);
      
      // Trigger sync when coming back online
      triggerSync();
      
      // Hide the indicator after 5 seconds when going back online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowIndicator(true);
    };
    
    // Handle service worker updates
    const handleServiceWorkerUpdated = () => {
      setShowUpdatePrompt(true);
    };
    
    // Handle service worker installation
    const handleServiceWorkerInstalled = () => {
      // Show a notification that the app is now available offline
      if ('serviceWorker' in navigator) {
        const notification = {
          title: 'TravelEase',
          options: {
            body: 'The app is now available for offline use.',
            icon: '/logo192.png',
            badge: '/favicon.ico'
          }
        };
        
        // Check if notification permission is granted
        if (Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(notification.title, notification.options);
          });
        }
      }
    };
    
    // Check for unsynced changes
    const checkUnsyncedChanges = () => {
      const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
      setUnsyncedChanges(unsynced.length);
    };
    
    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event) => {
      if (event.data.type === 'SYNC_COMPLETED') {
        setLastSynced(event.data.timestamp);
        checkUnsyncedChanges();
      }
    };
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    checkUnsyncedChanges();
    
    if (!navigator.onLine && unsyncedChanges > 0) {
      setShowIndicator(true);
    }
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('serviceWorkerUpdated', handleServiceWorkerUpdated);
    window.addEventListener('serviceWorkerInstalled', handleServiceWorkerInstalled);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    // Set up interval to check unsynced changes
    const interval = setInterval(checkUnsyncedChanges, 10000); // Check every 10 seconds
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('serviceWorkerUpdated', handleServiceWorkerUpdated);
      window.removeEventListener('serviceWorkerInstalled', handleServiceWorkerInstalled);
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      
      clearInterval(interval);
    };
  }, [unsyncedChanges]);
  
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
  
  // Handle refresh for service worker update
  const handleRefreshApp = () => {
    // Skip waiting and reload to activate new service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    
    // Reload the page
    window.location.reload();
  };
  
  // Handle manual sync
  const handleManualSync = () => {
    if (navigator.onLine) {
      triggerSync();
      
      // Show brief message
      const syncMessage = document.getElementById('sync-message');
      if (syncMessage) {
        syncMessage.classList.remove('opacity-0');
        syncMessage.classList.add('opacity-100');
        
        setTimeout(() => {
          syncMessage.classList.remove('opacity-100');
          syncMessage.classList.add('opacity-0');
        }, 3000);
      }
    }
  };
  
  return (
    <>
      {/* Offline/Online Indicator */}
      {showIndicator && (
        <div className={`fixed bottom-4 left-4 rounded-lg shadow-lg z-50 p-4 transition-all duration-300 ${
          isOffline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isOffline ? 'bg-red-200 animate-pulse' : 'bg-green-200'
            }`}></div>
            <p className="font-medium">
              {isOffline ? 'You are offline' : 'Connected'}
            </p>
            {!isOffline && (
              <button
                onClick={() => setShowIndicator(false)}
                className="ml-4 text-white hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
          
          <div className="text-xs mt-1">
            {isOffline ? (
              <div>
                <p>
                  Changes will be saved locally and synchronized when you reconnect.
                  <br />
                  Last synced: {formatLastSynced()}
                </p>
                {unsyncedChanges > 0 && (
                  <p className="mt-1 font-bold">
                    {unsyncedChanges} change{unsyncedChanges !== 1 ? 's' : ''} pending synchronization
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p>Your data has been synchronized.</p>
                {unsyncedChanges > 0 && (
                  <div className="flex items-center mt-1">
                    <p className="font-bold mr-2">
                      {unsyncedChanges} change{unsyncedChanges !== 1 ? 's' : ''} pending synchronization
                    </p>
                    <button
                      onClick={handleManualSync}
                      className="bg-white text-green-600 px-2 py-0.5 rounded text-xs hover:bg-green-100"
                    >
                      Sync Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 right-4 rounded-lg shadow-lg z-50 p-4 bg-blue-600 text-white max-w-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-medium">Update Available</p>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <p className="text-sm mt-2">
            A new version of TravelEase is available. Refresh to update.
          </p>
          
          <button
            onClick={handleRefreshApp}
            className="mt-3 bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50 w-full"
          >
            Update Now
          </button>
        </div>
      )}
      
      {/* Sync Message (hidden by default) */}
      <div 
        id="sync-message" 
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 opacity-0 transition-opacity duration-300"
      >
        Synchronizing data...
      </div>
    </>
  );
}

export default EnhancedOfflineIndicator;