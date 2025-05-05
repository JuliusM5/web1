// src/components/CheapFlights/SubscriptionModal.jsx

import React from 'react';

function SubscriptionModal({ onClose, onSubscribe }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-600">Upgrade to Premium</h3>
          <button 
            onClick={onClose}
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
            onClick={onSubscribe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Subscribe Now
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            No Thanks
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Your subscription will automatically renew each month until canceled.
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;