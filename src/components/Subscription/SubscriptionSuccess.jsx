// src/components/Subscription/SubscriptionSuccess.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import TokenizedSubscription from '../../models/TokenizedSubscription';

const SubscriptionSuccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  
  useEffect(() => {
    const processSubscription = async () => {
      try {
        // Get the mobile access code from session storage
        const mobileCode = sessionStorage.getItem('mobile_access_code');
        
        // Get plan from URL params
        const searchParams = new URLSearchParams(location.search);
        const planId = searchParams.get('plan') || 'monthly_premium';
        
        // Get the expiry date from localStorage
        const expiryDate = localStorage.getItem('subscription_expiry');
        
        if (!expiryDate) {
          // If no expiry date found in localStorage, create a mock subscription
          // This is just for development purposes
          const token = TokenizedSubscription.generateToken();
          const newMobileCode = mobileCode || TokenizedSubscription.generateMobileAccessCode();
          const newExpiryDate = new Date();
          
          // Set expiration based on plan
          if (planId === 'yearly_premium') {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
          } else {
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
          }
          
          // Store in localStorage
          TokenizedSubscription.storeSubscription(token, planId, newExpiryDate);
          
          setSubscriptionDetails({
            plan: planId === 'yearly_premium' ? 'Yearly Premium' : 'Monthly Premium',
            expiresAt: newExpiryDate.toISOString(),
            mobileAccessCode: newMobileCode
          });
        } else {
          // Use existing subscription data
          setSubscriptionDetails({
            plan: planId === 'yearly_premium' ? 'Yearly Premium' : 'Monthly Premium',
            expiresAt: expiryDate,
            mobileAccessCode: mobileCode
          });
        }
        
        // Clear the mobile access code from session storage
        sessionStorage.removeItem('mobile_access_code');
        
        // Refresh subscription context
        refreshSubscription();
      } catch (error) {
        console.error('Error processing subscription:', error);
        setError('Failed to process subscription. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };
    
    processSubscription();
  }, [location.search, refreshSubscription]);
  
  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Processing Your Subscription</h2>
        <p className="text-gray-600">Please wait while we activate your premium access...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-red-50 p-4 rounded-lg text-center mb-6">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Subscription Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/subscription/plans')}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Back to Plans
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-500 p-6 text-center">
          <svg className="w-16 h-16 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Subscription Activated!</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Plan:</span>
                <p className="font-medium">{subscriptionDetails?.plan || 'Premium'}</p>
              </div>
              
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Status:</span>
                <p className="font-medium text-green-600">Active</p>
              </div>
              
              <div>
                <span className="text-gray-600 text-sm">Expires:</span>
                <p className="font-medium">{formatDate(subscriptionDetails?.expiresAt)}</p>
              </div>
            </div>
          </div>
          
          {subscriptionDetails?.mobileAccessCode && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Mobile Access Code</h3>
              <p className="text-gray-600 text-sm mb-3">
                Use this code to activate your subscription on our mobile app:
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="bg-white p-3 rounded border border-blue-200 font-mono text-lg mb-2">
                  {subscriptionDetails.mobileAccessCode}
                </div>
                <p className="text-xs text-gray-500">
                  This code will only be shown once. Please save it if you plan to use our mobile app.
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Using Premium Features
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;