// src/components/Subscription/MobileCodeActivation.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import TokenizedSubscription from '../../models/TokenizedSubscription';

const MobileCodeActivation = () => {
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  
  const handleCodeChange = (e) => {
    // Format as user types: add dashes after every 4 chars
    let value = e.target.value.replace(/-/g, ''); // Remove existing dashes
    value = value.replace(/[^A-Z0-9]/gi, '').toUpperCase(); // Keep only alphanumeric, uppercase
    
    // Add dashes
    let formattedValue = '';
    for (let i = 0; i < value.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += '-';
      }
      formattedValue += value[i];
    }
    
    setCode(formattedValue);
  };
  
  const handleActivate = async (e) => {
    e.preventDefault();
    
    // Validate code format
    if (!code.match(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      setError('Please enter a valid code in the format XXXX-XXXX-XXXX');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Verify the mobile access code
      const result = await TokenizedSubscription.verifyMobileCode(code);
      
      if (!result.valid) {
        throw new Error(result.error || 'Invalid or expired code');
      }
      
      // Store the subscription data
      TokenizedSubscription.storeSubscription(
        result.accessToken,
        result.plan,
        new Date(result.expiresAt)
      );
      
      // Show success state
      setSuccess(true);
      
      // Refresh subscription context
      refreshSubscription();
    } catch (error) {
      console.error('Code activation failed:', error);
      setError(error.message || 'Failed to activate subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600">
            Your premium subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Using Premium Features
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Activate Subscription</h2>
      
      <p className="text-gray-600 mb-6">
        Enter your access code from the web subscription to activate premium features on this device.
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleActivate}>
        <div className="mb-6">
          <label htmlFor="accessCode" className="block text-gray-700 font-medium mb-2">
            Access Code
          </label>
          <input
            id="accessCode"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="XXXX-XXXX-XXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-center font-mono text-lg"
            maxLength="14" // 12 chars + 2 dashes
            autoComplete="off"
            disabled={isProcessing}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the 12-character code you received when subscribing on the web.
          </p>
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 rounded-md font-medium ${
            isProcessing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Activating...' : 'Activate Subscription'}
        </button>
      </form>
    </div>
  );
};

export default MobileCodeActivation;