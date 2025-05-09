// src/components/Subscription/PremiumFeatureShowcase.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

const PremiumFeatureShowcase = ({ featureId }) => {
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  
  // Define showcase features
  const features = {
    trip_templates: {
      title: "Trip Templates",
      description: "Save and reuse your favorite trip plans for future adventures.",
      benefits: [
        "Create templates from any trip plan",
        "Customize templates for different types of travel",
        "Share templates with friends and family",
        "Save time planning similar trips"
      ],
      imageUrl: "/images/trip-templates-preview.jpg", // Placeholder
      ctaText: "Start Using Templates"
    },
    flight_alerts: {
      title: "Flight Deal Alerts",
      description: "Get notified when prices drop for your favorite destinations.",
      benefits: [
        "Set up alerts for specific routes",
        "Choose your price threshold",
        "Get instant notifications for deals",
        "Never miss the best time to book"
      ],
      imageUrl: "/images/flight-alerts-preview.jpg", // Placeholder
      ctaText: "Set Up Flight Alerts"
    },
    budget_tracking: {
      title: "Enhanced Budget Tracking",
      description: "Track and analyze your travel expenses with detailed charts and insights.",
      benefits: [
        "Categorize expenses automatically",
        "View spending trends across trips",
        "Set budgets and get warnings",
        "Export reports for expense tracking"
      ],
      imageUrl: "/images/budget-tracking-preview.jpg", // Placeholder
      ctaText: "Track Your Budget"
    },
    unlimited_trips: {
      title: "Unlimited Trip Plans",
      description: "Create and manage as many trip plans as you need, with no limits.",
      benefits: [
        "Plan multiple trips at once",
        "Archive past trips for reference",
        "Clone trips to create variations",
        "Organize trips by categories"
      ],
      imageUrl: "/images/unlimited-trips-preview.jpg", // Placeholder
      ctaText: "Plan Unlimited Trips"
    }
  };
  
  // Default to trip_templates if no feature ID is provided
  const feature = featureId && features[featureId] ? features[featureId] : features.trip_templates;
  
  const handleFeatureAction = () => {
    if (isSubscribed) {
      // If subscribed, navigate to the feature
      switch(featureId) {
        case 'trip_templates':
          navigate('/templates');
          break;
        case 'flight_alerts':
          navigate('/flights/alerts');
          break;
        case 'budget_tracking':
          navigate('/budget');
          break;
        case 'unlimited_trips':
          navigate('/trips');
          break;
        default:
          navigate('/');
      }
    } else {
      // If not subscribed, navigate to plans
      navigate('/subscription/plans');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{feature.title}</h2>
        <p className="text-gray-600 mb-6">{feature.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Key Benefits</h3>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <button
                onClick={handleFeatureAction}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {isSubscribed ? feature.ctaText : "Upgrade to Premium"}
              </button>
              
              {!isSubscribed && (
                <p className="mt-2 text-sm text-gray-500">
                  This is a premium feature available with all subscription plans.
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mt-2">Feature preview</p>
            </div>
          </div>
        </div>
        
        {isSubscribed ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-green-800">You have access to this premium feature</p>
                <p className="text-sm text-green-700">
                  Your subscription is active. Click the button above to start using this feature.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-800">Upgrade to access premium features</p>
                <p className="text-sm text-blue-700">
                  Subscribe to our premium plan to unlock this feature and many more.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumFeatureShowcase;