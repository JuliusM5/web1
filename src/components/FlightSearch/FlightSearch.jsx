import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';
import { useSettings } from '../../context/SettingsContext';
import FlightSearchForm from './FlightSearchForm';
import FlightSearchResults from './FlightSearchResults';
import FlightFilters from './FlightFilters';
import NotificationSetup from './NotificationSetup';
import FlightSearchSkeleton from './FlightSearchSkeleton';
import FlightService from '../../services/FlightService';

function FlightSearch() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    nonStop: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 2000],
    airlines: [],
    departureTimes: [],
    arrivalTimes: [],
    duration: [0, 24],
    stops: [0, 2]
  });
  const [showNotificationSetup, setShowNotificationSetup] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  // Reset any errors when search parameters change
  useEffect(() => {
    if (error) setError(null);
  }, [searchParams]);
  
  const handleSearch = async (params) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      // Merge current search params with new ones
      const updatedParams = { ...searchParams, ...params };
      setSearchParams(updatedParams);
      
      // Call flight service to fetch results
      const results = await FlightService.searchFlights(updatedParams);
      setSearchResults(results);
    } catch (err) {
      console.error('Flight search error:', err);
      setError(t('flightSearch.errors.searchFailed', 'Failed to search flights. Please try again.'));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    // Filters are applied client-side to the existing results
    // You might want to trigger a new search with the filters for production use
  };
  
  const applyFilters = (flights) => {
    if (!flights || flights.length === 0) return [];
    
    return flights.filter(flight => {
      // Price filter
      if (flight.price < activeFilters.priceRange[0] || 
          flight.price > activeFilters.priceRange[1]) {
        return false;
      }
      
      // Airlines filter
      if (activeFilters.airlines.length > 0 && 
          !activeFilters.airlines.includes(flight.airline)) {
        return false;
      }
      
      // Departure time filter
      if (activeFilters.departureTimes.length > 0) {
        const departureHour = new Date(flight.departureTime).getHours();
        const matchesDeparture = activeFilters.departureTimes.some(timeRange => {
          const [start, end] = timeRange;
          return departureHour >= start && departureHour <= end;
        });
        if (!matchesDeparture) return false;
      }
      
      // Arrival time filter
      if (activeFilters.arrivalTimes.length > 0) {
        const arrivalHour = new Date(flight.arrivalTime).getHours();
        const matchesArrival = activeFilters.arrivalTimes.some(timeRange => {
          const [start, end] = timeRange;
          return arrivalHour >= start && arrivalHour <= end;
        });
        if (!matchesArrival) return false;
      }
      
      // Duration filter (in hours)
      const durationHours = flight.durationMinutes / 60;
      if (durationHours < activeFilters.duration[0] || 
          durationHours > activeFilters.duration[1]) {
        return false;
      }
      
      // Stops filter
      if (flight.stops < activeFilters.stops[0] || 
          flight.stops > activeFilters.stops[1]) {
        return false;
      }
      
      return true;
    });
  };
  
  const filteredResults = applyFilters(searchResults);
  
  const setupPriceAlert = (flight) => {
    setSelectedFlight(flight);
    setShowNotificationSetup(true);
  };
  
  const closeNotificationSetup = () => {
    setShowNotificationSetup(false);
    setSelectedFlight(null);
  };
  
  const saveNotification = async (notificationSettings) => {
    try {
      await FlightService.savePriceAlert({
        ...notificationSettings,
        flight: selectedFlight,
        user: settings.user?.id || 'anonymous',
      });
      
      closeNotificationSetup();
      // Show success message
    } catch (err) {
      console.error('Failed to save notification:', err);
      // Show error message
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('flightSearch.title', 'Flight Search')}</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <FlightSearchForm 
          initialValues={searchParams}
          onSearch={handleSearch}
        />
      </div>
      
      {hasSearched && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <FlightFilters 
              activeFilters={activeFilters}
              onChange={handleFilterChange}
              flightData={searchResults}
            />
          </div>
          
          <div className="w-full md:w-3/4">
            {isLoading ? (
              <FlightSearchSkeleton />
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : filteredResults.length > 0 ? (
              <FlightSearchResults 
                flights={filteredResults}
                currency={settings.preferences?.defaultCurrency || 'USD'}
                onSetupAlert={setupPriceAlert}
              />
            ) : hasSearched ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                {t('flightSearch.noResults', 'No flights found matching your criteria. Try adjusting your search or filters.')}
              </div>
            ) : null}
          </div>
        </div>
      )}
      
      {showNotificationSetup && selectedFlight && (
        <NotificationSetup 
          flight={selectedFlight}
          onSave={saveNotification}
          onClose={closeNotificationSetup}
          currency={settings.preferences?.defaultCurrency || 'USD'}
        />
      )}
    </div>
  );
}

export default FlightSearch;