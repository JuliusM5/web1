/**
 * Constants for localStorage keys
 * Keep all storage keys in one place to avoid duplicates and typos
 */
export const LOCAL_STORAGE_KEYS = {
    // User settings
    USER_SETTINGS: 'travel_planner_user_settings',
    
    // Trip data
    TRIPS: 'travel_planner_trips',
    TRIP_TEMPLATES: 'travel_planner_trip_templates',
    SAVED_DESTINATIONS: 'travel_planner_saved_destinations',
    
    // Flight search related
    RECENT_FLIGHT_SEARCHES: 'travel_planner_recent_flight_searches',
    PRICE_ALERTS: 'travel_planner_price_alerts',
    SAVED_FLIGHTS: 'travel_planner_saved_flights',
    
    // User preferences
    LANGUAGE: 'travel_planner_language',
    CURRENCY: 'travel_planner_currency',
    THEME: 'travel_planner_theme',
    
    // Session data
    CURRENT_TRIP_DRAFT: 'travel_planner_current_trip_draft',
    
    // App state
    LAST_VIEW: 'travel_planner_last_view',
    ONBOARDING_COMPLETE: 'travel_planner_onboarding_complete',
  };
  
  /**
   * Constants for sessionStorage keys
   */
  export const SESSION_STORAGE_KEYS = {
    FLIGHT_SEARCH_PARAMS: 'travel_planner_flight_search_params',
    ACTIVE_FILTERS: 'travel_planner_active_filters',
    AUTH_TOKEN: 'travel_planner_auth_token',
  };
  
  export default {
    LOCAL_STORAGE_KEYS,
    SESSION_STORAGE_KEYS
  };