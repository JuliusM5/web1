// src/components/Subscription/PremiumContentGuard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import premiumFeatures from '../../utils/premiumFeatures';

const PremiumContentGuard = ({
  children,
  fallback,
  featureId,
  usageCount = 0,
  showUpgradeButton = true,
  onUpgradeClick
}) => {
  const { isSubscribed, isLoading } = useSubscription();
  
  // Get feature details
  const feature = featureId ? premiumFeatures.features[featureId] : null;
  
  // Special case for flights feature
  const isFlightsFeature = featureId === 'flight_search';
  
  // Check access to the feature
  const accessCheck = featureId 
    ? premiumFeatures.checkAccess(featureId, { isSubscribed, usageCount })
    : { hasAccess: true, reason: 'free_feature' }; // Default to free access
  
  // Show loader while checking subscription status
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Checking access...</p>
      </div>
    );
  }
  
  // Flight feature with limited signals
  if (isFlightsFeature && !isSubscribed && usageCount >= 3) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">Flight Signals Used</h3>
        <p className="text-gray-600 mb-6">
          You've used all your 3 free flight search signals. 
          Upgrade to premium for unlimited flight searches and deal alerts.
        </p>
        
        {showUpgradeButton && (
          <div className="flex flex-col space-y-3 max-w-xs mx-auto">
            <Link
              to="/subscription/plans"
              className="block w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              onClick={onUpgradeClick}
            >
              Upgrade to Premium
            </Link>
            
            <Link
              to="/premium-features/flight_alerts"
              className="block w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-center"
            >
              Learn More
            </Link>
          </div>
        )}
      </div>
    );
  }
  
  // If user has access, show the content
  if (accessCheck.hasAccess) {
    return children;
  }
  
  // If custom fallback is provided, use it
  if (fallback) {
    return fallback;
  }
  
  // Default premium content gate
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Feature</h3>
      <p className="text-gray-600 mb-6">
        This feature is available exclusively to premium subscribers.
        Upgrade now to access all premium features.
      </p>
      
      {showUpgradeButton && (
        <div className="flex flex-col space-y-3 max-w-xs mx-auto">
          <Link
            to="/subscription/plans"
            className="block w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
            onClick={onUpgradeClick}
          >
            Upgrade to Premium
          </Link>
          
          {feature && (
            <Link
              to={`/premium-features/${feature.id}`}
              className="block w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-center"
            >
              Learn More
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumContentGuard;