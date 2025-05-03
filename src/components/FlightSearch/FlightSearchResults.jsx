import React, { useState } from 'react';
import { useI18n } from '../../utils/i18n';
import FlightCard from './FlightCard';

function FlightSearchResults({ flights, currency, onSetupAlert }) {
  const { t } = useI18n();
  const [sortOption, setSortOption] = useState('price');
  const [viewMode, setViewMode] = useState('list');
  
  // Currency symbol mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CNY': '¥',
    'INR': '₹'
  };
  
  // Get currency symbol based on currency code
  const getCurrencySymbol = () => {
    return currencySymbols[currency] || '$';
  };
  
  // Sort flights based on selected option
  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortOption) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return a.durationMinutes - b.durationMinutes;
      case 'departure':
        return new Date(a.departureTime) - new Date(b.departureTime);
      case 'arrival':
        return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      default:
        return a.price - b.price;
    }
  });
  
  // Find the lowest price flight
  const lowestPriceFlight = flights.reduce(
    (lowest, flight) => flight.price < lowest.price ? flight : lowest, 
    flights[0]
  );
  
  // Find the fastest flight
  const fastestFlight = flights.reduce(
    (fastest, flight) => flight.durationMinutes < fastest.durationMinutes ? flight : fastest, 
    flights[0]
  );
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handlePriceAlertClick = (flight) => {
    if (onSetupAlert) {
      onSetupAlert(flight);
    }
  };
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h2 className="text-lg font-semibold">
              {t('flightSearch.resultsFound', { count: flights.length }, `${flights.length} flights found`)}
            </h2>
          </div>
          
          <div className="flex space-x-4 items-center">
            <div>
              <label htmlFor="sortOption" className="mr-2 text-sm font-medium">
                {t('flightSearch.sortBy', 'Sort by:')}
              </label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={handleSortChange}
                className="border border-gray-300 rounded p-1 text-sm"
              >
                <option value="price">{t('flightSearch.sortPrice', 'Price')}</option>
                <option value="duration">{t('flightSearch.sortDuration', 'Duration')}</option>
                <option value="departure">{t('flightSearch.sortDeparture', 'Departure Time')}</option>
                <option value="arrival">{t('flightSearch.sortArrival', 'Arrival Time')}</option>
              </select>
            </div>
            
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 px-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                title={t('flightSearch.listView', 'List View')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 px-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                title={t('flightSearch.gridView', 'Grid View')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Best Options Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {lowestPriceFlight && (
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-green-600 font-medium mb-1">
                  {t('flightSearch.bestPrice', 'Best Price')}
                </div>
                <h3 className="font-bold text-lg">
                  {getCurrencySymbol()}{lowestPriceFlight.price}
                </h3>
                <div className="text-gray-500 text-sm">
                  {lowestPriceFlight.airline} • {Math.floor(lowestPriceFlight.durationMinutes / 60)}h {lowestPriceFlight.durationMinutes % 60}m
                </div>
              </div>
              <button
                onClick={() => handlePriceAlertClick(lowestPriceFlight)}
                className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {t('flightSearch.priceAlert', 'Price Alert')}
              </button>
            </div>
          </div>
        )}
        
        {fastestFlight && (
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-blue-600 font-medium mb-1">
                  {t('flightSearch.fastestFlight', 'Fastest Flight')}
                </div>
                <h3 className="font-bold text-lg">
                  {Math.floor(fastestFlight.durationMinutes / 60)}h {fastestFlight.durationMinutes % 60}m
                </h3>
                <div className="text-gray-500 text-sm">
                  {fastestFlight.airline} • {getCurrencySymbol()}{fastestFlight.price}
                </div>
              </div>
              <button
                onClick={() => handlePriceAlertClick(fastestFlight)}
                className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {t('flightSearch.priceAlert', 'Price Alert')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Flight List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
      }>
        {sortedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            currencySymbol={getCurrencySymbol()}
            onSetupAlert={() => handlePriceAlertClick(flight)}
          />
        ))}
      </div>
    </div>
  );
}

export default FlightSearchResults;