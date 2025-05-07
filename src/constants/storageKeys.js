// src/constants/storageKeys.js

const storageKeys = {
  // Flight data related
  FLIGHT_CACHE: 'flight_data_cache',
  GLOBAL_FLIGHT_CACHE: 'global_flight_cache',
  ROUTE_STATISTICS: 'route_request_stats',
  LOCATIONS_CACHE: 'locations_cache',
  
  // User related
  SAVED_DEALS: 'user_saved_deals',
  USER_SUBSCRIPTION: 'user_subscription',
  USER_SIGNALS: 'user_signals', // Prefix with user ID when using
  
  // App settings
  APP_SETTINGS: 'app_settings',
  THEME_PREFERENCE: 'theme_preference'
};

export { storageKeys };

// Keep existing exports for backward compatibility
export const LOCAL_STORAGE_KEYS = {
  // Your existing keys
};

export const SESSION_STORAGE_KEYS = {
  // Your existing keys  
};

export default {
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS
};