// src/components/Subscription/MobileCodeActivation.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useMobileSubscription } from '../../hooks/useMobileSubscription';
import { isMobileDevice } from '../../utils/deviceDetection';

const MobileCodeActivation = ({ onSuccess, onCancel }) => {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);
  
  // Get subscription hooks based on platform
  const isMobile = isMobileDevice();
  const webSubscription = useSubscription();
  const mobileSubscription = useMobileSubscription();
  
  // Use the appropriate subscription service
  const subscription = isMobile ? mobileSubscription.subscription : webSubscription.subscription;
  const activateWithCode = isMobile ? mobileSubscription.activateSubscription : webSubscription.activateWithCode;
  
  // Refs for input fields
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  
  // Redirect if already subscribed
  useEffect(() => {
    if (subscription && subscription.status === 'active' && onSuccess) {
      onSuccess();
    }
  }, [subscription, onSuccess]);
  
  // Handle form submission
  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    if (!code1 || !code2 || !code3 || 
        code1.length !== 4 || code2.length !== 4 || code3.length !== 4) {
      setError('Please enter a valid activation code');
      return;
    }
    
    // Format access code
    const accessCode = `${code1}-${code2}-${code3}`;
    
    // Activate subscription
    setIsLoading(true);
    try {
      await activateWithCode(accessCode);
      setActivationSuccess(true);
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Activation error:', error);
      setError(error.message || 'Failed to activate subscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-focus next input when current is filled
  const handleInputChange = (setter, value, nextRef) => {
    // Only allow alphanumeric characters
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setter(cleanValue);
    
    // Auto-advance to next field when full
    if (cleanValue.length === 4 && nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };
  
  // Handle pasting an entire code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Try to parse the pasted text as an activation code
    const cleanText = pastedText.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    const parts = cleanText.split('-');
    
    if (parts.length === 3) {
      setCode1(parts[0].substring(0, 4));
      setCode2(parts[1].substring(0, 4));
      setCode3(parts[2].substring(0, 4));
      
      // Focus last input
      if (input3Ref.current) {
        input3Ref.current.focus();
      }
    } else if (cleanText.length === 12) {
      // Handle codes without dashes
      setCode1(cleanText.substring(0, 4));
      setCode2(cleanText.substring(4, 8));
      setCode3(cleanText.substring(8, 12));
      
      // Focus last input
      if (input3Ref.current) {
        input3Ref.current.focus();
      }
    }
  };
  
  if (activationSuccess) {
    return (
      <div className="activation-success">
        <h2>Activation Successful!</h2>
        <p>Your premium subscription has been activated on this device.</p>
        <button onClick={onSuccess} className="primary-button">
          Continue
        </button>
      </div>
    );
  }
  
  return (
    <div className="code-activation-container">
      <h2>Enter your activation code</h2>
      <p>Enter the code you received after purchasing a subscription.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleActivate} className="activation-form">
        <div className="code-input-group">
          <input
            ref={input1Ref}
            type="text"
            value={code1}
            onChange={(e) => handleInputChange(setCode1, e.target.value, input2Ref)}
            onPaste={handlePaste}
            placeholder="XXXX"
            maxLength={4}
            className="code-input"
            disabled={isLoading}
            autoFocus
          />
          <span className="code-separator">-</span>
          <input
            ref={input2Ref}
            type="text"
            value={code2}
            onChange={(e) => handleInputChange(setCode2, e.target.value, input3Ref)}
            placeholder="XXXX"
            maxLength={4}
            className="code-input"
            disabled={isLoading}
          />
          <span className="code-separator">-</span>
          <input
            ref={input3Ref}
            type="text"
            value={code3}
            onChange={(e) => handleInputChange(setCode3, e.target.value, null)}
            placeholder="XXXX"
            maxLength={4}
            className="code-input"
            disabled={isLoading}
          />
        </div>
        
        <div className="button-group">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="secondary-button"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="primary-button"
            disabled={isLoading || !code1 || !code2 || !code3}
          >
            {isLoading ? 'Activating...' : 'Activate'}
          </button>
        </div>
      </form>
      
      <div className="help-text">
        <p>
          Don't have a code? <a href="/subscription">Purchase a subscription</a> to get access to premium features.
        </p>
      </div>
    </div>
  );
};

export default MobileCodeActivation;