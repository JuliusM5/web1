import React, { useState, useEffect } from 'react';
import LocationSelector from './LocationSelector';
import FlightDealsView from './FlightDealsView';
import CreateAlertModal from './AlertModal';
import FreeSignalStatus from './FreeSignalStatus';
import { useSettings } from '../../context/SettingsContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useI18n } from '../../utils/i18n';
import dealAlertService from '../../services/dealAlertService';
import dealDetectionService from '../../services/dealDetectionService';
import useAuth from '../../context/AuthContext'; // Using the default export
import DealCard from './DealCard';

function CheapFlightsDashboard() {
  const [userLocation, setUserLocation] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const { settings } = useSettings();
  const { isSubscribed, freeAlertsRemaining } = useSubscription();
  const { t } = useI18n();
  const { user } = useAuth(); // Using the useAuth hook which is imported as the default export
  
  // Check if location is already set on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userHomeAirport');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setUserLocation(parsedLocation);
        setSetupComplete(true);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    } else if (settings && settings.homeAirport) {
      // Try to get from settings if available
      const airportCode = settings.homeAirport;
      // This would normally fetch airport details from your database
      // For now, we'll use a hardcoded mapping
      const airportMapping = {
        'KUN': { code: 'KUN', name: 'Kaunas, Lithuania', country: 'Lithuania' },
        'VNO': { code: 'VNO', name: 'Vilnius, Lithuania', country: 'Lithuania' }
      };
      
      if (airportMapping[airportCode]) {
        setUserLocation(airportMapping[airportCode]);
        setSetupComplete(true);
        // Save to localStorage for future use
        localStorage.setItem('userHomeAirport', JSON.stringify(airportMapping[airportCode]));
      }
    }
  }, [settings]);
  
  // Load featured deals and user alerts
  useEffect(() => {
    if (setupComplete && userLocation) {
      loadFeaturedDeals();
      
      // Load user alerts if user is logged in
      if (user) {
        loadUserAlerts();
      }
      
      // Start background processing of alerts
      dealAlertService.startBackgroundProcessing();
    }
  }, [setupComplete, userLocation, user]);
  
  // Load featured deals for user's location
  const loadFeaturedDeals = async () => {
    if (!userLocation || !userLocation.code) return;
    
    setIsLoadingDeals(true);
    
    try {
      // Get deals from user's location
      const deals = await dealDetectionService.findDealsFromOrigin(
        userLocation.code, 
        6  // Limit to 6 deals
      );
      
      setFeaturedDeals(deals);
    } catch (error) {
      console.error('Error loading featured deals:', error);
    } finally {
      setIsLoadingDeals(false);
    }
  };
  
  // Load user's active alerts
  const loadUserAlerts = async () => {
    if (!user) return;
    
    setIsLoadingAlerts(true);
    
    try {
      const alerts = dealAlertService.getUserAlerts(user.id);
      setActiveAlerts(alerts.filter(alert => alert.active));
    } catch (error) {
      console.error('Error loading user alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };
  
  // Handle location selection
  const handleLocationSelected = (location) => {
    setUserLocation(location);
    setSetupComplete(true);
    
    // Save to localStorage for future use
    localStorage.setItem('userHomeAirport', JSON.stringify(location));
    
    // Load featured deals for this location
    setTimeout(() => {
      loadFeaturedDeals();
    }, 100);
  };
  
  // Handle alert creation
  const handleCreateAlert = (alert) => {
    // Reload alerts after creation
    loadUserAlerts();
  };
  
  // Handle location change from LocationSelector
  const handleLocationChange = (locationData) => {
    console.log("Location changed:", locationData);
    // You could do something with both origin and destination here
    // For now, we'll just use the origin as the user location
    if (locationData && locationData.origin) {
      handleLocationSelected(locationData.origin);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {!setupComplete && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">{t('flightDeals.selectYourLocation')}</h2>
            <p className="text-center text-gray-600 mb-8">
              {t('flightDeals.locationExplanation')}
            </p>
            
            <LocationSelector onLocationChange={handleLocationChange} />
          </div>
        </div>
      )}
      
      {setupComplete && userLocation && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{t('flightDeals.yourFlightDeals')}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAlertModal(true)}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-600 rounded-md"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                {t('flightDeals.createAlert')}
              </button>
              
              <button 
                onClick={() => setSetupComplete(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                {t('flightDeals.changeLocation')}
              </button>
            </div>
          </div>
          
          {!isSubscribed && (
            <FreeSignalStatus />
          )}
          
          {/* Active Alerts Section */}
          {user && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{t('flightDeals.yourAlerts')}</h3>
              
              {isLoadingAlerts ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">{t('flightDeals.loadingAlerts')}</p>
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">{t('flightDeals.noActiveAlerts')}</p>
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('flightDeals.createFirstAlert')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            {alert.origin} → {alert.destination === 'anywhere' ? t('flightDeals.anywhere') : alert.destination}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.maxPrice ? `${t('flightDeals.maxPrice')}: €${alert.maxPrice}` : t('flightDeals.anyPrice')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {alert.dateType === 'specific' 
                              ? `${t('flightDeals.dates')}: ${alert.startDate} - ${alert.endDate}`
                              : `${t('flightDeals.tripLength')}: ${alert.tripLength.min}-${alert.tripLength.max} ${t('flightDeals.days')}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            dealAlertService.updateAlert(user.id, alert.id, { active: false });
                            loadUserAlerts();
                          }}
                          className="text-gray-500 hover:text-red-500"
                          title={t('flightDeals.deactivate')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Featured Deals Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{t('flightDeals.featuredDeals')}</h3>
            
            {isLoadingDeals ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">{t('flightDeals.loadingDeals')}</p>
              </div>
            ) : featuredDeals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">{t('flightDeals.noDealsFound')}</p>
                <button
                  onClick={loadFeaturedDeals}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('flightDeals.refreshDeals')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onSetAlert={() => {
                      if (!user) {
                        alert(t('flightDeals.loginRequired'));
                        return;
                      }
                      
                      dealAlertService.createAlert(user.id, {
                        origin: deal.origin,
                        destination: deal.destination,
                        dateType: 'flexible',
                        maxPrice: deal.price
                      });
                      loadUserAlerts();
                    }}
                    onSave={() => {
                      // Save deal implementation
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Full Flight Deals View */}
          <FlightDealsView userLocation={userLocation} />
        </>
      )}
      
      {/* How it works section */}
      <div className="mt-12 bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center mb-8">{t('flightDeals.howItWorks')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.step1')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.step1Desc')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.step2')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.step2Desc')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.step3')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.step3Desc')}
            </p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">{t('flightDeals.faq')}</h2>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.faq1')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.faq1Answer')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.faq2')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.faq2Answer')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.faq3')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.faq3Answer')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">{t('flightDeals.faq4')}</h3>
            <p className="text-gray-600">
              {t('flightDeals.faq4Answer')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Create Alert Modal */}
      {showAlertModal && (
        <CreateAlertModal 
          onClose={() => setShowAlertModal(false)} 
          onCreateAlert={handleCreateAlert}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}

export default CheapFlightsDashboard;