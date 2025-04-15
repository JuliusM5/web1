import React, { useState } from 'react';
import { calculateDuration } from '../../utils/helpers';
import { reverseGeocode } from '../../services';

function BasicInfoTab({ 
  destination, setDestination, startDate, setStartDate, 
  endDate, setEndDate, budget, setBudget, setTab 
}) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Get user's location and use reverse geocoding to set destination
  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get coordinates
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get location name
          const locationData = await reverseGeocode(latitude, longitude);
          
          // Set the destination
          setDestination(`${locationData.name}, ${locationData.country}`);
          setLocationLoading(false);
        } catch (error) {
          setLocationError("Failed to get location name");
          setLocationLoading(false);
        }
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
        setLocationLoading(false);
      }
    );
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Destination</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="w-full p-2 border border-gray-300 rounded"
              />
              {locationLoading && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <button
              onClick={detectLocation}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              title="Detect my location"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter any city or destination to get started</p>
          
          {locationError && (
            <p className="text-xs text-red-500 mt-1">{locationError}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Budget ($)</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="Estimated budget"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {destination && startDate && endDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p><strong>Duration:</strong> {calculateDuration(startDate, endDate)} days</p>
          {budget && (
            <p><strong>Budget:</strong> ${budget} (${(budget / calculateDuration(startDate, endDate)).toFixed(2)}/day)</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;