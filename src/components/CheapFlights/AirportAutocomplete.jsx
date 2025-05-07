// src/components/CheapFlights/AirportAutocomplete.jsx

import React, { useState, useEffect, useRef } from 'react';
import skyscannerService from '../../services/skyscannerService';
import { useDebounce } from '../../utils/helpers';

const AirportAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = "Search for airports or cities...",
  required = false,
  className = "",
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const autocompleteRef = useRef(null);
  
  // Load suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await skyscannerService.locationAutocomplete(debouncedQuery);
        // Process response data
        const locations = response.places || [];
        setSuggestions(locations);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery]);
  
  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    onChange({ name: inputValue, id: '' }); // Clear ID when user is typing
    setShowSuggestions(true);
  };
  
  const handleSelectLocation = (location) => {
    setQuery(location.name);
    setSelectedLocationId(location.id);
    onChange({ name: location.name, id: location.id });
    setShowSuggestions(false);
  };
  
  return (
    <div className={`airport-autocomplete ${className}`} ref={autocompleteRef}>
      <label htmlFor={`location-input-${label}`} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={`location-input-${label}`}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => debouncedQuery.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full p-2 border rounded-md"
          disabled={disabled}
          required={required}
        />
        
        {isLoading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 mt-1 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => handleSelectLocation(suggestion)}
              >
                <div>
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-sm text-gray-500">
                    {suggestion.cityName || suggestion.countryName || ''}
                    {suggestion.countryName && suggestion.cityName !== suggestion.countryName 
                      ? `, ${suggestion.countryName}` 
                      : ''}
                    {suggestion.iata ? ` (${suggestion.iata})` : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AirportAutocomplete;