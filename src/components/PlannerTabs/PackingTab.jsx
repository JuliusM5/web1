// src/components/PlannerTabs/PackingTab.jsx

import React, { useState, useEffect } from 'react';
import EnhancedPackingList from '../Packing/EnhancedPackingList';

/**
 * Packing Tab component for the trip planner
 * Provides a dedicated tab for packing functionality
 */
function PackingTab({ 
  tripTasks, 
  setTripTasks, 
  destination, 
  startDate, 
  endDate
}) {
  // Trip type options for packing recommendations
  const tripTypes = [
    { id: 'leisure', name: 'Leisure/General' },
    { id: 'business', name: 'Business Trip' },
    { id: 'beach', name: 'Beach Vacation' },
    { id: 'adventure', name: 'Adventure/Hiking' },
    { id: 'winter', name: 'Winter/Ski Trip' },
    { id: 'city', name: 'City Break' }
  ];
  
  // State for trip type selection
  const [selectedTripType, setSelectedTripType] = useState('leisure');
  
  // Detect trip type based on destination (optional enhancement)
  useEffect(() => {
    if (!destination) return;
    
    const destinationLower = destination.toLowerCase();
    
    if (destinationLower.includes('beach') || 
        destinationLower.includes('coast') || 
        destinationLower.includes('island')) {
      setSelectedTripType('beach');
    } else if (destinationLower.includes('ski') || 
               destinationLower.includes('snow') || 
               destinationLower.includes('mountain')) {
      setSelectedTripType('winter');
    } else if (destinationLower.includes('hike') || 
               destinationLower.includes('adventure') || 
               destinationLower.includes('national park')) {
      setSelectedTripType('adventure');
    } else if (destinationLower.includes('business') || 
               destinationLower.includes('conference') || 
               destinationLower.includes('meeting')) {
      setSelectedTripType('business');
    } else if (destinationLower.includes('city') || 
               destinationLower.includes('town') || 
               destinationLower.includes('urban')) {
      setSelectedTripType('city');
    }
  }, [destination]);
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Packing List</h3>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Trip Type</label>
        <div className="flex flex-wrap gap-2">
          {tripTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedTripType(type.id)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedTripType === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Select your trip type to get tailored packing recommendations
        </p>
      </div>
      
      {!destination && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Please set your destination in the Basic Info tab to get personalized packing recommendations.
          </p>
        </div>
      )}
      
      <EnhancedPackingList
        tripTasks={tripTasks}
        setTripTasks={setTripTasks}
        destination={destination || 'Your Trip'}
        startDate={startDate}
        endDate={endDate}
        tripType={selectedTripType}
      />
    </div>
  );
}

// Add default export
export default PackingTab;