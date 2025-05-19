
import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useI18n } from '../../utils/i18n';
import { useAppSettings } from '../../utils/useAppSettings';

function DealCard({ 
  deal, 
  onSetAlert, 
  onSave, 
  onRemove, 
  isSaved = false, 
  showRemoveButton = false
}) {
  const { isSubscribed } = useSubscription();
  const { t } = useI18n();
  const { currency, date } = useAppSettings();
  
  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate days until departure
  const getDaysUntilDeparture = () => {
    if (!deal.departureDate) return null;
    
    const now = new Date();
    const departure = new Date(deal.departureDate);
    const diffTime = Math.abs(departure - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get deal badge text and color
  const getDealBadge = () => {
    if (deal.lastMinute) {
      return {
        text: t('flightDeals.lastMinuteDeal'),
        bgColor: 'bg-orange-500',
        textColor: 'text-white'
      };
    }
    
    if (deal.discountPercent >= 40) {
      return {
        text: t('flightDeals.hugeDeal'),
        bgColor: 'bg-green-500',
        textColor: 'text-white'
      };
    }
    
    if (deal.discountPercent >= 25) {
      return {
        text: t('flightDeals.greatDeal'),
        bgColor: 'bg-green-400',
        textColor: 'text-white'
      };
    }
    
    return {
      text: t('flightDeals.goodDeal'),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    };
  };
  
  const badge = getDealBadge();
  const daysUntilDeparture = getDaysUntilDeparture();
  
  return (
    <div className="deal-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <span className={`${badge.bgColor} ${badge.textColor} text-xs font-bold px-2 py-1 rounded mr-2`}>
                {badge.text}
              </span>
              {deal.discountPercent && (
                <span className="text-green-600 font-semibold text-sm">
                  {deal.discountPercent}% {t('flightDeals.off')}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-1">
              {deal.origin} → {deal.destinationName || deal.destination}
            </h3>
            
            <div className="text-sm text-gray-500 mb-3">
              {deal.airline && (
                <span className="mr-2">{deal.airline}</span>
              )}
              {deal.duration && (
                <span>• {formatDuration(deal.duration)}</span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {currency(deal.price)}
            </div>
            {deal.averagePrice && (
              <span className="text-sm text-gray-500 line-through">
                {currency(deal.averagePrice)}
              </span>
            )}
            {daysUntilDeparture && (
              <div className="text-xs text-gray-500 mt-1">
                {t('flightDeals.inDays', { days: daysUntilDeparture })}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-3 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              {deal.departureDate && (
                <div className="text-sm">
                  <span className="text-gray-500">{t('flightDeals.departureDate')}:</span> {date(deal.departureDate)}
                </div>
              )}
              {deal.returnDate && (
                <div className="text-sm">
                  <span className="text-gray-500">{t('flightDeals.returnDate')}:</span> {date(deal.returnDate)}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!isSaved && (
                <button
                  onClick={onSave}
                  className="text-blue-600 hover:text-blue-800"
                  title={t('flightDeals.saveDeal')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
              
              {showRemoveButton && (
                <button
                  onClick={onRemove}
                  className="text-red-600 hover:text-red-800"
                  title={t('flightDeals.removeDeal')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={() => window.open(deal.deepLink, '_blank')}
                className="text-blue-600 hover:text-blue-800"
                title={t('flightDeals.viewDeal')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              
              <button
                onClick={onSetAlert}
                className={`${
                  isSubscribed ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isSubscribed}
                title={isSubscribed ? t('flightDeals.setAlert') : t('flightDeals.premiumFeature')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealCard;