// Enhanced mock implementation of weather service APIs

// Mock weather icons for different conditions
const weatherIcons = {
    clear: '☀️',
    cloudy: '☁️',
    partlyCloudy: '⛅',
    rain: '🌧️',
    snow: '❄️',
    storm: '⛈️',
    fog: '🌫️'
  };
  
  // Generate random temperature within a reasonable range
  const getRandomTemp = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Generate mock weather data for a specific date
  const generateWeatherForDate = (date, baseTemp) => {
    const conditions = ['clear', 'cloudy', 'partlyCloudy', 'rain', 'snow', 'storm', 'fog'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Adjust temperature based on condition
    let tempAdjustment = 0;
    if (condition === 'clear') tempAdjustment = 5;
    if (condition === 'cloudy') tempAdjustment = -2;
    if (condition === 'rain') tempAdjustment = -5;
    if (condition === 'snow') tempAdjustment = -10;
    if (condition === 'storm') tempAdjustment = -7;
    
    const tempMax = baseTemp + tempAdjustment + Math.floor(Math.random() * 5);
    const tempMin = tempMax - (5 + Math.floor(Math.random() * 5));
    
    return {
      date,
      condition,
      icon: weatherIcons[condition],
      tempMax,
      tempMin,
      precipitation: condition === 'rain' || condition === 'snow' || condition === 'storm' ? 
        Math.floor(Math.random() * 100) : 0,
      humidity: 40 + Math.floor(Math.random() * 50),
      windSpeed: Math.floor(Math.random() * 30)
    };
  };
  
  // Get mock forecast for a destination
  export const getDestinationForecast = async (destination) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Parse destination to extract city and country
    const parts = destination.split(',');
    const city = parts[0].trim();
    const country = parts.length > 1 ? parts[1].trim() : 'Unknown Country';
    
    // Base temperature varies by destination (very basic geo-logic)
    let baseTemp = 20; // Default base temp
    
    // Adjust base temperature based on destination name
    // This is just mock logic for variety
    if (/tokyo|osaka|kyoto/i.test(city)) baseTemp = 22;
    if (/london|paris|berlin|amsterdam/i.test(city)) baseTemp = 15;
    if (/cairo|dubai|riyadh/i.test(city)) baseTemp = 32;
    if (/sydney|melbourne|brisbane/i.test(city)) baseTemp = 25;
    if (/new york|chicago|toronto/i.test(city)) baseTemp = 18;
    if (/moscow|stockholm|oslo/i.test(city)) baseTemp = 8;
    
    // Get current date
    const today = new Date();
    
    // Generate 7-day forecast
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(today.getDate() + i);
      forecast.push(generateWeatherForDate(
        forecastDate.toISOString().split('T')[0],
        baseTemp
      ));
    }
    
    // Current weather (today's forecast with more detail)
    const current = {
      ...forecast[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      feelsLike: forecast[0].tempMax - Math.floor(Math.random() * 3)
    };
    
    return {
      city,
      country,
      current,
      forecast,
      lastUpdated: new Date().toISOString()
    };
  };
  
  // Convert a mock forecast to the format expected by the UI
  export const formatWeatherData = (weatherData) => {
    // Map condition to weather code for compatibility with existing component
    const conditionToWeatherCode = {
      clear: { main: 'Clear', description: 'clear sky', weathercode: 0 },
      partlyCloudy: { main: 'Clouds', description: 'partly cloudy', weathercode: 2 },
      cloudy: { main: 'Clouds', description: 'overcast', weathercode: 3 },
      rain: { main: 'Rain', description: 'moderate rain', weathercode: 63 },
      snow: { main: 'Snow', description: 'moderate snow fall', weathercode: 73 },
      storm: { main: 'Thunderstorm', description: 'thunderstorm', weathercode: 95 },
      fog: { main: 'Fog', description: 'fog', weathercode: 45 }
    };
    
    // Format current weather
    const current_weather = {
      temperature: weatherData.current.tempMax,
      windspeed: weatherData.current.windSpeed,
      weathercode: conditionToWeatherCode[weatherData.current.condition].weathercode,
      weather: [conditionToWeatherCode[weatherData.current.condition]]
    };
    
    // Format forecast list
    const list = weatherData.forecast.map(day => ({
      dt: new Date(day.date).getTime() / 1000,
      dt_txt: day.date,
      main: {
        temp: (day.tempMax + day.tempMin) / 2,
        temp_min: day.tempMin,
        temp_max: day.tempMax,
        humidity: day.humidity
      },
      weather: [{
        ...conditionToWeatherCode[day.condition]
      }]
    }));
    
    // Return in the format expected by the WeatherForecast component
    return {
      city: {
        name: weatherData.city,
        country: weatherData.country,
        coord: { lat: 0, lon: 0 } // Mock coordinates
      },
      current_weather,
      list
    };
  };
  
  // Wrap the two functions for easy use in components
  export const getWeatherForLocation = async (location) => {
    try {
      const rawForecast = await getDestinationForecast(location);
      return formatWeatherData(rawForecast);
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw new Error(`Failed to get weather for ${location}`);
    }
  };