// src/components/Accessibility/Subscription/ManageSubscription.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../hooks/useSubscription';
import TokenizedSubscription from '../../../models/TokenizedSubscription';

function ManageSubscription() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { isSubscribed, plan, expiresAt, cancelSubscription } = useSubscription();
  
  useEffect(() => {
    // Load subscription details
    const loadSubscription = async () => {
      setIsLoading(true);
      
      try {
        if (!isSubscribed) {
          navigate('/subscription/plans');
          return;
        }
        
        // Get remaining days
        const expiry = expiresAt ? new Date(expiresAt) : null;
        const today = new Date();
        const remainingDays = expiry ? Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))) : 0;
        
        // Format the plan name
        const planName = formatPlanName(plan);
        
        setSubscription({
          plan: planName,
          expiresAt: expiresAt,
          remainingDays,
          isActive: true
        });
      } catch (err) {
        console.error('Error loading subscription details:', err);
        setError('Failed to load subscription details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, [isSubscribed, plan, expiresAt, navigate]);
  
  const formatPlanName = (planId) => {
    if (!planId) return 'Premium';
    
    if (planId === 'yearly_premium') {
      return 'Yearly Premium';
    } else if (planId === 'monthly_premium') {
      return 'Monthly Premium';
    }
    
    return planId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setError('');
    
    try {
      const result = await cancelSubscription();
      
      if (result.success) {
        setSuccess('Your subscription has been cancelled successfully.');
        setShowConfirmCancel(false);
        
        // Update the local subscription info
        setSubscription(prev => ({
          ...prev,
          isActive: false,
          isCancelled: true
        }));
      } else {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };
  
  const generateMobileCode = () => {
    const mobileCode = TokenizedSubscription.generateMobileAccessCode();
    sessionStorage.setItem('mobile_access_code', mobileCode);
    navigate('/subscription/success');
  };
  
  if (isLoading) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subscription details...</p>
      </div>
    );
  }
  
  if (!isSubscribed) {
    return null; // Redirect happens in useEffect
  }
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Your Subscription</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <h2 className="text-lg font-semibold">Subscription Details</h2>
        </div>
        
        <div className="p-4">
          {subscription?.isCancelled ? (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
              <p className="font-medium">Your subscription has been cancelled</p>
              <p className="text-sm">
                You still have access to premium features until your subscription expires 
                on {formatDate(subscription.expiresAt)}.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-lg font-medium">{subscription?.plan || 'Premium'}</p>
                  <p className="text-sm text-gray-600">
                    Expires on {formatDate(subscription?.expiresAt)}
                  </p>
                </div>
                
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                You have <span className="font-medium">{subscription?.remainingDays || 0}</span> days remaining in your subscription.
              </p>
              
              <div className="h-2 bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 100 - (subscription?.remainingDays || 0) / 30 * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Premium Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited trip plans
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Trip templates
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Flight deal alerts
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enhanced budget tracking
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Mobile Access</h3>
              <p className="text-sm text-gray-600 mb-2">
                Use your subscription on our mobile app by generating a mobile access code.
              </p>
              
              <button
                onClick={generateMobileCode}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              >
                Generate Mobile Code
              </button>
            </div>
            
            {!subscription?.isCancelled && (
              <div className="pt-4 border-t border-gray-200">
                {showConfirmCancel ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to cancel your subscription? You'll still have access until {formatDate(subscription?.expiresAt)}, but it will not renew after that.
                    </p>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelSubscription}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                      </button>
                      
                      <button
                        onClick={() => setShowConfirmCancel(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                        disabled={isCancelling}
                      >
                        No, Keep Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ManageSubscription;