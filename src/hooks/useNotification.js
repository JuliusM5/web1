// src/hooks/useNotification.js

import { useState } from 'react';

/**
 * Hook for displaying notifications
 * @returns {Object} Notification methods and state
 */
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Show a notification
   * @param {Object} notification - Notification data
   * @param {string} notification.type - Type of notification ('success', 'error', 'info', 'warning')
   * @param {string} notification.message - Notification message
   * @param {number} notification.duration - Duration in ms (default: 5000)
   * @returns {string} ID of the created notification
   */
  const show = (notification) => {
    // Generate unique ID
    const id = Date.now().toString();
    
    // Default duration is 5 seconds
    const duration = notification.duration || 5000;
    
    // Add notification to state
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // For development, just log the notification
    console.log(`Notification (${newNotification.type}): ${newNotification.message}`);
    
    // Set timeout to remove notification
    setTimeout(() => {
      dismiss(id);
    }, duration);
    
    return id;
  };

  /**
   * Dismiss a notification by ID
   * @param {string} id - Notification ID
   */
  const dismiss = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  /**
   * Dismiss all notifications
   */
  const dismissAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    show,
    dismiss,
    dismissAll
  };
};

export default useNotification;