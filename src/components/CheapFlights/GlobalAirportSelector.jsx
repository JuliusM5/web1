// src/components/CheapFlights/GlobalAirportSelector.jsx

import React, { useState, useEffect, useRef } from 'react';
import efficientDealService from '../../services/efficientDealService';
import { useDebounce } from '../../utils/helpers';

const GlobalAirportSelector = ({
  label,
  value,
  onChange,
  placeholder = "Search for any airport worldwide...",
  required = false,
  className = "",
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const selectorRef = useRef(null);
  
  // Load suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // This calls our service which can search ANY airport globally
        const results = await efficientDealService.searchAirports(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching airport suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery]);
  
  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
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
    setShowSuggestions(true);
  };
  
  const handleSelectAirport = (airport) => {
    setQuery(airport.name + (airport.code ? ` (${airport.code})` : ''));
    onChange({
      code: airport.code,
      id: airport.id,
      name: airport.name,
      country: airport.country
    });
    setShowSuggestions(false);
  };
  
  return (
    <div className={`global-airport-selector ${className}`} ref={selectorRef}>
      <label htmlFor={`airport-input-${label}`} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={`airport-input-${label}`}
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
            {suggestions.map((airport) => (
              <li
                key={`${airport.code}-${airport.id}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => handleSelectAirport(airport)}
              >
                <div>
                  <div className="font-medium">
                    {airport.name} 
                    {airport.code && <span className="ml-1 text-blue-600">({airport.code})</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {airport.city && airport.city !== airport.name && `${airport.city}, `}
                    {airport.country}
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

export default GlobalAirportSelector;