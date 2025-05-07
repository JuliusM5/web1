// src/components/CheapFlights/MobileFlightDealView.jsx

import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import DealCard from './DealCard';
import AlertModal from './AlertModal';
import { useAppSettings } from '../../utils/useAppSettings';
import { deviceDetection } from '../../utils/deviceDetection';

const MobileFlightDealView = ({ deals, userLocation }) => {
  const [visibleDeals, setVisibleDeals] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isSubscribed, freeAlertCount, incrementFreeAlertCount } = useContext(SubscriptionContext);
  const { settings } = useAppSettings();
  const deviceInfo = deviceDetection();
  
  useEffect(() => {
    // Apply mobile-specific filtering and sorting
    const optimizedDeals = deals
      .sort((a, b) => a.price - b.price)
      .slice(0, isSubscribed ? deals.length : Math.min(3, deals.length));
      
    setVisibleDeals(optimizedDeals);
  }, [deals, isSubscribed]);
  
  const handleAlertSetup = (deal) => {
    if (!isSubscribed && freeAlertCount >= 3) {
      setShowSubscriptionModal(true);
      return;
    }
    
    // Set up the alert and increment count if free user
    if (!isSubscribed) {
      incrementFreeAlertCount();
    }
    
    // Alert setup logic here
  };
  
  return (
    <div className="mobile-flight-deals">
      <div className="remaining-alerts-indicator">
        {!isSubscribed && (
          <div className="free-alert-counter">
            Free alerts remaining: {3 - freeAlertCount}
          </div>
        )}
      </div>
      
      <div className="deals-container">
        {visibleDeals.map(deal => (
          <DealCard 
            key={deal.id}
            deal={deal}
            onSetAlert={() => handleAlertSetup(deal)}
            userDevice={deviceInfo}
            isCompact={deviceInfo.isMobile}
          />
        ))}
      </div>
      
      {!isSubscribed && visibleDeals.length < deals.length && (
        <button 
          className="subscription-prompt-button"
          onClick={() => setShowSubscriptionModal(true)}
        >
          See {deals.length - visibleDeals.length} more deals
        </button>
      )}
      
      <AlertModal 
        show={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        deviceInfo={deviceInfo}
      />
    </div>
  );
};

export default MobileFlightDealView;