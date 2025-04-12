// API service for fetching destination data using free and open APIs

// Base URLs for various free APIs
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const RESTCOUNTRIES_BASE_URL = 'https://restcountries.com/v3.1';
const EXCHANGERATE_BASE_URL = 'https://open.er-api.com/v6/latest';

// Geocoding: Convert location name to coordinates using OpenStreetMap's Nominatim API
export const geocodeLocation = async (locationName) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'TravelEase/1.0' // It's good practice to identify your app to the API
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Location not found');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      name: data[0].display_name.split(',')[0],
      country: data[0].address.country_code?.toUpperCase() || 'UNKNOWN'
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Reverse Geocoding: Convert coordinates to location name
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'TravelEase/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('Location not found');
    }
    
    return {
      name: data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location',
      country: data.address.country || 'Unknown Country'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Get weather data for a location using Open-Meteo API (free, no API key required)
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await fetch(
      `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours&current_weather=true&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    
    // Process the data to match our expected format
    return processOpenMeteoData(data, lat, lon);
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

// Process Open-Meteo data to match our app's expected format
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

// Get country information using RestCountries API
export const getCountryInfo = async (countryCode) => {
  try {
    const response = await fetch(`${RESTCOUNTRIES_BASE_URL}/alpha/${countryCode}`);
    
    if (!response.ok) {
      throw new Error('Country info fetch failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Country info fetch error:', error);
    throw error;
  }
};

// Get currency exchange rates using Open Exchange Rates API
export const getCurrencyRates = async (baseCurrency = 'USD') => {
  try {
    const response = await fetch(`${EXCHANGERATE_BASE_URL}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Exchange rate fetch failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    throw error;
  }
};

// Get travel advisory information 
// This uses basic country advisories as we don't have a specific API
export const getTravelAdvisory = async (countryCode) => {
  try {
    // Simulate travel advisory with some basic countries
    // In a real app, you'd use a proper travel advisory API
    const advisories = {
      'US': { score: 2, message: 'Exercise increased caution' },
      'FR': { score: 2, message: 'Exercise increased caution' },
      'JP': { score: 1, message: 'Exercise normal precautions' },
      'GB': { score: 2, message: 'Exercise increased caution' },
      'AU': { score: 1, message: 'Exercise normal precautions' },
      'EG': { score: 3, message: 'Reconsider travel' },
      'BR': { score: 2, message: 'Exercise increased caution' },
      'RU': { score: 4, message: 'Do not travel' }
    };
    
    const advisory = advisories[countryCode] || { score: 2, message: 'Exercise increased caution' };
    
    return {
      data: {
        [countryCode]: advisory
      }
    };
  } catch (error) {
    console.error('Travel advisory fetch error:', error);
    throw error;
  }
};

// Get complete destination information (combines all APIs)
export const getCompleteDestinationInfo = async (locationName) => {
  try {
    // First, geocode the location to get coordinates and country code
    const geoData = await geocodeLocation(locationName);
    
    // Fetch country information
    let countryInfo = [];
    try {
      countryInfo = await getCountryInfo(geoData.country);
    } catch (err) {
      console.warn('Could not fetch country info:', err);
      countryInfo = [];
    }
    
    // Fetch weather data
    const weatherData = await getWeatherForecast(geoData.lat, geoData.lon);
    
    // Fetch currency exchange rates
    let currencyRates = { rates: { USD: 1, EUR: 0.93, GBP: 0.81 } };
    let currencyCode = 'USD';
    try {
      if (countryInfo[0]?.currencies) {
        currencyCode = Object.keys(countryInfo[0].currencies)[0];
        currencyRates = await getCurrencyRates(currencyCode);
      }
    } catch (err) {
      console.warn('Could not fetch currency rates:', err);
    }
    
    // Fetch travel advisory
    const travelAdvisory = await getTravelAdvisory(geoData.country);
    
    // Compile all the data
    return {
      name: geoData.name,
      country: countryInfo[0]?.name?.common || geoData.country,
      coordinates: {
        lat: geoData.lat,
        lon: geoData.lon
      },
      weather: weatherData,
      language: countryInfo[0]?.languages ? Object.values(countryInfo[0].languages)[0] : 'Unknown',
      currency: {
        code: currencyCode,
        name: countryInfo[0]?.currencies?.[currencyCode]?.name || 'Unknown',
        symbol: countryInfo[0]?.currencies?.[currencyCode]?.symbol || '$',
        rates: currencyRates.rates
      },
      emergency: countryInfo[0]?.emergency || { police: '911', ambulance: '911' },
      travelAdvisory: travelAdvisory.data?.[geoData.country],
      flag: countryInfo[0]?.flags?.png || '',
      capital: countryInfo[0]?.capital?.[0] || '',
      population: countryInfo[0]?.population || 0,
      timezone: countryInfo[0]?.timezones?.[0] || 'UTC',
      drivingSide: countryInfo[0]?.car?.side || 'right',
      mapLink: `https://www.google.com/maps/place/${encodeURIComponent(locationName)}`
    };
  } catch (error) {
    console.error('Complete destination info fetch error:', error);
    throw error;
  }
};