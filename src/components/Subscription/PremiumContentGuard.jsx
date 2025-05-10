// src/components/Subscription/PremiumContentGuard.jsx
import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import MobileCodeActivation from './MobileCodeActivation';

const PremiumContentGuard = ({ 
  children, 
  featureName = 'premium',
  fallbackMessage = 'This content requires a premium subscription',
  showActivationForm = true
}) => {
  const { isFeatureAvailable, hasActiveSubscription } = useSubscription();
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  
  // Check if the user has access to this feature
  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        const hasAccess = await isFeatureAvailable(featureName);
        setCanAccess(hasAccess);
      } catch (error) {
        console.error(`Error checking access to feature "${featureName}":`, error);
        setCanAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [featureName, isFeatureAvailable, hasActiveSubscription]);
  
  // Show loading state
  if (isLoading) {
    return <div className="premium-content-loading">Loading...</div>;
  }
  
  // Show content if user has access
  if (canAccess) {
    return <>{children}</>;
  }
  
  // Show activation form if requested
  if (showActivation) {
    return (
      <div className="premium-activation-container">
        <MobileCodeActivation 
          onSuccess={() => setCanAccess(true)} 
          onCancel={() => setShowActivation(false)} 
        />
      </div>
    );
  }
  
  // Show fallback content
  return (
    <div className="premium-content-restricted">
      <div className="premium-message">
        <h3>{fallbackMessage}</h3>
        <p>Unlock this feature and more with a premium subscription.</p>
        {showActivationForm && (
          <div className="premium-actions">
            <button 
              className="primary-button"
              onClick={() => setShowActivation(true)}
            >
              Enter Activation Code
            </button>
            <a href="/subscription" className="subscription-link">
              Get a Subscription
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumContentGuard;