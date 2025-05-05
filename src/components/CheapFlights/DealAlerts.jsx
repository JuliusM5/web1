import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';
import { useSubscription } from '../../context/SubscriptionContext';
import FlightDealCard from './FlightDealCard';
import CreateAlertModal from './CreateAlertModal';
import SubscriptionModal from './SubscriptionModal';

function DealAlerts({ userLocation }) {
  const { t } = useI18n();
  const { 
    subscriptionStatus, 
    freeNotificationsRemaining,
    useNotification, 
    upgradeToPremium 
  } = useSubscription();
  
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [availableDeals, setAvailableDeals] = useState([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Set maximum alerts based on subscription
  const maxAlerts = subscriptionStatus === 'premium' ? Infinity : 3;
  
  useEffect(() => {
    // Load user's active alerts
    const fetchUserAlerts = async () => {
      try {
        // In a real app, this would be an API call to your backend
        // For demo, we'll use localStorage
        const savedAlerts = localStorage.getItem('userAlerts');
        if (savedAlerts) {
          setActiveAlerts(JSON.parse(savedAlerts));
        } else {
          // Default empty array if no alerts found
          setActiveAlerts([]);
        }
        
        // Fetch any available deals matching their alerts
        await fetchDealsForAlerts();
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading alerts:', error);
        setLoading(false);
      }
    };
    
    fetchUserAlerts();
  }, [userLocation]);
  
  const fetchDealsForAlerts = async () => {
    // This would call your backend API which aggregates deals
    // For this demo, we'll simulate some sample deals
    
    // Simulate API call timing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample deals that would match user alerts
    const sampleDeals = [
      {
        id: 'deal-1',
        alertId: 'alert-1', // Links deal to specific alert
        from: userLocation || 'Kaunas',
        to: 'Paris',
        departDate: '2025-06-10',
        returnDate: '2025-06-17',
        price: 89.99,
        normalPrice: 149.99,
        discount: 40,
        airline: 'Ryanair',
        lastUpdate: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      },
      {
        id: 'deal-2',
        alertId: 'alert-2',
        from: userLocation || 'Kaunas',
        to: 'Barcelona',
        departDate: '2025-05-25',
        returnDate: '2025-06-01',
        price: 79.99,
        normalPrice: 129.99,
        discount: 38,
        airline: 'Wizz Air',
        lastUpdate: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7200000).toISOString() // 2 hours from now
      }
    ];
    
    setAvailableDeals(sampleDeals);
  };
  
  const handleCreateAlert = (newAlert) => {
    // Check if user can create more alerts
    if (activeAlerts.length >= maxAlerts && subscriptionStatus !== 'premium') {
      setShowSubscribeModal(true);
      return;
    }
    
    // Add the new alert
    const alertWithId = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedAlerts = [...activeAlerts, alertWithId];
    setActiveAlerts(updatedAlerts);
    
    // Save to localStorage (in real app, would save to backend)
    localStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
    
    setShowCreateAlert(false);
  };
  
  const handleDeleteAlert = (alertId) => {
    const updatedAlerts = activeAlerts.filter(alert => alert.id !== alertId);
    setActiveAlerts(updatedAlerts);
    
    // Update localStorage
    localStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
    
    // Also remove any deals associated with this alert
    const updatedDeals = availableDeals.filter(deal => deal.alertId !== alertId);
    setAvailableDeals(updatedDeals);
  };
  
  const handleNotifyMe = (dealId) => {
    // For premium users, always allow notifications
    // For free users, check if they have remaining notifications
    if (subscriptionStatus === 'premium' || useNotification()) {
      // Enable notification logic - in a real app, this would register for push notifications
      alert(t('dealAlerts.notificationEnabled'));
    } else {
      // Show subscription modal if out of free notifications
      setShowSubscribeModal(true);
    }
  };
  
  const handleSubscribe = () => {
    upgradeToPremium();
    setShowSubscribeModal(false);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">{t('dealAlerts.title')}</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">{t('dealAlerts.title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('dealAlerts.subtitle')}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          {subscriptionStatus === 'free' && (
            <div className="mr-4 text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full">
              {t('dealAlerts.alertsRemaining')}: {maxAlerts - activeAlerts.length} / {maxAlerts}
            </div>
          )}
          
          <button
            onClick={() => setShowCreateAlert(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {t('dealAlerts.createAlert')}
          </button>
        </div>
      </div>
      
      {/* Display active alerts */}
      {activeAlerts.length > 0 ? (
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">{t('dealAlerts.yourAlerts')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">{alert.origin} → {alert.destination}</h4>
                    <p className="text-sm text-gray-600">
                      {alert.dateType === 'specific' 
                        ? `${alert.startDate} - ${alert.endDate}`
                        : t('dealAlerts.anytime')}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Delete alert"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">{t('dealAlerts.priceThreshold')}:</span>
                  <span className="font-medium">€{alert.maxPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-8">
          <p>{t('dealAlerts.noAlertsYet')}</p>
        </div>
      )}
      
      {/* Display available deals */}
      {availableDeals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('dealAlerts.availableDeals')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDeals.map(deal => (
              <FlightDealCard 
                key={deal.id}
                deal={deal}
                onNotifyMe={() => handleNotifyMe(deal.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Create Alert Modal */}
      {showCreateAlert && (
        <CreateAlertModal
          onClose={() => setShowCreateAlert(false)}
          onCreateAlert={handleCreateAlert}
          userLocation={userLocation}
        />
      )}
      
      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <SubscriptionModal
          onClose={() => setShowSubscribeModal(false)}
          onSubscribe={handleSubscribe}
        />
      )}
    </div>
  );
}

export default DealAlerts;