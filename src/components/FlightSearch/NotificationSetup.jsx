import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';

function NotificationSetup({ flight, onSave, onClose, currency }) {
  const { t } = useI18n();
  const [notificationSettings, setNotificationSettings] = useState({
    priceThreshold: flight ? Math.round(flight.price * 0.9) : 0, // Default 10% lower
    email: '',
    notifyViaPush: true,
    notifyViaEmail: false,
    frequency: 'instant'
  });
  const [errors, setErrors] = useState({});
  
  // Currency symbol mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CNY': '¥',
    'INR': '₹'
  };
  
  useEffect(() => {
    // Update price threshold when flight changes
    if (flight) {
      setNotificationSettings(prev => ({
        ...prev,
        priceThreshold: Math.round(flight.price * 0.9)
      }));
    }
  }, [flight]);
  
  // Get currency symbol based on currency code
  const getCurrencySymbol = () => {
    return currencySymbols[currency] || '$';
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (notificationSettings.notifyViaEmail && !notificationSettings.email) {
      newErrors.email = t('flightSearch.errors.emailRequired', 'Email address is required for email notifications');
    } else if (
      notificationSettings.notifyViaEmail && 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationSettings.email)
    ) {
      newErrors.email = t('flightSearch.errors.invalidEmail', 'Please enter a valid email address');
    }
    
    if (!notificationSettings.notifyViaPush && !notificationSettings.notifyViaEmail) {
      newErrors.notification = t('flightSearch.errors.notificationMethodRequired', 'Please select at least one notification method');
    }
    
    if (notificationSettings.priceThreshold >= flight.price) {
      newErrors.priceThreshold = t('flightSearch.errors.priceThresholdTooHigh', 'Price threshold must be lower than current price');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave({
      ...notificationSettings,
      flightId: flight.id,
      originalPrice: flight.price,
      route: `${flight.originCode}-${flight.destinationCode}`,
      departureDate: flight.departureTime
    });
  };
  
  // Format date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('flightSearch.priceAlertTitle', 'Set Price Alert')}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{t('flightSearch.selectedFlight', 'Selected Flight')}</h3>
            <div className="flex justify-between mb-1">
              <div>
                <span className="font-semibold">{flight.originCode}</span> → <span className="font-semibold">{flight.destinationCode}</span>
              </div>
              <div className="text-gray-600">{formatDate(flight.departureTime)}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-600">{flight.airline}</div>
              <div className="font-semibold">{getCurrencySymbol()}{flight.price}</div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priceThreshold">
                {t('flightSearch.notifyWhenPriceFalls', 'Notify me when price falls below')}
              </label>
              <div className="flex items-center">
                <span className="mr-2">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  id="priceThreshold"
                  name="priceThreshold"
                  value={notificationSettings.priceThreshold}
                  onChange={handleChange}
                  min="1"
                  max={flight.price - 1}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              {errors.priceThreshold && (
                <p className="text-red-600 text-sm mt-1">{errors.priceThreshold}</p>
              )}
              
              <div className="mt-1 text-sm text-gray-500">
                {t('flightSearch.currentPrice', 'Current price')}: {getCurrencySymbol()}{flight.price}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('flightSearch.howToNotify', 'How would you like to be notified?')}
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyViaPush"
                    name="notifyViaPush"
                    checked={notificationSettings.notifyViaPush}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="notifyViaPush">
                    {t('flightSearch.browserNotification', 'Browser notification')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyViaEmail"
                    name="notifyViaEmail"
                    checked={notificationSettings.notifyViaEmail}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="notifyViaEmail">
                    {t('flightSearch.emailNotification', 'Email notification')}
                  </label>
                </div>
                
                {errors.notification && (
                  <p className="text-red-600 text-sm">{errors.notification}</p>
                )}
              </div>
            </div>
            
            {notificationSettings.notifyViaEmail && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  {t('flightSearch.emailAddress', 'Email Address')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={notificationSettings.email}
                  onChange={handleChange}
                  placeholder={t('flightSearch.enterEmail', 'Enter your email address')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="frequency">
                {t('flightSearch.notificationFrequency', 'Notification Frequency')}
              </label>
              <select
                id="frequency"
                name="frequency"
                value={notificationSettings.frequency}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="instant">{t('flightSearch.instant', 'Instant (as soon as price drops)')}</option>
                <option value="daily">{t('flightSearch.daily', 'Daily (at most once per day)')}</option>
                <option value="weekly">{t('flightSearch.weekly', 'Weekly summary')}</option>
              </select>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                {t('flightSearch.priceAlertInfo', 'Your alert will be active for 30 days or until you cancel it. We will notify you when the price drops below your threshold.')}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                {t('flightSearch.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('flightSearch.saveAlert', 'Save Alert')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NotificationSetup;