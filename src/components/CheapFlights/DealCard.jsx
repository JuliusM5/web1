// src/components/CheapFlights/DealCard.jsx

import React from 'react';

function DealCard({ deal, onNotifyMe }) {
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
  
  // Calculate trip duration in days
  const getTripDuration = (departureDate, returnDate) => {
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
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
              {getTripDuration(deal.departure, deal.return)} days
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
            onClick={() => onNotifyMe(deal.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            Notify Me
          </button>
        </div>
        
        {/* Conditional badge for last-minute deals */}
        {deal.isLastMinute && (
          <div className="mt-3 bg-red-100 text-red-800 text-xs p-2 rounded">
            Last Minute Deal!
          </div>
        )}
        
        {/* Deal details link */}
        <div className="mt-3 text-right">
          <button className="text-blue-500 text-sm hover:text-blue-700 hover:underline">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DealCard;