import React, { useState } from 'react';
import { useI18n } from '../../utils/i18n';

function FlightCard({ flight, currencySymbol, onSetupAlert }) {
  const { t } = useI18n();
  const [showDetails, setShowDetails] = useState(false);
  
  // Format time from ISO string
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date from ISO string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Format duration from minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get baggage allowance icon
  const getBaggageIcon = (type) => {
    switch (type) {
      case 'carry-on':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'checked':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };
  
  // Display stops information
  const renderStops = () => {
    if (flight.stops === 0) {
      return (
        <div className="text-green-600 text-sm font-medium">
          {t('flightSearch.nonstop', 'Nonstop')}
        </div>
      );
    }
    
    return (
      <div className="text-gray-600 text-sm">
        {flight.stops === 1 
          ? t('flightSearch.oneStop', '1 Stop') 
          : t('flightSearch.multipleStops', `${flight.stops} Stops`)}
        {flight.stopAirports && (
          <span className="ml-1">({flight.stopAirports.join(', ')})</span>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img 
              src={flight.airlineLogo || `/airlines/${flight.airline.toLowerCase()}.png`} 
              alt={flight.airline}
              className="w-8 h-8 mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/airlines/default.png";
              }}
            />
            <div>
              <div className="font-medium">{flight.airline}</div>
              <div className="text-xs text-gray-500">{flight.flightNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl">{currencySymbol}{flight.price}</div>
            <div className="text-xs text-gray-500">{t('flightSearch.perPerson', 'per person')}</div>
          </div>
        </div>
        
        <div className="flex justify-between mb-2">
          <div className="text-center">
            <div className="text-xl font-semibold">{formatTime(flight.departureTime)}</div>
            <div className="text-xs text-gray-500">{formatDate(flight.departureTime)}</div>
            <div className="text-sm">{flight.originCode}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="text-xs text-gray-500 mb-1">{formatDuration(flight.durationMinutes)}</div>
            <div className="relative w-full">
              <div className="absolute w-full h-0.5 bg-gray-300 top-1/2 transform -translate-y-1/2"></div>
              {flight.stops > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
              )}
            </div>
            {renderStops()}
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold">{formatTime(flight.arrivalTime)}</div>
            <div className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</div>
            <div className="text-sm">{flight.destinationCode}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex items-center" title={t('flightSearch.carryOn', 'Carry-on Baggage')}>
              {getBaggageIcon(flight.baggage?.carryOn ? 'carry-on' : 'none')}
              <span className="ml-1">{t('flightSearch.carryOnShort', 'Carry-on')}</span>
            </div>
            <div className="flex items-center" title={t('flightSearch.checkedBaggage', 'Checked Baggage')}>
              {getBaggageIcon(flight.baggage?.checked ? 'checked' : 'none')}
              <span className="ml-1">{t('flightSearch.checkedShort', 'Checked')}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onSetupAlert}
              className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {t('flightSearch.priceAlert', 'Alert')}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-600 text-sm hover:text-gray-800 flex items-center"
            >
              {showDetails ? t('flightSearch.hideDetails', 'Hide') : t('flightSearch.showDetails', 'Details')}
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Flight Details */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm">
            <div className="mb-3">
              <h4 className="font-medium mb-1">{t('flightSearch.flightDetails', 'Flight Details')}</h4>
              <div className="flex justify-between">
                <div>
                  <div>{t('flightSearch.aircraft', 'Aircraft')}: {flight.aircraft || 'Boeing 737'}</div>
                  <div>{t('flightSearch.class', 'Class')}: {flight.cabinClass}</div>
                </div>
                <div>
                  <div>{t('flightSearch.flightDistance', 'Distance')}: {flight.distance} km</div>
                  <div>{t('flightSearch.flightDuration', 'Duration')}: {formatDuration(flight.durationMinutes)}</div>
                </div>
              </div>
            </div>
            
            {flight.stops > 0 && flight.layovers && (
              <div className="mb-3">
                <h4 className="font-medium mb-1">{t('flightSearch.layoverDetails', 'Layover Details')}</h4>
                {flight.layovers.map((layover, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div>{layover.airport} ({layover.duration} min)</div>
                    <div className="text-xs text-gray-500">
                      {t('flightSearch.terminalInfo', 'Terminal')}: {layover.terminal || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mb-3">
              <h4 className="font-medium mb-1">{t('flightSearch.baggageDetails', 'Baggage Allowance')}</h4>
              <div>
                <div>{t('flightSearch.carryOn', 'Carry-on')}: {flight.baggage?.carryOn ? t('flightSearch.included', 'Included') : t('flightSearch.notIncluded', 'Not included')}</div>
                <div>{t('flightSearch.checkedBaggage', 'Checked Baggage')}: {flight.baggage?.checked ? `${flight.baggage.checkedAmount || 1} bag(s) included` : t('flightSearch.notIncluded', 'Not included')}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">{t('flightSearch.fareDetails', 'Fare Details')}</h4>
              <div className="flex justify-between">
                <div>{t('flightSearch.ticketPrice', 'Ticket Price')}:</div>
                <div>{currencySymbol}{flight.basePrice}</div>
              </div>
              <div className="flex justify-between">
                <div>{t('flightSearch.taxes', 'Taxes & Fees')}:</div>
                <div>{currencySymbol}{(flight.price - flight.basePrice).toFixed(2)}</div>
              </div>
              <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-300">
                <div>{t('flightSearch.total', 'Total')}:</div>
                <div>{currencySymbol}{flight.price}</div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('flightSearch.selectFlight', 'Select Flight')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightCard;