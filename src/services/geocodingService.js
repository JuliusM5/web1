/**
 * Geocoding Service
 * Provides geocoding functionality using OpenStreetMap Nominatim API
 * 
 * This service handles:
 * - Forward geocoding (location name to coordinates)
 * - Reverse geocoding (coordinates to location name)
 * - Geocoding for autocomplete suggestions
 */

// Base API URL for Nominatim (OpenStreetMap)
const NOMINATIM_API_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Convert a location name to geographic coordinates (forward geocoding)
 * 
 * @param {string} location Location name (e.g., city, address)
 * @returns {Promise<Object>} Promise that resolves to geocoding data
 */
export const geocodeLocation = async (location) => {
  if (!location) {
    throw new Error('Location is required');
  }
  
  try {
    // Build API URL with parameters
    const url = new URL(`${NOMINATIM_API_BASE}/search`);
    url.search = new URLSearchParams({
      q: location,
      format: 'json',
      limit: 1,
      addressdetails: 1
    }).toString();
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelEase/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Check if result was found
    if (!data || data.length === 0) {
      throw new Error(`No location found for: ${location}`);
    }
    
    // Extract and return relevant data
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name.split(',')[0],
      fullName: result.display_name,
      country: result.address.country,
      countryCode: result.address.country_code?.toUpperCase(),
      city: result.address.city || result.address.town || result.address.village,
      state: result.address.state || result.address.province,
      type: result.type,
      osm_id: result.osm_id
    };
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    throw error;
  }
};

/**
 * Get location suggestions for autocomplete
 * 
 * @param {string} query Partial location query
 * @param {number} limit Maximum number of results (default: 5)
 * @returns {Promise<Array<Object>>} Promise that resolves to an array of location suggestions
 */
export const getLocationSuggestions = async (query, limit = 5) => {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    // Build API URL with parameters
    const url = new URL(`${NOMINATIM_API_BASE}/search`);
    url.search = new URLSearchParams({
      q: query,
      format: 'json',
      limit: limit,
      addressdetails: 1
    }).toString();
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelEase/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Autocomplete suggestion failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Transform the results into a simpler format
    return data.map(result => ({
      id: result.place_id,
      name: result.display_name.split(',')[0],
      fullName: result.display_name,
      type: result.type,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      country: result.address.country,
      countryCode: result.address.country_code?.toUpperCase(),
      city: result.address.city || result.address.town || result.address.village
    }));
  } catch (error) {
    console.error(`Error getting location suggestions for "${query}":`, error);
    return []; // Return empty array instead of throwing to avoid breaking the UI
  }
};

/**
 * Calculate distance between two geographic coordinates
 * 
 * @param {number} lat1 Latitude of first point
 * @param {number} lon1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lon2 Longitude of second point
 * @param {string} unit Unit of measurement ('km' or 'mi')
 * @returns {number} Distance between the two points in the specified unit
 */
export const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  // Convert degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;
  
  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in kilometers
  const earthRadius = 6371;
  
  // Calculate distance
  let distance = earthRadius * c;
  
  // Convert to miles if necessary
  if (unit === 'mi') {
    distance *= 0.621371;
  }
  
  return distance;
};

/**
 * Convert geographic coordinates to a location name (reverse geocoding)
 * 
 * @param {number} latitude Latitude coordinate
 * @param {number} longitude Longitude coordinate
 * @returns {Promise<Object>} Promise that resolves to reverse geocoding data
 */
export const reverseGeocode = async (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('Latitude and longitude are required');
  }
  
  try {
    // Build API URL with parameters
    const url = new URL(`${NOMINATIM_API_BASE}/reverse`);
    url.search = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: 'json',
      addressdetails: 1
    }).toString();
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelEase/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Extract and return relevant data
    return {
      name: data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.suburb,
      fullName: data.display_name,
      country: data.address.country,
      countryCode: data.address.country_code?.toUpperCase(),
      city: data.address.city || data.address.town || data.address.village,
      state: data.address.state || data.address.province,
      type: data.type,
      osm_id: data.osm_id,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    };
  } catch (error) {
    console.error(`Error reverse geocoding coordinates (${latitude}, ${longitude}):`, error);
    throw error;
  }
};