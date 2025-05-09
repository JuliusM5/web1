// src/components/Accessibility/Subscription/Checkout.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import subscriptionService from '../../../services/SubscriptionService';
import { useSubscription } from '../../../hooks/useSubscription';
import TokenizedSubscription from '../../../models/TokenizedSubscription';

function Checkout({ onBack }) {
  const { planId } = useParams();
  const { refreshSubscription } = useSubscription();
  
  const [plan, setPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });
  
  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      
      try {
        // Using getPlans method
        const plans = subscriptionService.getPlans();
        const selectedPlan = plans.find(p => p.id === planId);
        setPlan(selectedPlan);
      } catch (err) {
        console.error('Error loading plan details:', err);
        setError('Failed to load plan details. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (planId) {
      loadPlan();
    }
  }, [planId]);
  
  const handleCardChange = (e) => {
    const { id, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    
    try {
      // Simple validation
      if (paymentMethod === 'credit_card' && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc)) {
        setError('Please fill in all card details');
        setIsProcessing(false);
        return;
      }
      
      // In a real app, you would process payment securely
      // This is just a simplified example
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate tokens and codes
      const token = TokenizedSubscription.generateToken();
      const mobileAccessCode = TokenizedSubscription.generateMobileAccessCode();
      
      // Calculate expiry date based on plan
      const expiryDate = new Date();
      if (plan?.id === 'yearly_premium') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      // Store subscription data
      TokenizedSubscription.storeSubscription(token, plan?.id || 'monthly_premium', expiryDate);
      
      // Store mobile access code temporarily for the success page
      sessionStorage.setItem('mobile_access_code', mobileAccessCode);
      
      // Redirect to success page
      window.location.href = '/subscription/success?plan=' + encodeURIComponent(plan?.id || 'monthly_premium');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('An unexpected error occurred. Please try again later.');
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading checkout details...</p>
      </div>
    );
  }
  
  if (error && !plan) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Back to Plans
        </button>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <svg 
            className="w-16 h-16 text-green-500 mx-auto mb-4" 
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
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={onBack} 
        className="mb-6 flex items-center text-blue-600 hover:underline"
      >
        <svg 
          className="w-5 h-5 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
        Back to Plans
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {plan && (
              <>
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-4 pb-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subscription</span>
                    <span>${plan.price}/{plan.interval}</span>
                  </div>
                  
                  {plan.trial && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Free Trial</span>
                      <span>{plan.trial} days</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${plan.price}/{plan.interval}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="mr-2"
                    />
                    Credit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-2"
                      disabled
                    />
                    PayPal (Coming Soon)
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      id="number"
                      type="text"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        id="cvc"
                        type="text"
                        value={cardDetails.cvc}
                        onChange={handleCardChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Subscribe for $${plan?.price || '0'}/${plan?.interval || 'month'}`}
              </button>
              
              <p className="mt-4 text-xs text-gray-500 text-center">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                You can cancel your subscription at any time.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;