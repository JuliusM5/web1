// src/components/Accessibility/Subscription/SubscriptionConfirmation.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../hooks/useSubscription';
import AccessibleButton from '../AccessibleButton';

/**
 * Handles subscription confirmation after payment
 * Processes the checkout session and activates the subscription
 */
const SubscriptionConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshSubscription, isSubscribed } = useSubscription();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const canceled = queryParams.get('canceled');
  
  useEffect(() => {
    // If subscription is already active, no need to process
    if (isSubscribed) {
      setIsProcessing(false);
      setSuccess({
        message: 'Your subscription is already active.'
      });
      return;
    }
    
    // Handle payment cancellation
    if (canceled) {
      setIsProcessing(false);
      setError('The payment process was canceled. Your subscription has not been activated.');
      return;
    }
    
    // If no session ID, nothing to process
    if (!sessionId) {
      setIsProcessing(false);
      setError('No subscription information found. Please try subscribing again.');
      return;
    }
    
    // For development, simulate a successful subscription activation
    // In production, this would verify the checkout session with Stripe
    setTimeout(() => {
      // Generate mock data
      const token = 'token_' + Date.now();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Assuming monthly plan
      
      // Store in localStorage
      localStorage.setItem('subscription_token', token);
      localStorage.setItem('subscription_expiry', expiryDate.toISOString());
      
      // Update subscription context
      refreshSubscription();
      
      // Show success message
      setSuccess({
        message: 'Your subscription has been activated successfully!',
        mobileAccessCode: 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-CODE'
      });
      
      setIsProcessing(false);
    }, 1500);
  }, [sessionId, canceled, isSubscribed, refreshSubscription]);
  
  // Loading state
  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
        <div className="flex justify-center">
          <AccessibleButton
            onClick={() => navigate('/subscription/plans')}
            variant="primary"
          >
            Try Again
          </AccessibleButton>
        </div>
      </div>
    );
  }
  
  // Success state
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-4">{success?.message || 'Your subscription is now active.'}</p>
        
        {success?.mobileAccessCode && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">Mobile Access Code</h3>
            <p className="text-sm text-gray-600 mb-2">
              Use this code to access premium features on your mobile device:
            </p>
            <div className="bg-white p-3 rounded-md border border-gray-200 mb-2 font-mono text-lg tracking-wider">
              {success.mobileAccessCode}
            </div>
            <p className="text-xs text-gray-500">
              Open the app on your mobile device, go to Settings, and enter this code to activate your subscription.
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <AccessibleButton
          onClick={() => navigate('/flights/dashboard')}
          variant="primary"
        >
          Start Exploring Premium Features
        </AccessibleButton>
      </div>
    </div>
  );
};

export default SubscriptionConfirmation;