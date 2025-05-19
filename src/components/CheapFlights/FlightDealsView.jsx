
import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import GlobalAirportSelector from './GlobalAirportSelector';
import DealCard from './DealCard';
import dealDetectionService from '../../services/dealDetectionService';
import dealAlertService from '../../services/dealAlertService';
import AuthContext from '../../context/AuthContext';
import PremiumContentGuard from '../Subscription/PremiumContentGuard';
import { useI18n } from '../../utils/i18n';

const FlightDealsView = ({ userLocation }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [savedDeals, setSavedDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const { isSubscribed } = useContext(SubscriptionContext);
  const { user } = useContext(AuthContext);
  const [remainingSignals, setRemainingSignals] = useState(3);
  const [usedSignals, setUsedSignals] = useState(0);
  const { t } = useI18n();
  
  // Set initial origin if userLocation is provided
  useEffect(() => {
    if (userLocation && !origin) {
      setOrigin({
        code: userLocation.code,
        id: userLocation.code,
        name: userLocation.name,
        country: userLocation.country
      });
    }
  }, [userLocation, origin]);
  
  // Load user deal usage and saved deals
  useEffect(() => {
    if (user) {
      // Load signal usage for free users
      if (!isSubscribed) {
        // In a real app, this would be from a persistent store 
        // For now we're using localStorage
        const usedCount = parseInt(localStorage.getItem(`user_${user.id}_signal_count`) || '0');
        setUsedSignals(usedCount);
        setRemainingSignals(Math.max(0, 3 - usedCount));
      } else {
        setRemainingSignals('∞');
      }
      
      // Load user's saved deals
      const deals = localStorage.getItem(`user_${user.id}_saved_deals`);
      if (deals) {
        setSavedDeals(JSON.parse(deals));
      }
    }
  }, [user, isSubscribed]);
  
  const recordSignalUsage = () => {
    if (!isSubscribed && user) {
      const newCount = usedSignals + 1;
      localStorage.setItem(`user_${user.id}_signal_count`, newCount.toString());
      setUsedSignals(newCount);
      setRemainingSignals(Math.max(0, 3 - newCount));
    }
  };
  
  const handleSearch = async () => {
    if (!origin) {
      setError(t('dealAlerts.errors.originRequired'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let deals = [];
      
      // Record signal usage for free users
      if (!isSubscribed && user) {
        recordSignalUsage();
      }
      
      // Search for deals
      if (destination) {
        // Search for specific route
        deals = await dealDetectionService.findDealsForRoute(
          origin.code,
          destination.code
        );
      } else {
        // Search for deals from origin to anywhere
        deals = await dealDetectionService.findDealsFromOrigin(origin.code);
      }
      
      setSearchResults(deals);
      
      if (deals.length === 0) {
        setError(t('flightDeals.noDealsFound'));
      }
    } catch (error) {
      console.error('Error searching for deals:', error);
      setError(t('flightDeals.searchError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetAlert = async (deal) => {
    if (!user) {
      setError(t('flightDeals.loginRequired'));
      return;
    }
    
    try {
      // Create an alert for this deal
      const alert = await dealAlertService.createAlert(user.id, {
        origin: deal.origin,
        destination: deal.destination,
        dateType: 'flexible',
        maxPrice: deal.price
      });
      
      // Show success message
      alert(t('flightDeals.alertCreated'));
      return true;
    } catch (error) {
      console.error('Error creating alert:', error);
      setError(t('flightDeals.alertError'));
      return false;
    }
  };
  
  const handleSaveDeal = (deal) => {
    if (!user) {
      setError(t('flightDeals.loginRequired'));
      return;
    }
    
    try {
      // Check if already saved
      const isDuplicate = savedDeals.some(d => d.id === deal.id);
      
      if (!isDuplicate) {
        const updatedDeals = [...savedDeals, deal];
        setSavedDeals(updatedDeals);
        
        // Save to localStorage
        localStorage.setItem(`user_${user.id}_saved_deals`, JSON.stringify(updatedDeals));
        
        // Show success message
        alert(t('flightDeals.dealSaved'));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving deal:', error);
      return false;
    }
  };
  
  const handleRemoveSavedDeal = (dealId) => {
    try {
      const updatedDeals = savedDeals.filter(deal => deal.id !== dealId);
      setSavedDeals(updatedDeals);
      
      // Update localStorage
      localStorage.setItem(`user_${user.id}_saved_deals`, JSON.stringify(updatedDeals));
      
      return true;
    } catch (error) {
      console.error('Error removing saved deal:', error);
      return false;
    }
  };
  
  // Render the search button with premium guard if needed
  const renderSearchButton = () => {
    if (!isSubscribed && usedSignals >= 3) {
      return (
        <PremiumContentGuard 
          featureId="flight_search"
          usageCount={usedSignals}
          showUpgradeButton={true}
          fallback={
            <button
              disabled={true}
              className="w-full p-3 rounded-md font-medium text-white bg-gray-400 cursor-not-allowed"
            >
              {t('flightDeals.noSignalsRemaining')}
            </button>
          }
        >
          <button
            onClick={handleSearch}
            disabled={isLoading || !origin}
            className={`w-full p-3 rounded-md font-medium text-white
              ${isLoading || !origin ? 
                'bg-gray-400 cursor-not-allowed' : 
                'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? t('flightDeals.searching') : t('flightDeals.searchFlights')}
          </button>
        </PremiumContentGuard>
      );
    }
    
    return (
      <button
        onClick={handleSearch}
        disabled={isLoading || !origin}
        className={`w-full p-3 rounded-md font-medium text-white
          ${isLoading || !origin ? 
            'bg-gray-400 cursor-not-allowed' : 
            'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? t('flightDeals.searching') : t('flightDeals.searchFlights')}
      </button>
    );
  };
  
  return (
    <div className="flight-deals-view p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('search')}
        >
          {t('flightDeals.searchTab')}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'saved' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('saved')}
        >
          {t('flightDeals.savedDealsTab')}
        </button>
      </div>
      
      {activeTab === 'search' && (
        <>
          <h2 className="text-2xl font-bold mb-4">{t('flightDeals.searchDeals')}</h2>
          
          {!isSubscribed && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{t('flightDeals.freeSignals')}: </span>
                  <span className={remainingSignals > 0 ? 'text-green-600' : 'text-red-600'}>
                    {remainingSignals}/3
                  </span>
                  {remainingSignals === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {t('flightDeals.noSignalsMessage')}
                    </p>
                  )}
                  {remainingSignals > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t('flightDeals.freeSignalsMessage')}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => window.location.href = '/subscription/plans'}
                  className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
                >
                  {t('subscription.subscribe')}
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="flex-1 mb-3 md:mb-0">
              <GlobalAirportSelector
                label={t('flightDeals.from')}
                value={origin}
                onChange={setOrigin}
                placeholder={t('flightDeals.originPlaceholder')}
              />
            </div>
            
            <div className="flex-1">
              <GlobalAirportSelector
                label={t('flightDeals.to')}
                value={destination}
                onChange={setDestination}
                placeholder={t('flightDeals.destinationPlaceholder')}
              />
            </div>
          </div>
          
          {renderSearchButton()}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">{t('flightDeals.results')}</h3>
              <div className="space-y-4">
                {searchResults.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onSetAlert={() => handleSetAlert(deal)}
                    onSave={() => handleSaveDeal(deal)}
                    isSaved={savedDeals.some(d => d.id === deal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {activeTab === 'saved' && (
        <>
          <h2 className="text-2xl font-bold mb-4">{t('flightDeals.savedDeals')}</h2>
          
          {savedDeals.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t('flightDeals.noSavedDeals')}</p>
              <button
                onClick={() => setActiveTab('search')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {t('flightDeals.searchForDeals')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedDeals.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onSetAlert={() => handleSetAlert(deal)}
                  onRemove={() => handleRemoveSavedDeal(deal.id)}
                  isSaved={true}
                  showRemoveButton={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlightDealsView;