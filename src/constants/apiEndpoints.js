// src/constants/apiEndpoints.js

export const API_ENDPOINTS = {
    // Skyscanner RapidAPI endpoints
    SKYSCANNER: {
      BASE_URL: 'https://skyscanner89.p.rapidapi.com',
      ONE_WAY_FLIGHTS: '/flights/one-way/list',
      ROUND_TRIP_FLIGHTS: '/flights/round-trip/list',
      LOCATION_SEARCH: '/locations/search',
      FLIGHT_DETAILS: '/flights/details',
    },
    
    // Add other API endpoints as needed
    AUTH: {
      SIGN_IN: '/auth/signin',
      SIGN_UP: '/auth/signup',
      REFRESH_TOKEN: '/auth/refresh',
    },
    
    SUBSCRIPTION: {
      CREATE: '/subscription/create',
      CANCEL: '/subscription/cancel',
      STATUS: '/subscription/status',
    },
  };
  
  // API keys and config - in a real app, these would be in environment variables
  export const API_CONFIG = {
    RAPIDAPI_KEY: '708645c7a0msh8860ff1168af435p1420a8jsn8f2730758a25',
    RAPIDAPI_HOST: 'skyscanner89.p.rapidapi.com',
  };
  
  // Rate limiting constants
  export const RATE_LIMITS = {
    SKYSCANNER: {
      REQUESTS_PER_SECOND: 5,
      REQUESTS_PER_MONTH: 1500000,
    },
  };