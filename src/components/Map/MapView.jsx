import React, { useEffect, useState } from 'react';
import { geocodeLocation } from '.././services';

function MapView({ destination, transportLocations = [] }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
  const [locationName, setLocationName] = useState('');
  
  // Fetch real coordinates for the destination when it changes
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!destination) return;
      
      try {
        const geoData = await geocodeLocation(destination);
        setCoordinates({ lat: geoData.lat, lon: geoData.lon });
        setLocationName(geoData.name);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        // Fallback to a default location or handle error
      }
    };
    
    fetchCoordinates();
  }, [destination]);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [destination]);
  
  // Extract transport locations
  const locations = transportLocations
    .map(transport => ({
      from: transport.from,
      to: transport.to,
      type: transport.type
    }))
    .filter(loc => loc.from && loc.to);
  
  // In a real implementation, this would render an actual map
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {!mapLoaded ? (
        <div className="h-64 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Map container */}
          <div className="h-64 bg-blue-50 relative overflow-hidden">
            {/* Map background (stylized world map) */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                <path d="M473,91c-4,0.8-8,3.8-5,8c-6,6.2-7,2.6-13,2c-3-1.8-7-8.7-11-9c-7-0.8-3,5.2-6,7c-2,1.2-8-0.4-10,1c-3,2.5-2,5.5-1,9c1,3.5,2,7.5-2,10c-3,3.2-9,2.8-13,5c-6,3.2-12,15.5-9,22c2,4.5,9,9.5,9,15c0,4.5-3,13.5-7,16c-6,5.5-13,0.5-19,3c-3,1.5-4,6.5-7,8c-5,3.5-10-3.5-16-2c-4,0.5-6,3.5-10,4c-10,1.5-17-7.5-26-9c-4-0.5-8,0.5-12,0c-5-1.5-7-6.5-13-6c-7,0.5-13,11.5-19,14c-7,2.5-12-7.5-19-8c-8-0.5-16,8.5-24,8c-4-0.5-7-3.5-11-4c-9-0.5-16,8.5-24,10c-4,0.5-9-3.5-13-3c-5,0.5-9,8.5-15,9c-4,0.5-7-8.5-12-8c-4,0.5-5,7.5-9,8c-4,0.5-8-4.5-13-4c-3,0.5-4,3.5-7,4c-4,0.5-6-4.5-10-4c-5,0.5-7,9.5-10,12c-5,3.5-10-0.5-14,2c-3,1.5-2,4.5-4,7c-3,3.5-7,1.5-11,4c-3,2.5-2,7.5-6,9c-4,1.5-7-2.5-11-1c-4,1.5-5,5.5-9,7c-5,1.5-9-1.5-14,0c-3,1.5-5,5.5-8,7c-3,1.5-5,-0.5-8,1c-3,2.5-5,7.5-9,9c-3,1.5-7,-0.5-10,1c-3,1.5-4,8.5-7,10c-3,0.5-6,-2.5-9,-2c-7,0.5-9,6.6-13,13c-3,3.5-10,6.5-14,9c-4,2.5-7,1.5-11,4c-3,3.5-4,12.5-3,17c1,6.5,7,15.5,13,19c10,6.5,24,7.5,36,9c7,0.5,15,-0.5,22,0c4,0.5,7,4.5,11,5c5,0.5,9,-3.5,14,-3c4,0.5,7,4.5,12,5c7,0.5,13,-5.5,19,-5c9,0.5,19,6.5,28,7c8,0.5,16,-1.5,24,-1c6,0.5,13,0.5,19,1c7,0.5,14,1.5,21,2c4,0.5,9,0.5,13,1c2,0.5,8,4.5,10,5c7,1.5,16,-4.5,24,-3c8,0.5,14,5.5,22,6c4,0.5,8,-0.5,12,0c6,0.5,10,1.5,16,2c4,0.5,8,-0.5,13,0c4,0.5,7,5.5,11,6c4,0.5,5,-5.5,9,-5c5,0.5,10,7.5,15,8c6,0.5,12,-5.5,18,-5c4,0.5,7,8.5,11,9c5,0.5,10,-1.5,15,-1c3,0.5,7,3.5,10,4c11,0.5,22,-4.5,33,-4c11,0.5,17,4.5,28,5c8,0.5,17,-0.5,25,0c13,0.5,22,3.5,35,4c7,0.5,14,0.5,21,1c3,0.5,6,2.5,10,3c11,0.5,26,-11.5,36,-16c10,-4.5,16,-5.5,26,-10c11,-5.5,19,-11.5,30,-17c1,-0.5,2,-1.5,4,-2c4,-2.2,6,-4.2,9,-6c4,-2.2,8,-3.2,13,-4c2,1.8,6,3.8,7,5c2,2.8,1,5.8,1,9c0,4.8-1,11.8,0,16c0,10.8,5,31.8,10,39c8,9.8,28,7.8,40,9c20,0.8,32,2.8,52,1c12,-2.2,41,-10.2,54,-16c10,-4.2,14,-13.2,24,-18c4,-3.2,12,-5.2,17,-8c9,-4.2,7,-13.2,16,-17c7,-4.2,16,-1.2,23,-5c10,-4.2,7,-13.2,16,-18c4,-2.2,9,-4.2,13,-6c5,0.8,10,2.8,15,4c8,2.8,21,8.8,30,11c11,2.8,23,1.8,33,1c9,-1.2,12,-6.2,21,-8c3,-0.2,7,-2.2,10,-2c5,0.8,9,5.8,14,7c11,2.8,23,-0.2,34,3c10,2.8,19,2.8,29,6c3,1.8,6,3.8,9,3c5,-0.2,8,-7.2,13,-9c7,-3.2,15,-0.2,21,-5c2,-1.2,2,-4.2,3,-6c3,-3.2,6,-0.2,8,-3c3,-1.2,1,-5.2,3,-7c3,-2.2,8,0.8,11,-2c2,-3.2,0,-10.2,1,-15c1,-5.2,1,-10.2,2,-15c3,-4.2,11,-7.2,15,-11c2,-1.2,11,-15.2,12,-17c3,-5.2,0,-12.2,3,-17c3,-5.2,14,-5.2,18,-10c2,-3.2,0,-8.2,2,-11c2,-3.2,6,-5.2,8,-8c5,-4.2,8,-20.2,9,-26c2,-4.2,0,-10.2,1,-14c1,-5.2,9,-8.2,11,-13c3,-4.2,0,-9.2,3,-13c3,-4.2,11,-6.2,14,-10c3,-4.2,5,-9.2,8,-13c2,-3.2,2,-6.2,4,-9c1,-4.2-2,-9.2-1,-13c2,-4.2,11,-6.2,13,-10c3,-4.2,2,-11.2,5,-15c2,-4.2,0,-9.2,2,-13c1,-4.2,2,-7.2,3,-11c3,-3.2,10,-4.2,13,-7c3,-3.2,2,-7.2,5,-10c2,-3.2,8,-4.2,10,-7c2,-3.2,0,-8.2,2,-11c1,-4.2,3,-8.2,4,-12c3,-3.2,8,-5.2,11,-8" fill="none" stroke="#3b82f6" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Destination marker */}
            <div 
              className="absolute w-6 h-6 transform -translate-x-3 -translate-y-3 z-20"
              style={{ 
                left: `${(coordinates.lon + 180) / 360 * 100}%`, 
                top: `${(90 - coordinates.lat) / 180 * 100}%` 
              }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute w-4 h-4 bg-red-600 rounded-full top-1 left-1"></div>
            </div>
            
            {/* Destination label */}
            <div 
              className="absolute bg-white px-2 py-1 rounded shadow-md z-30 text-sm"
              style={{ 
                left: `${(coordinates.lon + 180) / 360 * 100}%`, 
                top: `${(90 - coordinates.lat) / 180 * 100 - 5}%` 
              }}
            >
              {locationName || destination}
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Trip Map</h4>
              <div className="flex items-center space-x-2 text-sm">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  Destination
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Map showing your destination at {coordinates.lat.toFixed(2)}, {coordinates.lon.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;