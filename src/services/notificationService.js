// src/services/notificationService.js

class NotificationService {
    constructor() {
      this.permission = Notification.permission;
      this.supportsPush = 'PushManager' in window;
      this.vapidPublicKey = 'BLG_vES54CYlmkBgn7mWxE8QKakFL_9-_TrT_Z1hXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with your public key
    }
    
    // Request permission to show notifications
    async requestPermission() {
      if (!('Notification' in window)) {
        return { granted: false, reason: 'notifications-not-supported' };
      }
      
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return { granted: permission === 'granted' };
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return { granted: false, error };
      }
    }
    
    // Check if notifications are enabled
    async checkPermission() {
      if (!('Notification' in window)) {
        return { granted: false, reason: 'notifications-not-supported' };
      }
      
      // Update stored permission
      this.permission = Notification.permission;
      
      return { 
        granted: this.permission === 'granted',
        permission: this.permission
      };
    }
    
    // Subscribe to push notifications
    async subscribeToPush() {
      if (!this.supportsPush) {
        return { success: false, reason: 'push-not-supported' };
      }
      
      try {
        // Request permission if not granted
        if (this.permission !== 'granted') {
          const permissionResult = await this.requestPermission();
          if (!permissionResult.granted) {
            return { success: false, reason: 'permission-denied' };
          }
        }
        
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Get existing subscription or create new one
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Convert VAPID public key to Uint8Array
          const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
          
          // Create new subscription
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        }
        
        // Send subscription to server
        const response = await fetch('/api/push/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            deviceType: this.detectDeviceType()
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to register push subscription with server');
        }
        
        return { success: true, subscription };
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return { success: false, error };
      }
    }
    
    // Unsubscribe from push notifications
    async unsubscribeFromPush() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          return { success: true, reason: 'not-subscribed' };
        }
        
        // Unsubscribe locally
        const result = await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unregister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        });
        
        return { success: result };
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return { success: false, error };
      }
    }
    
    // Show a local notification
    showNotification(title, options = {}) {
      if (this.permission !== 'granted') {
        return Promise.reject(new Error('Notification permission not granted'));
      }
      
      return navigator.serviceWorker.ready.then(registration => {
        return registration.showNotification(title, {
          icon: '/logo192.png',
          badge: '/badge.png',
          vibrate: [100, 50, 100],
          ...options
        });
      });
    }
    
    // Helper function to detect device type
    detectDeviceType() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      if (/android/i.test(userAgent)) {
        return 'android';
      }
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
      }
      
      return 'web';
    }
    
    // Helper to convert base64 to Uint8Array for VAPID key
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      return outputArray;
    }
  }
  
  export default new NotificationService();