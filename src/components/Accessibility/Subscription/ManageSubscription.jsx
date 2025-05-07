// src/components/Accessibility/Subscription/ManageSubscription.jsx

import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import subscriptionService from '../../../services/SubscriptionService';

function ManageSubscription() {
  const { subscription, cancelSubscription, loading: contextLoading } = useSubscription();
  
  const [history, setHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Load subscription history and payment methods
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const [historyData, methodsData] = await Promise.all([
          subscriptionService.getSubscriptionHistory(),
          subscriptionService.getPaymentMethods()
        ]);
        
        setHistory(historyData.history || []);
        setPaymentMethods(methodsData.paymentMethods || []);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setError('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (subscription?.isActive) {
      loadData();
    }
  }, [subscription]);
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await cancelSubscription();
      
      if (result.success) {
        setSuccess('Your subscription has been canceled. You will still have access until the end of your billing period.');
        setShowCancelModal(false);
      } else {
        setError(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError('An error occurred while canceling your subscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (contextLoading || isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading subscription details...</p>
      </div>
    );
  }
  
  // Not subscribed state
  if (!subscription?.isActive) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
        
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          
          <h3 className="text-lg font-medium mb-2">You don&apos;t have an active subscription</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to get unlimited flight alerts and premium features.
          </p>
          
          <a
            href="/subscription/plans"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Current Plan */}
      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h3 className="text-lg font-semibold">{subscription.plan?.name || 'Premium Plan'}</h3>
            <p className="text-gray-600">
              {`Your next billing date is ${formatDate(subscription.expiresAt)}`}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
        
        {paymentMethods.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`p-4 flex justify-between items-center ${
                  index !== paymentMethods.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={method.iconUrl || '/icons/credit-card.svg'}
                    alt={method.name}
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.last4 && (
                      <p className="text-sm text-gray-600">•••• {method.last4}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <button className="text-blue-600 hover:underline text-sm">
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 p-4 bg-gray-50 rounded-lg">
            No payment methods found.
          </div>
        )}
      </div>
      
      {/* Billing History */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Billing History</h3>
        
        {history.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600 p-4 bg-gray-50 rounded-lg">
            No billing history available.
          </div>
        )}
      </div>
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Subscription</h3>
            
            <p className="mb-4 text-gray-600">
              We&apos;re sorry to see you go. Your subscription will remain active until the end of your current billing period.
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancelling (optional)
              </label>
              <select
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a reason</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_useful">Not useful enough</option>
                <option value="switching">Switching to another service</option>
                <option value="temporary">Temporary pause - will be back</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-300"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubscription;