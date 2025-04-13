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
            
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter any city or destination to get real-time information</p>
          
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
          
          <p className="mt-2 text-blue-600">
            Destination information available! 
            <button 
              onClick={() => setTab('local')}
              className="ml-2 underline text-blue-500"
            >
              View details
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;