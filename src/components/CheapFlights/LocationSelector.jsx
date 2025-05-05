import React, { useState, useEffect } from 'react';

// Simple airport input component (replacing AirportAutocomplete)
function SimpleAirportInput({ placeholder, onSelect, selectedAirport }) {
  const [inputValue, setInputValue] = useState('');
  
  // Update input value when selectedAirport changes
  useEffect(() => {
    if (selectedAirport) {
      setInputValue(`${selectedAirport.city} (${selectedAirport.code})`);
    } else {
      setInputValue('');
    }
  }, [selectedAirport]);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    // Simulate selecting an airport on Enter key
    if (e.key === 'Enter' && inputValue.trim()) {
      // Parse city and code from input (assuming format "City (CODE)")
      const match = inputValue.match(/(.*)\s*\(([A-Z]{3})\)/);
      if (match) {
        onSelect({
          city: match[1].trim(),
          code: match[2],
          country: 'Unknown' // Placeholder
        });
      } else {
        // If not in expected format, create simple object with input as city
        onSelect({
          city: inputValue,
          code: inputValue.substring(0, 3).toUpperCase(),
          country: 'Unknown'
        });
      }
    }
  };
  
  return (
    <input
      type="text"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
    />
  );
}

function LocationSelector({ onLocationChange }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState('');
  // Remove the unused loading state
  
  useEffect(() => {
    // Only trigger the change when both origin and destination are selected
    if (origin && destination) {
      onLocationChange({ origin, destination });
    }
  }, [origin, destination, onLocationChange]);

  const handleSwapLocations = () => {
    // Swap origin and destination
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const validateAndSetOrigin = (airport) => {
    if (airport && destination && airport.code === destination.code) {
      setError('Origin and destination cannot be the same');
    } else {
      setError('');
      setOrigin(airport);
    }
  };

  const validateAndSetDestination = (airport) => {
    if (airport && origin && airport.code === origin.code) {
      setError('Origin and destination cannot be the same');
    } else {
      setError('');
      setDestination(airport);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4 relative">
        {/* Origin input */}
        <div className="w-full md:w-2/5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            From
          </label>
          <SimpleAirportInput
            placeholder="Departure city or airport"
            onSelect={validateAndSetOrigin}
            selectedAirport={origin}
          />
        </div>

        {/* Swap button */}
        <button
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:static md:transform-none bg-blue-500 text-white p-2 rounded-full shadow-md hidden md:block hover:bg-blue-600"
          onClick={handleSwapLocations}
          aria-label="Swap origin and destination"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
        </button>

        {/* Destination input */}
        <div className="w-full md:w-2/5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            To
          </label>
          <SimpleAirportInput
            placeholder="Arrival city or airport"
            onSelect={validateAndSetDestination}
            selectedAirport={destination}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default LocationSelector;