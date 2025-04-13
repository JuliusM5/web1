/**
 * Travel Advisory API service
 * Using free Travel Advisory API: https://www.travel-advisory.info/data-api
 */

const TRAVEL_ADVISORY_API_URL = 'https://www.travel-advisory.info/api';

/**
 * Get travel advisory information for a specific country
 * @param {string} countryCode - ISO country code (e.g., "US", "FR")
 * @returns {Promise<Object>} - Travel advisory data
 */
export const getCountryAdvisory = async (countryCode) => {
  if (!countryCode) {
    throw new Error('Country code is required');
  }
  
  try {
    const response = await fetch(`${TRAVEL_ADVISORY_API_URL}?countrycode=${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advisory: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.api_status.request.item_count === 0) {
      throw new Error(`No advisory found for country code: ${countryCode}`);
    }
    
    return {
      countryCode,
      advisory: data.data[countryCode],
      sources: data.api_status.source
    };
  } catch (error) {
    console.error('Travel advisory fetch error:', error);
    throw error;
  }
};

/**
 * Get all travel advisories
 * @returns {Promise<Object>} - All travel advisories
 */
export const getAllAdvisories = async () => {
  try {
    const response = await fetch(`${TRAVEL_ADVISORY_API_URL}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch advisories: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      advisories: data.data,
      sources: data.api_status.source,
      updated: data.api_status.updated
    };
  } catch (error) {
    console.error('Travel advisories fetch error:', error);
    throw error;
  }
};

/**
 * Get the advisory level description
 * @param {number} score - Advisory score (0-5)
 * @returns {string} - Human-readable description
 */
export const getAdvisoryLevelDescription = (score) => {
  if (score === undefined || score === null) {
    return 'Unknown risk level';
  }
  
  if (score < 0 || score > 5) {
    return 'Invalid risk level';
  }
  
  const levels = {
    0: 'No travel restrictions',
    1: 'Exercise normal precautions',
    2: 'Exercise increased caution',
    3: 'Reconsider travel',
    4: 'Do not travel',
    5: 'Avoid all travel (highest risk)'
  };
  
  // Round to nearest integer to match our levels
  const roundedScore = Math.round(score);
  return levels[roundedScore] || 'Unknown risk level';
};

/**
 * Get advisory color based on score (for UI display)
 * @param {number} score - Advisory score (0-5)
 * @returns {string} - CSS color class
 */
export const getAdvisoryColor = (score) => {
  if (score === undefined || score === null) {
    return 'bg-gray-200 text-gray-800'; // Unknown
  }
  
  if (score < 1) {
    return 'bg-green-100 text-green-800'; // Level 0
  } else if (score < 2) {
    return 'bg-green-200 text-green-800'; // Level 1
  } else if (score < 3) {
    return 'bg-yellow-100 text-yellow-800'; // Level 2
  } else if (score < 4) {
    return 'bg-orange-100 text-orange-800'; // Level 3
  } else {
    return 'bg-red-100 text-red-800'; // Level 4-5
  }
};