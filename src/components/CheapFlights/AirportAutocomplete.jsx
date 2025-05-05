import React, { useState, useEffect, useRef } from 'react';

function AirportAutocomplete({ placeholder, onSelect, selectedAirport }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Initialize input value based on selected airport
  useEffect(() => {
    if (selectedAirport) {
      setInputValue(`${selectedAirport.city} (${selectedAirport.code})`);
    } else {
      setInputValue('');
    }
  }, [selectedAirport]);

  // Search for airports when input value changes
  useEffect(() => {
    const searchAirports = async () => {
      // Don't search if there's no input or if input is too short
      if (!inputValue || inputValue.length < 2) {
        setSuggestions([]);
        return;
      }

      // Don't search if the input is just displaying a selected airport
      if (selectedAirport && inputValue === `${selectedAirport.city} (${selectedAirport.code})`) {
        return;
      }

      setLoading(true);
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock airport data
        const mockAirports = [
          { code: 'JFK', city: 'New York', country: 'United States' },
          { code: 'LAX', city: 'Los Angeles', country: 'United States' },
          { code: 'LHR', city: 'London', country: 'United Kingdom' },
          { code: 'CDG', city: 'Paris', country: 'France' },
          { code: 'NRT', city: 'Tokyo', country: 'Japan' },
          { code: 'SYD', city: 'Sydney', country: 'Australia' }
        ];
        
        // Filter airports based on input
        const filteredAirports = mockAirports.filter(airport => 
          airport.city.toLowerCase().includes(inputValue.toLowerCase()) || 
          airport.code.toLowerCase().includes(inputValue.toLowerCase()) ||
          airport.country.toLowerCase().includes(inputValue.toLowerCase())
        );
        
        setSuggestions(filteredAirports);
      } catch (error) {
        console.error('Error searching airports:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchAirports, 300);
    return () => clearTimeout(debounceTimeout);
  }, [inputValue, selectedAirport]); // Added inputValue and selectedAirport as dependencies

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectAirport = (airport) => {
    onSelect(airport);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      
      {loading && (
        <div className="absolute right-2 top-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map(airport => (
            <div
              key={airport.code}
              className="p-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleSelectAirport(airport)}
            >
              <div className="font-medium">{airport.city} ({airport.code})</div>
              <div className="text-sm text-gray-500">{airport.country}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AirportAutocomplete;