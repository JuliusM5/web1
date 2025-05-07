// src/components/CheapFlights/GlobalFlightSearch.jsx

import React, { useState } from 'react';
import GlobalAirportSelector from './GlobalAirportSelector';
import efficientDealService from '../../services/efficientDealService';
import DealCard from './DealCard';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { useContext } from 'react';

const GlobalFlightSearch = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const { isSubscribed } = useContext(SubscriptionContext);
  
  const handleOriginChange = (selected) => {
    setOrigin(selected);
  };
  
  const handleDestinationChange = (selected) => {
    setDestination(selected);
  };
  
  const handleSearch = async () => {
    if (!origin || !destination) {
      setError('Please select both origin and destination airports');
      return;
    }
    
    setError(null);
    setIsSearching(true);
    
    try {
      const result = await efficientDealService.searchFlights(
        origin.code,
        origin.id,
        destination.code,
        destination.id
      );
      
      setSearchResult(result);
      
      if (!result) {
        setError('No flights found for this route. Try a different route or date.');
      }
    } catch (error) {
      console.error('Error searching flights:', error);
      setError('An error occurred while searching for flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSaveDeal = (deal) => {
    efficientDealService.saveDeal(deal);
    // Update the UI to reflect that the deal is saved
    setSearchResult({
      ...searchResult,
      isSaved: true
    });
  };
  
  const handleSetAlert = (deal) => {
    // Logic to set an alert for this deal
    // This would integrate with your subscription system
  };
  
  const swapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };
  
  return (
    <div className="global-flight-search p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Search Flights Worldwide</h2>
      
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <div className="flex-1 mb-2 md:mb-0">
          <GlobalAirportSelector
            label="From"
            value={origin}
            onChange={handleOriginChange}
            placeholder="Any airport worldwide..."
            required
          />
        </div>
        
        <div className="flex items-center justify-center md:pt-6 my-2 md:my-0">
          <button 
            onClick={swapAirports}
            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
            aria-label="Swap airports"
          >
            ⇄
          </button>
        </div>
        
        <div className="flex-1">
          <GlobalAirportSelector
            label="To"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="Any airport worldwide..."
            required
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={handleSearch}
          disabled={isSearching || !origin || !destination}
          className={`w-full p-3 rounded-md text-white font-medium 
            ${isSearching || !origin || !destination 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSearching ? 'Searching...' : 'Search Flights'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {searchResult && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Flight Result</h3>
          <DealCard
            deal={searchResult}
            onSetAlert={() => handleSetAlert(searchResult)}
            onSave={() => handleSaveDeal(searchResult)}
            isSaved={searchResult.isSaved}
          />
        </div>
      )}
      
      {!isSubscribed && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium">Subscribe for Unlimited Searches</h3>
          <p className="text-sm text-gray-600 mt-1">
            Free users can perform 3 searches per day. Subscribe to unlock unlimited searches 
            and get price alerts for your favorite routes.
          </p>
          <button className="mt-2 p-2 bg-blue-600 text-white rounded-md text-sm">
            View Subscription Plans
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalFlightSearch;