/**
 * Services index
 * Export all services from a single file for easy import
 */

// Geocoding Service
export { 
  geocodeLocation, 
  reverseGeocode, 
  getLocationSuggestions,
  calculateDistance
} from './geocodingService';

// API Service (for general API calls)
export {
  get,
  post,
  put,
  del,
  request
} from './apiService';

/**
 * Mock data services for development
 * These are used when real API services are unavailable or for testing
 */
export const mockServices = {
  // Removed mock weather and travel advisory services
};