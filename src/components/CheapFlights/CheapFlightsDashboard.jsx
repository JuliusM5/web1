// src/components/CheapFlights/CheapFlightsDashboard.jsx

import React, { useState, useEffect } from 'react';
import LocationSelector from './LocationSelector';
import FlightDealsView from './FlightDealsView';
import { useSettings } from '../../context/SettingsContext'; // Use the hook instead

function CheapFlightsDashboard() {
  const [userLocation, setUserLocation] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const { settings, updateSettings } = useSettings(); // Use the hook
  
  // Check if location is already set on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userHomeAirport');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setUserLocation(parsedLocation);
        setSetupComplete(true);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    } else if (settings && settings.homeAirport) {
      // Try to get from settings if available
      const airportCode = settings.homeAirport;
      // This would normally fetch airport details from your database
      // For now, we'll use a hardcoded mapping
      const airportMapping = {
        'KUN': { code: 'KUN', name: 'Kaunas, Lithuania', country: 'Lithuania' },
        'VNO': { code: 'VNO', name: 'Vilnius, Lithuania', country: 'Lithuania' }
      };
      
      if (airportMapping[airportCode]) {
        setUserLocation(airportMapping[airportCode]);
        setSetupComplete(true);
        // Save to localStorage for future use
        localStorage.setItem('userHomeAirport', JSON.stringify(airportMapping[airportCode]));
      }
    }
  }, [settings]);
  
  // Handle location selection
  const handleLocationSelected = (location) => {
    setUserLocation(location);
    setSetupComplete(true);
    
    // Update settings context if possible
    if (updateSettings && location) {
      updateSettings({
        ...settings,
        homeAirport: location.code
      });
    }
  };

  // Fix: Handle location change for the LocationSelector component
  const handleLocationChange = (locationData) => {
    console.log("Location changed:", locationData);
    // You could do something with both origin and destination here
    // For now, we'll just use the origin as the user location
    if (locationData && locationData.origin) {
      handleLocationSelected(locationData.origin);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {!setupComplete && (
        <div className="mb-8">
          {/* Fix: Pass the handleLocationChange function to LocationSelector */}
          <LocationSelector onLocationChange={handleLocationChange} />
        </div>
      )}
      
      {setupComplete && userLocation && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Your Flight Deals</h2>
            <button 
              onClick={() => setSetupComplete(false)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Change Location
            </button>
          </div>
          
          <FlightDealsView userLocation={userLocation.code} />
        </>
      )}
      
      {/* How it works section */}
      <div className="mt-12 bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Select Your Location</h3>
            <p className="text-gray-600">
              Tell us where you're flying from. We'll focus on finding deals from your home airport.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Deal Alerts</h3>
            <p className="text-gray-600">
              We'll monitor flight prices and alert you when we discover exceptional deals worth booking.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Save Time & Money</h3>
            <p className="text-gray-600">
              No need to search constantly. We'll do the work and only notify you about genuine savings.
            </p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">How do you find these deals?</h3>
            <p className="text-gray-600">
              Our system continuously monitors flight prices from major airlines and travel sites. We only alert you when we find prices significantly lower than the usual cost for a route.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">How often will I receive notifications?</h3>
            <p className="text-gray-600">
              You'll only be notified when we find truly exceptional deals - typically 1-3 times per week. We value quality over quantity to prevent notification fatigue.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">What does the premium subscription include?</h3>
            <p className="text-gray-600">
              Premium subscribers get unlimited deal notifications, early access to flash deals before they sell out, and personalized deal recommendations based on your travel preferences.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Can I change my home airport later?</h3>
            <p className="text-gray-600">
              Yes! You can change your selected home airport at any time. Just click the "Change Location" button at the top of the deals page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheapFlightsDashboard;