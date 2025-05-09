// src/constants/storageKeys.js

/**
 * Constants for localStorage keys
 * Using constants avoids typos and makes it easier to change keys if needed
 */
export const storageKeys = {
  // Subscription keys
  SUBSCRIPTION_TOKEN: 'subscription_token',
  SUBSCRIPTION_EXPIRY: 'subscription_expiry',
  FLIGHT_ALERTS: 'flight_alerts',
  
  // User preferences
  USER_SETTINGS: 'user_settings',
  LANGUAGE: 'language',
  THEME: 'theme',
  
  // App state
  LAST_VIEWED_PAGE: 'last_viewed_page',
  
  // Cached data
  CACHED_FLIGHT_DEALS: 'cached_flight_deals',
  CACHED_DESTINATIONS: 'cached_destinations',
  
  // Offline data
  OFFLINE_TRIPS: 'offline_trips',
  OFFLINE_TEMPLATES: 'offline_templates'
};

export default storageKeys;