// src/components/CheapFlights/DealCard.jsx

import React from 'react';
import { useContext } from 'react';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { deviceDetection } from '../../utils/deviceDetection';

const DealCard = ({ 
  deal, 
  onSetAlert, 
  isCompact = false,
  onSave,
  isSaved = false
}) => {
  const { isSubscribed } = useContext(SubscriptionContext);
  const deviceInfo = deviceDetection();
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Format duration for display (minutes to hours and minutes)
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Mobile-optimized compact version
  if (isCompact || deviceInfo.isMobile) {
    return (
      <div className="deal-card compact p-3 mb-3 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg">{deal.originName} → {deal.destinationName}</h3>
            <p className="text-sm text-gray-600">{deal.airline}</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-xl text-green-600">${deal.price}</span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-3">
          <div>
            <div>{formatDate(deal.departureTime)}</div>
            <div className="text-gray-600">{formatDuration(deal.duration)}</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={onSetAlert}
            className="text-sm bg-blue-500 text-white py-1 px-3 rounded-full flex-1"
          >
            {isSubscribed ? 'Set Alert' : 'Use Free Alert'}
          </button>
          
          <a 
            href={deal.deep_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm bg-green-500 text-white py-1 px-3 rounded-full text-center flex-1"
          >
            Book Now
          </a>
          
          <button
            onClick={() => onSave && onSave(deal)}
            className={`text-sm ${isSaved ? 'bg-gray-300' : 'bg-gray-200'} py-1 px-2 rounded-full`}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    );
  }
  
  // Desktop full version
  return (
    <div className="deal-card p-4 mb-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-xl mb-1">{deal.originName} → {deal.destinationName}</h3>
          <p className="text-gray-600">{deal.airline}</p>
        </div>
        <div className="text-right">
          <span className="font-bold text-2xl text-green-600">${deal.price}</span>
          <p className="text-sm text-gray-500">one way</p>
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">Departure</div>
          <div className="font-medium">{formatDate(deal.departureTime)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Arrival</div>
          <div className="font-medium">{formatDate(deal.arrivalTime)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Duration</div>
          <div className="font-medium">{formatDuration(deal.duration)}</div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={onSetAlert}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex-1"
        >
          {isSubscribed ? 'Set Price Alert' : 'Use Free Alert (3 max)'}
        </button>
        
        <a 
          href={deal.deep_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-center flex-1"
        >
          Book This Flight
        </a>
        
        <button
          onClick={() => onSave && onSave(deal)}
          className={`${isSaved ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-700'} py-2 px-4 rounded-md`}
        >
          {isSaved ? 'Saved ★' : 'Save ☆'}
        </button>
      </div>
    </div>
  );
};

export default DealCard;