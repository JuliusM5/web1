import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../utils/i18n';
import FlightService from '../../services/FlightService';


function AirportAutocomplete({ value, onChange, onSelect, placeholder }) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const suggestionRef = useRef(null);
  
  // Update inputValue when value prop changes
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
      
      // If the value is a 3-letter airport code, get the airport details
      if (value.length === 3 && !selectedAirport) {
        fetchAirportByCode(value);
      }
    }
  }, [value]);
  
  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchAirportByCode = async (code) => {
    try {
      const airport = await FlightService.getAirportByCode(code);
      if (airport) {
        setSelectedAirport(airport);
      }
    } catch (error) {
      console.error('Failed to fetch airport:', error);
    }
  };
  
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const results = await FlightService.searchAirports(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch airport suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedAirport(null);
    
    // Pass the event to parent component
    if (onChange) {
      onChange(e);
    }
    
    // Show suggestions panel
    setShowSuggestions(true);
    
    // Debounce the API call
    const handler = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  };
  
  const handleSelectSuggestion = (airport) => {
    setSelectedAirport(airport);
    setInputValue(`${airport.city} (${airport.code})`);
    setSuggestions([]);
    setShowSuggestions(false);
    
    if (onSelect) {
      onSelect(airport);
    }
  };
  
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) {
      return null;
    }
    
    return (
      <div 
        ref={suggestionRef}
        className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
      >
        {loading ? (
          <div className="p-2 text-center text-gray-500">
            {t('flightSearch.loading', 'Loading...')}
          </div>
        ) : (
          <ul>
            {suggestions.map(airport => (
              <li 
                key={airport.code}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                onClick={() => handleSelectSuggestion(airport)}
              >
                <div className="flex-1">
                  <div className="font-medium">{airport.city} ({airport.code})</div>
                  <div className="text-sm text-gray-500">{airport.name}, {airport.country}</div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {airport.type === 'airport' 
                    ? t('flightSearch.airport', 'Airport')
                    : t('flightSearch.city', 'City')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded pr-10"
      />
      {selectedAirport && (
        <div className="absolute right-3 top-2.5 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
      {renderSuggestions()}
    </div>
  );
}

export default AirportAutocomplete;