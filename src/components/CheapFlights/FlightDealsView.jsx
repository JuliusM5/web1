// src/components/CheapFlights/FlightDealsView.jsx

import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import GlobalAirportSelector from './GlobalAirportSelector';
import DealCard from './DealCard';
import flightDataSharingService from '../../services/flightDataSharingService';
import skyscannerService from '../../services/skyscannerService';
import AuthContext from '../../context/AuthContext'; // Assuming you have this

const FlightDealsView = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isSubscribed } = useContext(SubscriptionContext);
  const { user } = useContext(AuthContext); // Get current user
  const [remainingSignals, setRemainingSignals] = useState(3);
  
  // Load remaining signals on component mount
  useEffect(() => {
    if (user && !isSubscribed) {
      const remaining = flightDataSharingService.getRemainingFreeSignals(user.id);
      setRemainingSignals(remaining);
    }
  }, [user, isSubscribed]);
  
  const handleSearch = async () => {
    if (!origin || !destination) {
      setError('Please select both origin and destination');
      return;
    }
    
    // Check if free user has signals remaining
    if (!isSubscribed) {
      if (remainingSignals <= 0) {
        setError('You have used all your free signals. Subscribe for unlimited searches!');
        return;
      }
      
      // Use a free signal
      const signalsUsed = flightDataSharingService.recordFreeSignalUsage(user.id);
      setRemainingSignals(3 - signalsUsed);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the sharing service to efficiently get flight data
      // This will reuse data for the same route across all users
      const flightData = await flightDataSharingService.getFlightData(
        origin.code,
        destination.code,
        origin.id,
        destination.id,
        skyscannerService
      );
      
      // Process the data into UI-friendly format
      const deals = processFlightData(flightData, origin, destination);
      
      setSearchResults(deals);
      
      if (deals.length === 0) {
        setError('No flights found for this route. Try different airports or dates.');
      }
    } catch (error) {
      console.error('Error searching flights:', error);
      setError('An error occurred while searching for flights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process raw API data into UI-friendly format
  const processFlightData = (data, origin, destination) => {
    if (!data || !data.itineraries || data.itineraries.length === 0) {
      return [];
    }
    
    // Sort by price
    const sortedItineraries = [...data.itineraries].sort((a, b) => {
      const priceA = a.price ? a.price.amount : Infinity;
      const priceB = b.price ? b.price.amount : Infinity;
      return priceA - priceB;
    });
    
    // Convert to deal cards format
    return sortedItineraries.slice(0, 5).map(itinerary => {
      // Extract all the details
      const price = itinerary.price ? itinerary.price.amount : 0;
      const departureTime = itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].departure : new Date().toISOString();
      const arrivalTime = itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].arrival : new Date().toISOString();
      const duration = itinerary.legs && itinerary.legs[0] ? 
        itinerary.legs[0].durationInMinutes : 0;
      const airline = itinerary.legs && itinerary.legs[0] && itinerary.legs[0].carriers ? 
        itinerary.legs[0].carriers.marketing[0].name : 'Unknown Airline';
        
      return {
        id: `${origin.code}-${destination.code}-${price}-${Date.now()}`,
        origin: origin.code,
        originName: origin.name,
        destination: destination.code,
        destinationName: destination.name,
        price,
        departureTime,
        arrivalTime,
        duration,
        airline,
        deep_link: createDeepLink(origin.code, destination.code, departureTime)
      };
    });
  };
  
  const createDeepLink = (origin, destination, departureDate) => {
    const formattedDate = new Date(departureDate).toISOString().split('T')[0];
    return `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${formattedDate}/`;
  };
  
  return (
    <div className="flight-deals-view p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Search Flight Deals</h2>
      
      {!isSubscribed && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Free signals remaining: </span>
              <span className={remainingSignals > 0 ? 'text-green-600' : 'text-red-600'}>
                {remainingSignals}/3
              </span>
              {remainingSignals === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  You've used all your free signals. Subscribe for unlimited searches.
                </p>
              )}
              {remainingSignals > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Free users get 3 signals total. Use them wisely!
                </p>
              )}
            </div>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm">
              Subscribe
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <div className="flex-1 mb-3 md:mb-0">
          <GlobalAirportSelector
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder="Any airport in the world..."
          />
        </div>
        
        <div className="flex-1">
          <GlobalAirportSelector
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="Any airport in the world..."
          />
        </div>
      </div>
      
      <button
        onClick={handleSearch}
        disabled={isLoading || !origin || !destination || (!isSubscribed && remainingSignals === 0)}
        className={`w-full p-3 rounded-md font-medium text-white
          ${isLoading || !origin || !destination || (!isSubscribed && remainingSignals === 0) ? 
            'bg-gray-400 cursor-not-allowed' : 
            'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Searching...' : 
         !isSubscribed && remainingSignals === 0 ? 'No Free Signals Remaining' :
         'Search Flights'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Flight Deals</h3>
          <div className="space-y-4">
            {searchResults.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onSetAlert={() => {}}
                onSave={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightDealsView;