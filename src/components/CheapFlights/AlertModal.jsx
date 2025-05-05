import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';

function CreateAlertModal({ onClose, onCreateAlert, userLocation }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    origin: userLocation || '',
    destination: '',
    dateType: 'flexible', // 'flexible' or 'specific'
    startDate: '',
    endDate: '',
    maxPrice: 100,
    tripLength: { min: 3, max: 14 }
  });
  
  const [popularDestinations, setPopularDestinations] = useState([
    { code: 'LON', name: 'London' },
    { code: 'PAR', name: 'Paris' },
    { code: 'BCN', name: 'Barcelona' },
    { code: 'ROM', name: 'Rome' },
    { code: 'BER', name: 'Berlin' },
    { code: 'MAD', name: 'Madrid' },
    { code: 'VIE', name: 'Vienna' },
    { code: 'AMS', name: 'Amsterdam' }
  ]);
  
  const [errors, setErrors] = useState({});
  
  // Set default dates (next weekend)
  useEffect(() => {
    const now = new Date();
    const friday = new Date(now);
    friday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7); // Next Friday
    
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2); // Sunday after the Friday
    
    setFormData(prev => ({
      ...prev,
      startDate: friday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    }));
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTripLengthChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      tripLength: {
        ...prev.tripLength,
        [type]: parseInt(value, 10)
      }
    }));
  };
  
  const handleDestinationSelect = (destination) => {
    setFormData(prev => ({
      ...prev,
      destination
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.origin) {
      newErrors.origin = t('dealAlerts.errors.originRequired');
    }
    
    if (!formData.destination) {
      newErrors.destination = t('dealAlerts.errors.destinationRequired');
    }
    
    if (formData.dateType === 'specific') {
      if (!formData.startDate) {
        newErrors.startDate = t('dealAlerts.errors.startDateRequired');
      }
      
      if (!formData.endDate) {
        newErrors.endDate = t('dealAlerts.errors.endDateRequired');
      }
      
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = t('dealAlerts.errors.endDateAfterStart');
      }
    }
    
    if (formData.tripLength.min > formData.tripLength.max) {
      newErrors.tripLength = t('dealAlerts.errors.invalidTripLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreateAlert(formData);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{t('dealAlerts.createNewAlert')}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Origin */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              {t('dealAlerts.origin')}
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.origin ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('dealAlerts.originPlaceholder')}
            />
            {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
          </div>
          
          {/* Destination */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              {t('dealAlerts.destination')}
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.destination ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('dealAlerts.destinationPlaceholder')}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
            
            {/* Popular destinations */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">{t('dealAlerts.popularDestinations')}</p>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map(dest => (
                  <button
                    key={dest.code}
                    type="button"
                    className={`text-xs px-2 py-1 rounded-full ${
                      formData.destination === dest.name ? 
                      'bg-primary text-white' : 
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleDestinationSelect(dest.name)}
                  >
                    {dest.name}
                  </button>
                ))}
                <button
                  type="button"
                  className={`text-xs px-2 py-1 rounded-full ${
                    formData.destination === 'Anywhere' ? 
                    'bg-primary text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleDestinationSelect('Anywhere')}
                >
                  {t('dealAlerts.anywhere')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Date Selection Type */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              {t('dealAlerts.dateType')}
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateType"
                  value="flexible"
                  checked={formData.dateType === 'flexible'}
                  onChange={handleChange}
                  className="mr-1"
                />
                <span className="text-sm">{t('dealAlerts.flexible')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateType"
                  value="specific"
                  checked={formData.dateType === 'specific'}
                  onChange={handleChange}
                  className="mr-1"
                />
                <span className="text-sm">{t('dealAlerts.specific')}</span>
              </label>
            </div>
          </div>
          
          {/* Date Range (for specific dates) */}
          {formData.dateType === 'specific' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {t('dealAlerts.startDate')}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {t('dealAlerts.endDate')}
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={formData.startDate}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          )}
          
          {/* Trip Length (for flexible dates) */}
          {formData.dateType === 'flexible' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                {t('dealAlerts.tripLength')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.tripLength.min}
                  onChange={(e) => handleTripLengthChange('min', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                  min="1"
                  max="30"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={formData.tripLength.max}
                  onChange={(e) => handleTripLengthChange('max', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                  min="1"
                  max="30"
                />
                <span className="text-gray-700 text-sm">{t('dealAlerts.days')}</span>
              </div>
              {errors.tripLength && <p className="text-red-500 text-xs mt-1">{errors.tripLength}</p>}
            </div>
          )}
          
          {/* Price Threshold */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              {t('dealAlerts.maxPrice')}: €{formData.maxPrice}
            </label>
            <input
              type="range"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="50"
              max="500"
              step="10"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>€50</span>
              <span>€500</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('dealAlerts.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md"
            >
              {t('dealAlerts.createAlert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAlertModal;