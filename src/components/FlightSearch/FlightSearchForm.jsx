import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n';
import AirportAutocomplete from './AirportAutocomplete';

function FlightSearchForm({ initialValues, onSearch }) {
  const { t } = useI18n();
  const [formValues, setFormValues] = useState(initialValues || {
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    nonStop: false
  });
  const [tripType, setTripType] = useState('roundTrip');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Initialize form with initial values if they change
    if (initialValues) {
      setFormValues(initialValues);
      
      // Set trip type based on whether returnDate is provided
      if (initialValues.returnDate) {
        setTripType('roundTrip');
      } else {
        setTripType('oneWay');
      }
    }
  }, [initialValues]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormValues(prev => ({
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
  
  const handleTripTypeChange = (type) => {
    setTripType(type);
    
    // Clear return date for one-way trips
    if (type === 'oneWay') {
      setFormValues(prev => ({
        ...prev,
        returnDate: ''
      }));
    }
  };
  
  const handleOriginSelect = (airport) => {
    setFormValues(prev => ({
      ...prev,
      origin: airport.code
    }));
    
    if (errors.origin) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.origin;
        return newErrors;
      });
    }
  };
  
  const handleDestinationSelect = (airport) => {
    setFormValues(prev => ({
      ...prev,
      destination: airport.code
    }));
    
    if (errors.destination) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.destination;
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.origin) {
      newErrors.origin = t('flightSearch.errors.originRequired', 'Origin airport is required');
    }
    
    if (!formValues.destination) {
      newErrors.destination = t('flightSearch.errors.destinationRequired', 'Destination airport is required');
    }
    
    if (formValues.origin === formValues.destination && formValues.origin) {
      newErrors.destination = t('flightSearch.errors.sameAirports', 'Origin and destination cannot be the same');
    }
    
    if (!formValues.departureDate) {
      newErrors.departureDate = t('flightSearch.errors.departureDateRequired', 'Departure date is required');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formValues.departureDate);
      
      if (selectedDate < today) {
        newErrors.departureDate = t('flightSearch.errors.pastDepartureDate', 'Departure date cannot be in the past');
      }
    }
    
    if (tripType === 'roundTrip' && !formValues.returnDate) {
      newErrors.returnDate = t('flightSearch.errors.returnDateRequired', 'Return date is required for round trips');
    } else if (tripType === 'roundTrip' && formValues.returnDate && formValues.departureDate) {
      const departureDate = new Date(formValues.departureDate);
      const returnDate = new Date(formValues.returnDate);
      
      if (returnDate < departureDate) {
        newErrors.returnDate = t('flightSearch.errors.returnBeforeDeparture', 'Return date cannot be before departure date');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // For one-way trips, ensure returnDate is empty
    const searchParams = { ...formValues };
    if (tripType === 'oneWay') {
      searchParams.returnDate = '';
    }
    
    onSearch(searchParams);
  };
  
  const minDepartureDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const minReturnDate = () => {
    if (formValues.departureDate) {
      return formValues.departureDate;
    }
    return minDepartureDate();
  };
  
  // Calculate max date (1 year from today)
  const maxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    return today.toISOString().split('T')[0];
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="roundTrip"
            name="tripType"
            value="roundTrip"
            checked={tripType === 'roundTrip'}
            onChange={() => handleTripTypeChange('roundTrip')}
            className="mr-2"
          />
          <label htmlFor="roundTrip">{t('flightSearch.roundTrip', 'Round Trip')}</label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="oneWay"
            name="tripType"
            value="oneWay"
            checked={tripType === 'oneWay'}
            onChange={() => handleTripTypeChange('oneWay')}
            className="mr-2"
          />
          <label htmlFor="oneWay">{t('flightSearch.oneWay', 'One Way')}</label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            {t('flightSearch.origin', 'Origin')}
          </label>
          <AirportAutocomplete
            value={formValues.origin}
            onChange={(e) => handleChange({ target: { name: 'origin', value: e.target.value } })}
            onSelect={handleOriginSelect}
            placeholder={t('flightSearch.originPlaceholder', 'City or airport')}
          />
          {errors.origin && (
            <p className="text-red-600 text-sm mt-1">{errors.origin}</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 font-medium">
            {t('flightSearch.destination', 'Destination')}
          </label>
          <AirportAutocomplete
            value={formValues.destination}
            onChange={(e) => handleChange({ target: { name: 'destination', value: e.target.value } })}
            onSelect={handleDestinationSelect}
            placeholder={t('flightSearch.destinationPlaceholder', 'City or airport')}
          />
          {errors.destination && (
            <p className="text-red-600 text-sm mt-1">{errors.destination}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="departureDate" className="block mb-1 font-medium">
            {t('flightSearch.departureDate', 'Departure Date')}
          </label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            value={formValues.departureDate}
            onChange={handleChange}
            min={minDepartureDate()}
            max={maxDate()}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.departureDate && (
            <p className="text-red-600 text-sm mt-1">{errors.departureDate}</p>
          )}
        </div>
        
        {tripType === 'roundTrip' && (
          <div>
            <label htmlFor="returnDate" className="block mb-1 font-medium">
              {t('flightSearch.returnDate', 'Return Date')}
            </label>
            <input
              type="date"
              id="returnDate"
              name="returnDate"
              value={formValues.returnDate}
              onChange={handleChange}
              min={minReturnDate()}
              max={maxDate()}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!formValues.departureDate}
            />
            {errors.returnDate && (
              <p className="text-red-600 text-sm mt-1">{errors.returnDate}</p>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="passengers" className="block mb-1 font-medium">
            {t('flightSearch.passengers', 'Passengers')}
          </label>
          <input
            type="number"
            id="passengers"
            name="passengers"
            value={formValues.passengers}
            onChange={handleChange}
            min="1"
            max="9"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label htmlFor="cabinClass" className="block mb-1 font-medium">
            {t('flightSearch.cabinClass', 'Cabin Class')}
          </label>
          <select
            id="cabinClass"
            name="cabinClass"
            value={formValues.cabinClass}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="economy">{t('flightSearch.economy', 'Economy')}</option>
            <option value="premiumEconomy">{t('flightSearch.premiumEconomy', 'Premium Economy')}</option>
            <option value="business">{t('flightSearch.business', 'Business')}</option>
            <option value="first">{t('flightSearch.first', 'First Class')}</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="nonStop"
          name="nonStop"
          checked={formValues.nonStop}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="nonStop">
          {t('flightSearch.nonStop', 'Non-stop flights only')}
        </label>
      </div>
      
      <div className="text-center mt-6">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('flightSearch.searchButton', 'Search Flights')}
        </button>
      </div>
    </form>
  );
}

export default FlightSearchForm;