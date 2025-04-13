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
  
  // Weather Services
  export { 
    getWeatherForecast, 
    getUVIndexForecast,
    getAirQualityForecast,
    getWeatherAlerts
  } from './realWeatherService';
  
  // Travel Advisory Service
  export {
    getAllTravelAdvisories,
    getCountryTravelAdvisory, 
    getDestinationTravelAdvisory,
    getRiskLevel,
    getSafetyTips
  } from './travelAdvisoryService';
  
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
    // Weather mock data
    getMockWeatherForecast: (destination) => {
      console.log(`Getting mock weather for ${destination}`);
      
      // Return mock weather data
      return {
        city: {
          name: destination.split(',')[0]
        },
        current_weather: {
          temperature: 25,
          feels_like: 27,
          humidity: 65,
          windspeed: 12,
          weather: [
            {
              main: 'Clear',
              description: 'clear sky'
            }
          ]
        },
        list: [
          {
            dt_txt: new Date().toISOString().split('T')[0],
            main: {
              temp_max: 28,
              temp_min: 22
            },
            weather: [{ main: 'Clear' }]
          },
          {
            dt_txt: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            main: {
              temp_max: 29,
              temp_min: 23
            },
            weather: [{ main: 'Clouds' }]
          },
          {
            dt_txt: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            main: {
              temp_max: 26,
              temp_min: 20
            },
            weather: [{ main: 'Rain' }]
          },
          {
            dt_txt: new Date(Date.now() + 259200000).toISOString().split('T')[0],
            main: {
              temp_max: 24,
              temp_min: 19
            },
            weather: [{ main: 'Clouds' }]
          },
          {
            dt_txt: new Date(Date.now() + 345600000).toISOString().split('T')[0],
            main: {
              temp_max: 25,
              temp_min: 20
            },
            weather: [{ main: 'Clear' }]
          }
        ]
      };
    },
    
    // Travel advisory mock data
    getMockTravelAdvisory: (destination) => {
      return {
        name: destination,
        iso_alpha2: 'XX',
        continent: 'Unknown',
        advisory: {
          score: 2, // Low risk
          sources_active: 1,
          message: 'Exercise normal security precautions',
          updated: new Date().toISOString(),
          source: 'TravelEase (Mock)'
        },
        risk_level: 'Low',
        safety_tips: [
          'Research local conditions before traveling',
          'Register with your embassy or consulate',
          'Purchase comprehensive travel insurance',
          'Keep copies of important documents'
        ]
      };
    }
  };