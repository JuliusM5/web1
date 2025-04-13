/**
 * Weather service using the Open-Meteo API - free, no API key required
 * Documentation: https://open-meteo.com/en/docs
 */

// Base URL for Open-Meteo API
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

/**
 * Geocodes a location string into latitude and longitude
 * @param {string} location - Location name (e.g., "Paris, France")
 * @returns {Promise<Object>} - Object containing lat, lon, and name
 */
export const geocodeLocation = async (location) => {
  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Location not found');
    }
    
    const result = data.results[0];
    
    return {
      lat: result.latitude,
      lon: result.longitude,
      name: result.name,
      country: result.country,
      countryCode: result.country_code
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location using Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Weather forecast data
 */
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await fetch(
      `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}` +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours' +
      '&current_weather=true&timezone=auto'
    );
    
    if (!response.ok) {
      throw new Error(`Weather data fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the data to match our app's expected structure
    return processOpenMeteoData(data, lat, lon);
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

/**
 * Process Open-Meteo data to match our app's expected format
 * @param {Object} data - Raw Open-Meteo data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} - Formatted weather data
 */
function processOpenMeteoData(data, lat, lon) {
  // WMO Weather interpretation codes to description mapping
  const weatherCodes = {
    0: { main: 'Clear', description: 'clear sky', icon: '01d' },
    1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
    2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
    3: { main: 'Clouds', description: 'overcast', icon: '03d' },
    45: { main: 'Fog', description: 'fog', icon: '50d' },
    48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
    51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
    53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
    55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
    56: { main: 'Drizzle', description: 'freezing drizzle', icon: '09d' },
    57: { main: 'Drizzle', description: 'dense freezing drizzle', icon: '09d' },
    61: { main: 'Rain', description: 'slight rain', icon: '10d' },
    63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
    65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
    66: { main: 'Rain', description: 'freezing rain', icon: '13d' },
    67: { main: 'Rain', description: 'heavy freezing rain', icon: '13d' },
    71: { main: 'Snow', description: 'slight snow fall', icon: '13d' },
    73: { main: 'Snow', description: 'moderate snow fall', icon: '13d' },
    75: { main: 'Snow', description: 'heavy snow fall', icon: '13d' },
    77: { main: 'Snow', description: 'snow grains', icon: '13d' },
    80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
    81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
    82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
    85: { main: 'Snow', description: 'slight snow showers', icon: '13d' },
    86: { main: 'Snow', description: 'heavy snow showers', icon: '13d' },
    95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    96: { main: 'Thunderstorm', description: 'thunderstorm with hail', icon: '11d' },
    99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' }
  };
  
  // Get current weather
  const currentWeatherCode = data.current_weather.weathercode;
  const currentWeather = weatherCodes[currentWeatherCode] || weatherCodes[0]; // Default to clear if code not found
  
  // Create a forecast format that matches what our components expect
  const forecast = {
    city: {
      name: `Location at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      coord: { lat, lon }
    },
    current_weather: {
      ...data.current_weather,
      weather: [currentWeather]
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weathercode,
      temperature_max: data.daily.temperature_2m_max,
      temperature_min: data.daily.temperature_2m_min,
      precipitation_sum: data.daily.precipitation_sum,
      precipitation_hours: data.daily.precipitation_hours
    },
    // Create a list format similar to OpenWeatherMap for compatibility
    list: data.daily.time.map((time, index) => {
      const weatherCode = data.daily.weathercode[index];
      const weather = weatherCodes[weatherCode] || weatherCodes[0];
      
      return {
        dt: new Date(time).getTime() / 1000,
        dt_txt: time,
        main: {
          temp: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2, // Average temp
          temp_min: data.daily.temperature_2m_min[index],
          temp_max: data.daily.temperature_2m_max[index],
          humidity: 70 // Open-Meteo free API doesn't provide humidity for daily forecasts
        },
        weather: [weather]
      };
    })
  };
  
  return forecast;
}

/**
 * Convenience function to get weather for a location by name
 * @param {string} location - Location name (e.g., "Paris, France")
 * @returns {Promise<Object>} - Weather forecast data
 */
export const getWeatherByLocationName = async (location) => {
  try {
    // First geocode the location
    const geoData = await geocodeLocation(location);
    
    // Then get the weather using coordinates
    const weatherData = await getWeatherForecast(geoData.lat, geoData.lon);
    
    // Add location name to the response
    weatherData.city.name = geoData.name;
    weatherData.city.country = geoData.country;
    
    return weatherData;
  } catch (error) {
    console.error(`Failed to get weather for ${location}:`, error);
    throw error;
  }
};