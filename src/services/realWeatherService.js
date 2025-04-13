/**
 * Real Weather Service
 * Provides weather data from Open-Meteo API
 */

// Base API URL for Open-Meteo
const OPEN_METEO_API_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather forecast for a specific location
 * 
 * @param {number} latitude Latitude coordinate
 * @param {number} longitude Longitude coordinate
 * @param {Object} options Additional options for the forecast
 * @returns {Promise<Object>} Promise that resolves to weather forecast data
 */
export const getWeatherForecast = async (latitude, longitude, options = {}) => {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }
  
  try {
    // Default parameters for the API request
    const defaultParams = {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
      forecast_days: 7
    };
    
    // Merge default parameters with options
    const params = { ...defaultParams, ...options };
    
    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Make API request
    const response = await fetch(`${OPEN_METEO_API_BASE}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Transform the Open-Meteo data into a more usable format
    return transformOpenMeteoData(data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * Transform Open-Meteo data into a format compatible with the application
 * 
 * @param {Object} data Raw API response from Open-Meteo
 * @returns {Object} Transformed weather data
 */
const transformOpenMeteoData = (data) => {
  // Extract location information
  const location = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    elevation: data.elevation
  };
  
  // Map weather codes to weather conditions
  const getWeatherCondition = (code) => {
    const weatherCodes = {
      0: { main: 'Clear', description: 'clear sky' },
      1: { main: 'Clear', description: 'mainly clear' },
      2: { main: 'Clouds', description: 'partly cloudy' },
      3: { main: 'Clouds', description: 'overcast' },
      45: { main: 'Fog', description: 'fog' },
      48: { main: 'Fog', description: 'depositing rime fog' },
      51: { main: 'Drizzle', description: 'light drizzle' },
      53: { main: 'Drizzle', description: 'moderate drizzle' },
      55: { main: 'Drizzle', description: 'dense drizzle' },
      56: { main: 'Drizzle', description: 'light freezing drizzle' },
      57: { main: 'Drizzle', description: 'dense freezing drizzle' },
      61: { main: 'Rain', description: 'slight rain' },
      63: { main: 'Rain', description: 'moderate rain' },
      65: { main: 'Rain', description: 'heavy rain' },
      66: { main: 'Rain', description: 'light freezing rain' },
      67: { main: 'Rain', description: 'heavy freezing rain' },
      71: { main: 'Snow', description: 'slight snow fall' },
      73: { main: 'Snow', description: 'moderate snow fall' },
      75: { main: 'Snow', description: 'heavy snow fall' },
      77: { main: 'Snow', description: 'snow grains' },
      80: { main: 'Rain', description: 'slight rain showers' },
      81: { main: 'Rain', description: 'moderate rain showers' },
      82: { main: 'Rain', description: 'violent rain showers' },
      85: { main: 'Snow', description: 'slight snow showers' },
      86: { main: 'Snow', description: 'heavy snow showers' },
      95: { main: 'Thunderstorm', description: 'thunderstorm' },
      96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail' },
      99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
    };
    
    return weatherCodes[code] || { main: 'Unknown', description: 'unknown weather' };
  };
  
  // Transform current weather data
  const currentWeather = {
    temperature: data.current.temperature_2m,
    feels_like: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windspeed: data.current.wind_speed_10m,
    weather: [getWeatherCondition(data.current.weather_code)]
  };
  
  // Transform daily forecast data
  const dailyForecasts = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    dailyForecasts.push({
      dt_txt: data.daily.time[i],
      main: {
        temp_max: data.daily.temperature_2m_max[i],
        temp_min: data.daily.temperature_2m_min[i]
      },
      weather: [getWeatherCondition(data.daily.weather_code[i])]
    });
  }
  
  // Return transformed data
  return {
    city: {
      name: location.timezone.split('/').pop().replace(/_/g, ' '),
      coord: {
        lat: location.latitude,
        lon: location.longitude
      },
      timezone: location.timezone
    },
    current_weather: currentWeather,
    list: dailyForecasts
  };
};

/**
 * Get current UV index forecast for a location
 * 
 * @param {number} latitude Latitude coordinate
 * @param {number} longitude Longitude coordinate
 * @returns {Promise<Object>} Promise that resolves to UV index data
 */
export const getUVIndexForecast = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }
  
  try {
    const params = {
      latitude,
      longitude,
      daily: 'uv_index_max,uv_index_clear_sky_max',
      timezone: 'auto'
    };
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const response = await fetch(`${OPEN_METEO_API_BASE}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch UV index data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      city: {
        name: data.timezone.split('/').pop().replace(/_/g, ' '),
        coord: {
          lat: data.latitude,
          lon: data.longitude
        }
      },
      daily: data.daily
    };
  } catch (error) {
    console.error('Error fetching UV index forecast:', error);
    throw error;
  }
};

/**
 * Get air quality forecast for a location
 * 
 * @param {number} latitude Latitude coordinate
 * @param {number} longitude Longitude coordinate
 * @returns {Promise<Object>} Promise that resolves to air quality data
 */
export const getAirQualityForecast = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }
  
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch air quality data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform data
    return {
      city: {
        name: data.timezone.split('/').pop().replace(/_/g, ' '),
        coord: {
          lat: data.latitude,
          lon: data.longitude
        }
      },
      current: {
        aqi: data.current.european_aqi,
        pm10: data.current.pm10,
        pm2_5: data.current.pm2_5,
        co: data.current.carbon_monoxide,
        no2: data.current.nitrogen_dioxide,
        o3: data.current.ozone,
        timestamp: data.current.time
      }
    };
  } catch (error) {
    console.error('Error fetching air quality forecast:', error);
    throw error;
  }
};

/**
 * Get weather alert warnings for a location
 * 
 * @param {number} latitude Latitude coordinate
 * @param {number} longitude Longitude coordinate
 * @returns {Promise<Object>} Promise that resolves to weather alert data
 */
export const getWeatherAlerts = async (latitude, longitude) => {
  // Note: Open-Meteo doesn't provide weather alerts
  // This is a mock implementation
  
  return {
    alerts: [] // No alerts
  };
};