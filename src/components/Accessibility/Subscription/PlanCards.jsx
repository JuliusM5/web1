// src/components/Accessibility/Subscription/PlanCards.jsx

import React, { useState, useEffect } from 'react';
import subscriptionService from '../../../services/SubscriptionService';

function PlanCards({ onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      
      try {
        // Updated to use the correct method from subscriptionService
        const plansData = subscriptionService.getPlans();
        setPlans(plansData || []);
      } catch (err) {
        console.error('Error loading subscription plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading subscription plans...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (plans.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">No subscription plans are currently available.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Choose Your Subscription Plan
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-gray-50 p-4 border-b">
              <h2 className="text-xl font-semibold text-center">{plan.name}</h2>
              <div className="mt-2 text-center">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
            </div>
            
            <div className="p-4">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => onSelectPlan(plan)}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanCards;