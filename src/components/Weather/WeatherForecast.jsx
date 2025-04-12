import React, { useState, useEffect } from 'react';
import { geocodeLocation, getWeatherForecast } from '../../services';

// This is a compatibility wrapper around RealWeatherForecast
// It ensures backward compatibility with any code that might be using WeatherForecast
function WeatherForecast({ destination }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  
  // Fetch weather data when destination changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!destination) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // First, geocode the location to get coordinates
        const geoData = await geocodeLocation(destination);
        
        // Then, fetch the weather forecast using the coordinates
        const weatherData = await getWeatherForecast(geoData.lat, geoData.lon);
        
        setForecast(weatherData);
      } catch (err) {
        setError(`Failed to load weather for ${destination}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [destination]);
  
  if (loading) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-gray-600">Loading weather forecast...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (!forecast) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-center text-gray-600">Enter a destination to see weather forecast.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-3">Weather Forecast for {forecast.city.name}</h3>
      
      {/* Current Weather */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Current Weather</h4>
            <p className="text-3xl font-bold mt-1">
              {Math.round(forecast.current_weather.temperature)}°C
            </p>
            <p className="capitalize text-gray-600">
              {forecast.current_weather.weather[0].description}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Wind: {forecast.current_weather.windspeed} km/h</p>
          </div>
        </div>
      </div>
      
      {/* 5-Day Forecast */}
      <h4 className="font-medium mb-2">5-Day Forecast</h4>
      <div className="grid grid-cols-5 gap-2">
        {forecast.list.slice(0, 5).map((day, index) => (
          <div key={index} className="bg-white p-2 rounded-lg shadow-sm text-center">
            <p className="text-xs text-gray-600">
              {new Date(day.dt_txt).toLocaleDateString('en-US', {weekday: 'short'})}
            </p>
            <p className="text-sm font-medium">
              {Math.round(day.main.temp_max)}° 
              <span className="text-gray-500"> {Math.round(day.main.temp_min)}°</span>
            </p>
            <p className="text-xs capitalize text-gray-600 truncate">
              {day.weather[0].main}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Data from Open-Meteo API</p>
      </div>
    </div>
  );
}

export default WeatherForecast;