import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';
import PriceRangeSlider from './PriceRangeSlider';

function FlightFilters({ activeFilters, onChange, flightData }) {
  const { t } = useI18n();
  const [filters, setFilters] = useState(activeFilters);
  const [availableAirlines, setAvailableAirlines] = useState([]);
  const [expanded, setExpanded] = useState({
    price: true,
    airlines: true,
    times: false,
    duration: false,
    stops: true
  });
  
  // Extract unique airlines and price range from flight data
  useEffect(() => {
    if (flightData && flightData.length > 0) {
      // Get unique airlines
      const airlines = [...new Set(flightData.map(flight => flight.airline))];
      setAvailableAirlines(airlines);
      
      // Get min and max prices
      const prices = flightData.map(flight => flight.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      
      // Update price range if it's not set yet or if new data has different bounds
      if (filters.priceRange[0] === 0 && filters.priceRange[1] === 2000) {
        handleFilterChange('priceRange', [minPrice, maxPrice]);
      }
    }
  }, [flightData]);
  
  // Notify parent component when filters change
  useEffect(() => {
    onChange(filters);
  }, [filters, onChange]);
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  const toggleAirline = (airline) => {
    const currentAirlines = [...filters.airlines];
    
    if (currentAirlines.includes(airline)) {
      // Remove airline if already selected
      handleFilterChange('airlines', currentAirlines.filter(a => a !== airline));
    } else {
      // Add airline if not selected
      handleFilterChange('airlines', [...currentAirlines, airline]);
    }
  };
  
  const toggleTimeRange = (timeType, range) => {
    const currentRanges = [...filters[timeType]];
    const rangeIndex = currentRanges.findIndex(
      r => r[0] === range[0] && r[1] === range[1]
    );
    
    if (rangeIndex !== -1) {
      // Remove time range if already selected
      const newRanges = [...currentRanges];
      newRanges.splice(rangeIndex, 1);
      handleFilterChange(timeType, newRanges);
    } else {
      // Add time range if not selected
      handleFilterChange(timeType, [...currentRanges, range]);
    }
  };
  
  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      priceRange: activeFilters.priceRange,
      airlines: [],
      departureTimes: [],
      arrivalTimes: [],
      duration: [0, 24],
      stops: [0, 2]
    });
  };
  
  // Time ranges for departure/arrival filters
  const timeRanges = [
    { label: t('flightSearch.earlyMorning', 'Early Morning'), range: [0, 5] },
    { label: t('flightSearch.morning', 'Morning'), range: [6, 11] },
    { label: t('flightSearch.afternoon', 'Afternoon'), range: [12, 17] },
    { label: t('flightSearch.evening', 'Evening'), range: [18, 23] }
  ];
  
  // Formatted time range for display
  const formatTimeRange = (range) => {
    const [start, end] = range;
    return `${start}:00 - ${end}:59`;
  };
  
  const isTimeRangeSelected = (timeType, range) => {
    return filters[timeType].some(
      r => r[0] === range[0] && r[1] === range[1]
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('flightSearch.filters', 'Filters')}</h2>
        <button
          onClick={clearFilters}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {t('flightSearch.clearAll', 'Clear All')}
        </button>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.priceRange', 'Price Range')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.price ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.price && (
          <div className="mt-3">
            <PriceRangeSlider 
              min={0}
              max={2000}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
            />
          </div>
        )}
      </div>
      
      {/* Airlines Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('airlines')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.airlines', 'Airlines')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.airlines ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.airlines && (
          <div className="mt-3 space-y-2">
            {availableAirlines.length === 0 ? (
              <p className="text-sm text-gray-500">{t('flightSearch.noAirlinesAvailable', 'No airlines available')}</p>
            ) : (
              availableAirlines.map(airline => (
                <div key={airline} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`airline-${airline}`}
                    checked={filters.airlines.includes(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="mr-2"
                  />
                  <label htmlFor={`airline-${airline}`} className="text-sm">
                    {airline}
                  </label>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Stops Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('stops')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.stops', 'Stops')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.stops ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.stops && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="stops-0"
                checked={filters.stops[0] <= 0 && filters.stops[1] >= 0}
                onChange={() => {
                  if (filters.stops[0] > 0) {
                    handleFilterChange('stops', [0, filters.stops[1]]);
                  } else {
                    handleFilterChange('stops', [1, filters.stops[1]]);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor="stops-0" className="text-sm">
                {t('flightSearch.nonstop', 'Nonstop')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="stops-1"
                checked={filters.stops[0] <= 1 && filters.stops[1] >= 1}
                onChange={() => {
                  const newMinStops = filters.stops[0] <= 1 && filters.stops[1] >= 1 
                    ? (filters.stops[0] === 0 ? 0 : 2)
                    : Math.min(filters.stops[0], 1);
                  const newMaxStops = filters.stops[0] <= 1 && filters.stops[1] >= 1
                    ? (filters.stops[1] === 1 ? 0 : filters.stops[1])
                    : Math.max(filters.stops[1], 1);
                  handleFilterChange('stops', [newMinStops, newMaxStops]);
                }}
                className="mr-2"
              />
              <label htmlFor="stops-1" className="text-sm">
                {t('flightSearch.oneStop', '1 Stop')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="stops-2"
                checked={filters.stops[1] >= 2}
                onChange={() => {
                  if (filters.stops[1] >= 2) {
                    handleFilterChange('stops', [filters.stops[0], 1]);
                  } else {
                    handleFilterChange('stops', [filters.stops[0], 2]);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor="stops-2" className="text-sm">
                {t('flightSearch.twoOrMore', '2+ Stops')}
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Departure Times Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('times')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.departureTimes', 'Departure Times')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.times ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.times && (
          <div className="mt-3 space-y-2">
            {timeRanges.map((timeRange) => (
              <div key={`departure-${timeRange.range[0]}`} className="flex items-center">
                <input
                  type="checkbox"
                  id={`departure-${timeRange.range[0]}`}
                  checked={isTimeRangeSelected('departureTimes', timeRange.range)}
                  onChange={() => toggleTimeRange('departureTimes', timeRange.range)}
                  className="mr-2"
                />
                <label htmlFor={`departure-${timeRange.range[0]}`} className="text-sm">
                  {timeRange.label} ({formatTimeRange(timeRange.range)})
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Arrival Times Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('times')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.arrivalTimes', 'Arrival Times')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.times ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.times && (
          <div className="mt-3 space-y-2">
            {timeRanges.map((timeRange) => (
              <div key={`arrival-${timeRange.range[0]}`} className="flex items-center">
                <input
                  type="checkbox"
                  id={`arrival-${timeRange.range[0]}`}
                  checked={isTimeRangeSelected('arrivalTimes', timeRange.range)}
                  onChange={() => toggleTimeRange('arrivalTimes', timeRange.range)}
                  className="mr-2"
                />
                <label htmlFor={`arrival-${timeRange.range[0]}`} className="text-sm">
                  {timeRange.label} ({formatTimeRange(timeRange.range)})
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Duration Filter */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('duration')}
        >
          <h3 className="text-md font-medium">{t('flightSearch.duration', 'Flight Duration')}</h3>
          <svg 
            className={`w-5 h-5 transition-transform ${expanded.duration ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {expanded.duration && (
          <div className="mt-3">
            <input
              type="range"
              min="0"
              max="24"
              value={filters.duration[1]}
              onChange={(e) => handleFilterChange('duration', [0, parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0h</span>
              <span>12h</span>
              <span>24h</span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-medium">
                {t('flightSearch.maxDuration', 'Max Duration')}: {filters.duration[1]} {t('flightSearch.hours', 'hours')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlightFilters;