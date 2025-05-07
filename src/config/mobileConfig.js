// src/config/mobileConfig.js

// Configuration for native mobile platforms
export const mobileConfig = {
    // iOS-specific configuration
    ios: {
      appId: 'com.yourcompany.cheapflights',
      bundleId: 'com.yourcompany.cheapflights',
      appStoreId: 'your-app-store-id',
      minimumVersion: '1.0.0',
      storeUrl: 'https://apps.apple.com/app/your-app-id',
      subscription: {
        productIds: {
          monthly: 'com.yourcompany.cheapflights.monthly',
          yearly: 'com.yourcompany.cheapflights.yearly'
        }
      }
    },
    
    // Android-specific configuration
    android: {
      packageName: 'com.yourcompany.cheapflights',
      versionCode: 1,
      minimumVersion: '1.0.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.yourcompany.cheapflights',
      subscription: {
        productIds: {
          monthly: 'com.yourcompany.cheapflights.monthly',
          yearly: 'com.yourcompany.cheapflights.yearly'
        }
      }
    },
    
    // Common mobile configuration
    common: {
      pushNotifications: {
        enabled: true,
        channelId: 'flight_deals',
        importance: 'high'
      },
      locationTracking: {
        enabled: true,
        accuracy: 'balanced',
        minimumDistance: 500 // meters
      },
      offlineMode: {
        enabled: true,
        cacheDuration: 86400000 // 24 hours
      },
      subscription: {
        plans: [
          {
            id: 'monthly',
            name: 'Monthly Plan',
            price: 4.99,
            duration: 'month',
            features: [
              'Unlimited flight alerts',
              'Price drop notifications',
              'Ad-free experience'
            ]
          },
          {
            id: 'yearly',
            name: 'Annual Plan',
            price: 39.99,
            duration: 'year',
            features: [
              'Unlimited flight alerts',
              'Price drop notifications',
              'Ad-free experience',
              'Priority deals'
            ]
          }
        ]
      }
    }
  };
  
  // Helper functions for mobile-specific behaviors
  export const getMobileConfig = (platform = null) => {
    if (!platform) {
      // Auto-detect platform
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        platform = 'ios';
      } else if (/android/i.test(userAgent)) {
        platform = 'android';
      } else {
        platform = 'web';
      }
    }
    
    // Return platform-specific configuration
    return {
      ...mobileConfig.common,
      ...(platform === 'ios' ? mobileConfig.ios : 
          platform === 'android' ? mobileConfig.android : {})
    };
  };
  
  // Get subscription plans based on platform
  export const getSubscriptionPlans = (platform = null) => {
    const config = getMobileConfig(platform);
    return config.subscription.plans;
  };