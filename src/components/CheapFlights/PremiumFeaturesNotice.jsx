// src/components/CheapFlights/PremiumFeaturesNotice.jsx

import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

function PremiumFeaturesNotice() {
  const { isSubscribed } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  
  // Don't show for subscribed users or if dismissed
  if (isSubscribed || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden z-20">
      <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium">Unlock Premium Features</h3>
        <button
          onClick={() => setDismissed(true)}
          className="text-white hover:text-blue-100"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 mb-3">
          Subscribe to get unlimited flight alerts, price history graphs, and more premium features.
        </p>
        
        <ul className="mb-4 space-y-2">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Unlimited flight alerts</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Price history charts</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Ad-free experience</span>
          </li>
        </ul>
        
        <button
          onClick={() => navigate('/subscription/plans')}
          className="w-full py-2 bg-blue-600 text-white rounded-md text-center"
        >
          See Plans
        </button>
      </div>
    </div>
  );
}

export default PremiumFeaturesNotice;