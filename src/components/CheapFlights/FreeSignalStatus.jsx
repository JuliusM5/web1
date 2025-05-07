// src/components/CheapFlights/FreeSignalStatus.jsx

import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

function FreeSignalStatus() {
  const { isSubscribed, freeAlertsRemaining } = useSubscription();
  const navigate = useNavigate();
  
  // Don't show for subscribed users
  if (isSubscribed) {
    return null;
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Free Flight Alerts</h3>
          <p className="text-gray-600 text-sm mt-1">
            You have <span className="font-semibold">{freeAlertsRemaining} of 3</span> free alerts remaining
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(freeAlertsRemaining / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/subscription/plans')}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md"
        >
          Upgrade
        </button>
      </div>
      
      {freeAlertsRemaining === 0 && (
        <div className="mt-3 text-sm bg-yellow-50 p-3 rounded-md text-yellow-800">
          You've used all your free alerts. Subscribe for unlimited alerts and premium features.
        </div>
      )}
    </div>
  );
}

export default FreeSignalStatus;