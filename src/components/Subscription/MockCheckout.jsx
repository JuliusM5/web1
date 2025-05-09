// src/components/Subscription/MockCheckout.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenizedSubscription from '../../models/TokenizedSubscription';

const MockCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [plan, setPlan] = useState('monthly_premium');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate a payment processor
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCompletePurchase = () => {
    // Generate tokens
    const token = TokenizedSubscription.generateToken();
    const mobileCode = TokenizedSubscription.generateMobileAccessCode();
    
    // Calculate expiry date
    const expiryDate = new Date();
    if (plan === 'yearly_premium') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    // Store subscription
    TokenizedSubscription.storeSubscription(token, plan, expiryDate);
    
    // Store mobile code for success page
    sessionStorage.setItem('mobile_access_code', mobileCode);
    
    // Navigate to success page
    navigate(`/subscription/success?plan=${plan}`);
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Mock Payment Processor</h2>
          <p className="text-sm opacity-75">This simulates a payment gateway for development</p>
        </div>
        
        <div className="p-6">
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-green-800">Payment Authorized</p>
                </div>
                <p className="ml-8 text-sm text-green-700 mt-1">
                  This is a simulated payment for development purposes.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Subscription Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="monthly_premium">Monthly Premium ($9.99/month)</option>
                  <option value="yearly_premium">Yearly Premium ($99.99/year)</option>
                </select>
              </div>
              
              <button
                onClick={handleCompletePurchase}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Complete Purchase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;