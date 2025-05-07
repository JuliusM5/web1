// src/components/Offline/EnhancedOfflineIndicator.jsx

import React, { useState, useEffect } from 'react';
import { triggerSync } from '../../serviceWorkerRegistration';
import offlineDataService from '../../services/offlineDataService';

function EnhancedOfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  
  // Check for pending changes
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const changes = await offlineDataService.getPendingChanges();
        setHasPendingChanges(changes.length > 0);
      } catch (error) {
        console.error('Error checking pending changes:', error);
      }
    };
    
    // Check on mount
    checkPendingChanges();
    
    // Set up interval to check regularly
    const interval = setInterval(checkPendingChanges, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // If we came back online and have pending changes, show the indicator
      offlineDataService.getPendingChanges().then(changes => {
        const hasPending = changes.length > 0;
        setHasPendingChanges(hasPending);
        setShowIndicator(hasPending);
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowIndicator(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Hide indicator after a delay if online
  useEffect(() => {
    let timeoutId;
    
    if (!isOffline && !hasPendingChanges) {
      timeoutId = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOffline, hasPendingChanges]);
  
  // Handle manual sync
  const handleSync = async () => {
    if (isOffline) {
      return; // Can't sync while offline
    }
    
    setIsSyncing(true);
    
    try {
      // Try to trigger service worker sync
      await triggerSync();
      
      // Fallback to manual sync if service worker sync fails
      const result = await offlineDataService.syncChanges();
      
      if (result.success) {
        // Check if we still have pending changes
        const changes = await offlineDataService.getPendingChanges();
        setHasPendingChanges(changes.length > 0);
        
        if (changes.length === 0) {
          // Hide after successful sync
          setTimeout(() => {
            setShowIndicator(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error syncing changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!showIndicator) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg ${
      isOffline ? 'bg-red-500 text-white' : (hasPendingChanges ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white')
    }`}>
      {isOffline ? (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L8 10.586m4.95-2.12a3 3 0 10-4.243 4.243m4.243-4.243L18 3.222M10.344 9.879l1.414 1.414" />
          </svg>
          <span>You're offline. Changes will be saved locally.</span>
        </div>
      ) : hasPendingChanges ? (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Changes pending to sync.</span>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="ml-2 px-2 py-1 bg-white text-yellow-500 rounded-md text-sm font-medium"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>You're back online!</span>
        </div>
      )}
    </div>
  );
}

export default EnhancedOfflineIndicator;