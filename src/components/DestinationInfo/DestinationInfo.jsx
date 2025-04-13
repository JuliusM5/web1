import React, { useState } from 'react';

// Simple version that doesn't rely on API calls
function DestinationInfo({ destination }) {
  const [expanded, setExpanded] = useState(false);
  
  // Generate some basic information based on destination name
  const destinationParts = destination?.split(',') || ['Unknown Location'];
  const city = destinationParts[0]?.trim() || 'Unknown City';
  const country = destinationParts[1]?.trim() || 'Unknown Country';
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-3">
        {city}, {country}
      </h2>
      
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-1">Local Information</h3>
          <p className="text-gray-700">
            {city} is a beautiful destination with many attractions and activities for travelers.
          </p>
          
          {expanded ? (
            <>
              <p className="mt-2 text-gray-600">
                The best time to visit {city} is typically during Spring and Fall when the weather is pleasant and tourist crowds are smaller.
              </p>
              <p className="mt-2 text-gray-600">
                For restaurants, try exploring the local cuisine especially in the central areas where you can find authentic dining experiences.
              </p>
              <button 
                onClick={() => setExpanded(false)}
                className="mt-3 text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Show Less
              </button>
            </>
          ) : (
            <button 
              onClick={() => setExpanded(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Show More
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-1">Travel Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Check local transportation options</li>
              <li>• Learn a few basic phrases in the local language</li>
              <li>• Have local currency for small purchases</li>
              <li>• Research local customs and etiquette</li>
            </ul>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-1">Weather</h3>
            <p className="text-sm text-gray-700">
              Typical conditions vary by season.
              Check local forecasts before your trip.
              Pack appropriate clothing for the weather.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationInfo;