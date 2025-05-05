// src/components/CheapFlights/FlightDealsView.jsx

import React, { useState, useEffect } from 'react';

function FlightDealsView({ userLocation }) {
  const [deals, setDeals] = useState({
    lastMinute: [],
    bestDeals: [],
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lastMinute');
  const [subscriptionStatus, setSubscriptionStatus] = useState('free'); // 'free' or 'premium'
  const [freeNotificationsRemaining, setFreeNotificationsRemaining] = useState(3);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  // Load deals on component mount and when userLocation changes
  useEffect(() => {
    // Skip the fetch attempt and just load mock data directly
    loadMockDeals();
  }, [userLocation]);
  
  // Mock data for development/preview
  const loadMockDeals = () => {
    const mockDeals = {
      lastMinute: [
        {
          id: 'lm-1',
          from: userLocation,
          to: 'BCN',
          destination: 'Barcelona',
          departure: '2025-05-15T10:00:00',
          return: '2025-05-22T12:30:00',
          price: 79.99,
          normalPrice: 129.99,
          discountPercent: 38,
          airline: 'Ryanair',
          expiresAt: '2025-05-05T10:00:00'
        },
        {
          id: 'lm-2',
          from: userLocation,
          to: 'LON',
          destination: 'London',
          departure: '2025-05-10T07:15:00',
          return: '2025-05-17T21:45:00',
          price: 69.99,
          normalPrice: 119.99,
          discountPercent: 42,
          airline: 'WizzAir',
          expiresAt: '2025-05-05T10:00:00'
        }
      ],
      bestDeals: [
        {
          id: 'disc-1',
          from: userLocation,
          to: 'ROM',
          destination: 'Rome',
          departure: '2025-06-20T08:30:00',
          return: '2025-06-27T13:15:00',
          price: 99.99,
          normalPrice: 159.99,
          discountPercent: 37,
          airline: 'Lufthansa',
          expiresAt: '2025-05-07T10:00:00'
        },
        {
          id: 'disc-2',
          from: userLocation,
          to: 'PAR',
          destination: 'Paris',
          departure: '2025-07-05T06:45:00',
          return: '2025-07-12T19:30:00',
          price: 109.99,
          normalPrice: 179.99,
          discountPercent: 39,
          airline: 'AirBaltic',
          expiresAt: '2025-05-07T10:00:00'
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    setDeals(mockDeals);
    setLoading(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Calculate time remaining until a deal expires
  const getTimeRemaining = (expiryDateString) => {
    const now = new Date();
    const expiryDate = new Date(expiryDateString);
    const diffMs = expiryDate - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    
    return `${diffMins}m`;
  };
  
  // Handle enabling notifications for a deal
  const handleEnableNotification = (dealId) => {
    // For premium users, always allow notifications
    // For free users, check remaining notifications
    if (subscriptionStatus === 'premium' || freeNotificationsRemaining > 0) {
      // If free user, decrement remaining notifications
      if (subscriptionStatus === 'free') {
        setFreeNotificationsRemaining(prev => prev - 1);
      }
      
      // This would handle the actual notification setup
      alert('You will be notified about this deal!');
    } else {
      // Show subscribe modal if out of free notifications
      setShowSubscribeModal(true);
    }
  };
  
  // Handle subscription upgrade
  const handleUpgrade = () => {
    setSubscriptionStatus('premium');
    setShowSubscribeModal(false);
    alert('You have been upgraded to premium!');
  };
  
  // Get the active deals based on selected tab
  const activeDeals = activeTab === 'lastMinute' ? deals.lastMinute : deals.bestDeals;
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Flight Deals</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Flight Deals</h2>
          <p className="text-gray-600 mt-1">From Airport: {userLocation}</p>
        </div>
        
        {subscriptionStatus === 'free' && (
          <div className="mt-4 md:mt-0 text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full">
            Free Notifications: {freeNotificationsRemaining} / 3
          </div>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('lastMinute')}
            className={`py-4 px-1 ${
              activeTab === 'lastMinute'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Last Minute
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {deals.lastMinute.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bestDeals')}
            className={`py-4 px-1 ${
              activeTab === 'bestDeals'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Best Deals
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {deals.bestDeals.length}
            </span>
          </button>
        </nav>
      </div>
      
      {/* Deal Cards */}
      {activeDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDeals.map(deal => (
            <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="bg-blue-500 text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{deal.from} → {deal.to}</h3>
                  <span className="bg-yellow-400 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    {deal.discountPercent}% off
                  </span>
                </div>
                <div className="mt-1 text-sm text-blue-100">
                  Expires: {getTimeRemaining(deal.expiresAt)}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Departure</p>
                    <p className="font-semibold">{formatDate(deal.departure)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="font-semibold">
                      {Math.round((new Date(deal.return) - new Date(deal.departure)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Return</p>
                    <p className="font-semibold">{formatDate(deal.return)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-gray-500 text-xs">{deal.airline}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-blue-600">€{deal.price.toFixed(2)}</p>
                      <p className="text-sm line-through text-gray-400 ml-2">€{deal.normalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEnableNotification(deal.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deals Found</h3>
          <p className="text-gray-500">Check back soon for new deals</p>
        </div>
      )}
      
      {/* Last Updated Timestamp */}
      {deals.timestamp && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Last Updated: {new Date(deals.timestamp).toLocaleString()}
        </div>
      )}
      
      {/* Subscription promotion */}
      {subscriptionStatus === 'free' && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Get More Deal Notifications</h3>
              <p className="text-blue-700">Upgrade to premium for unlimited notifications and exclusive deals</p>
            </div>
            <button 
              onClick={() => setShowSubscribeModal(true)}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
      
      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-600">Upgrade to Premium</h3>
              <button 
                onClick={() => setShowSubscribeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-center text-blue-700">
                  You've used all your free notifications
                </p>
              </div>
              
              <h4 className="font-bold text-lg mb-3">
                Premium Benefits:
              </h4>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited deal notifications</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Early access to exclusive flash deals</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Personalized deal recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>No ads or promotional content</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-3xl font-bold text-blue-600">€4.99</span>
                <span className="text-gray-600 ml-1">/ month</span>
              </div>
              <p className="text-center text-gray-500 text-sm">
                Cancel anytime
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Subscribe Now
              </button>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightDealsView;