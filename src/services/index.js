// Simple mock services that return placeholder data
// This helps fix import errors without requiring actual API integration

// Mock function for geocoding
export const geocodeLocation = async (locationName) => {
    return {
      lat: 40.7128,  // Default to New York coordinates
      lon: -74.0060,
      name: locationName.split(',')[0],
      country: 'US'
    };
  };
  
  // Mock function for reverse geocoding
  export const reverseGeocode = async (lat, lon) => {
    return {
      name: 'Current Location',
      country: 'United States'
    };
  };
  
  // Mock function for weather forecasts
  export const getWeatherForecast = async (lat, lon) => {
    // Return a mock weather forecast object
    return {
      city: {
        name: `Location at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        coord: { lat, lon }
      },
      current_weather: {
        temperature: 22,
        windspeed: 10,
        weathercode: 0,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
      },
      daily: {
        time: Array(5).fill(0).map((_, i) => new Date(Date.now() + i * 86400000).toISOString().split('T')[0]),
        weathercode: [0, 1, 2, 0, 1],
        temperature_2m_max: [24, 25, 23, 22, 26],
        temperature_2m_min: [18, 19, 17, 16, 20],
        precipitation_sum: [0, 0, 2, 0, 0],
        precipitation_hours: [0, 0, 3, 0, 0]
      },
      list: Array(5).fill(0).map((_, i) => ({
        dt: Date.now() / 1000 + i * 86400,
        dt_txt: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        main: {
          temp: 22,
          temp_min: 18,
          temp_max: 25,
          humidity: 70
        },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
      }))
    };
  };
  
  // Mock function for country information
  export const getCountryInfo = async (countryCode) => {
    return [{
      name: { common: 'United States' },
      currencies: { USD: { name: 'US Dollar', symbol: '$' } },
      languages: { eng: 'English' },
      capital: ['Washington D.C.'],
      population: 331000000,
      timezones: ['UTC-05:00'],
      car: { side: 'right' },
      flags: { png: 'https://example.com/flag.png' }
    }];
  };
  
  // Mock function for currency rates
  export const getCurrencyRates = async (baseCurrency) => {
    return {
      rates: {
        USD: 1,
        EUR: 0.93,
        GBP: 0.81,
        JPY: 150.2,
        CAD: 1.36
      }
    };
  };
  
  // Mock function for travel advisories
  export const getTravelAdvisory = async (countryCode) => {
    return {
      data: {
        [countryCode]: { score: 2, message: 'Exercise increased caution' }
      }
    };
  };
  
  // Mock function for complete destination information
  export const getCompleteDestinationInfo = async (locationName) => {
    return {
      name: locationName.split(',')[0],
      country: 'United States',
      coordinates: { lat: 40.7128, lon: -74.0060 },
      weather: await getWeatherForecast(40.7128, -74.0060),
      language: 'English',
      currency: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        rates: { USD: 1, EUR: 0.93, GBP: 0.81 }
      },
      emergency: { police: '911', ambulance: '911' },
      travelAdvisory: { score: 2, message: 'Exercise increased caution' },
      flag: 'https://example.com/flag.png',
      capital: 'Washington D.C.',
      population: 331000000,
      timezone: 'UTC-05:00',
      drivingSide: 'right',
      mapLink: `https://www.google.com/maps/place/${encodeURIComponent(locationName)}`
    };
  };