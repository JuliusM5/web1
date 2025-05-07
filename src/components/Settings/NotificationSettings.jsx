// src/components/Settings/NotificationSettings.jsx

import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';

function NotificationSettings() {
  const [status, setStatus] = useState('checking');
  const [canSubscribe, setCanSubscribe] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [tripReminders, setTripReminders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check initial notification status
  useEffect(() => {
    const checkStatus = async () => {
      const permissionResult = await notificationService.checkPermission();
      
      if (permissionResult.granted) {
        setStatus('granted');
        
        // Check server for user preferences
        try {
          const response = await fetch('/api/notifications/preferences');
          if (response.ok) {
            const preferences = await response.json();
            setPriceAlerts(preferences.priceAlerts);
            setTripReminders(preferences.tripReminders);
          }
        } catch (error) {
          console.error('Error fetching notification preferences:', error);
        }
      } else if (permissionResult.permission === 'denied') {
        setStatus('denied');
      } else {
        setStatus('default');
        setCanSubscribe(true);
      }
    };
    
    checkStatus();
  }, []);
  
  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const permissionResult = await notificationService.requestPermission();
      
      if (permissionResult.granted) {
        const subscriptionResult = await notificationService.subscribeToPush();
        
        if (subscriptionResult.success) {
          setStatus('granted');
          // Enable default notifications
          setPriceAlerts(true);
          setTripReminders(true);
          await savePreferences(true, true);
          
          // Show confirmation notification
          notificationService.showNotification(
            'Notifications enabled!',
            {
              body: 'You will now receive updates on flight deals and trip reminders.',
              icon: '/logo192.png'
            }
          );
        } else {
          console.error('Failed to subscribe:', subscriptionResult);
        }
      } else {
        setStatus(permissionResult.permission);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle disabling notifications
  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const result = await notificationService.unsubscribeFromPush();
      
      if (result.success) {
        await savePreferences(false, false);
        setPriceAlerts(false);
        setTripReminders(false);
        setStatus('unsubscribed');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save notification preferences to server
  const savePreferences = async (priceAlertsValue, tripRemindersValue) => {
    try {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceAlerts: priceAlertsValue,
          tripReminders: tripRemindersValue
        })
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };
  
  // Handle toggling individual notification types
  const handleTogglePriceAlerts = async (e) => {
    const checked = e.target.checked;
    setPriceAlerts(checked);
    await savePreferences(checked, tripReminders);
  };
  
  const handleToggleTripReminders = async (e) => {
    const checked = e.target.checked;
    setTripReminders(checked);
    await savePreferences(priceAlerts, checked);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Notification Settings</h3>
      
      {status === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Notifications are blocked for this site. Please update your browser settings to receive notifications.
          </p>
        </div>
      )}
      
      {status === 'default' && (
        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            Enable notifications to receive alerts about flight deals and trip reminders.
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      )}
      
      {status === 'granted' && (
        <>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              You will receive the following notifications:
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={handleTogglePriceAlerts}
                  className="mr-2 h-4 w-4"
                />
                <span>Price drop alerts for your saved routes</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tripReminders}
                  onChange={handleToggleTripReminders}
                  className="mr-2 h-4 w-4"
                />
                <span>Trip reminders and checklist notifications</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleDisableNotifications}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Disable All Notifications
          </button>
        </>
      )}
      
      {status === 'unsubscribed' && (
        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            You have unsubscribed from notifications. Enable them again to receive updates.
          </p>
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Re-enable Notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;