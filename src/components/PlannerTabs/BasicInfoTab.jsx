import React from 'react';
import { calculateDuration } from '../../utils/helpers';
import { useAppSettings } from '../../utils/useAppSettings';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function BasicInfoTab({ 
  destination, setDestination, startDate, setStartDate, 
  endDate, setEndDate, budget, setBudget, setTab 
}) {
  // Get currency formatter from app settings
  const { currency } = useAppSettings();
  // Get i18n functionality
  const { t } = useI18n();

  return (
    <div>
      <div className="space-y-4">
        <div>
        <label className="block text-gray-700 mb-2">{t('basicInfo.destination')}</label>
        <input
          type="text"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder={t('basicInfo.destinationPlaceholder')}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <p className="text-xs text-gray-500 mt-1">{t('basicInfo.destinationHint')}</p>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">{t('basicInfo.startDate', 'Start Date')}</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">{t('basicInfo.endDate', 'End Date')}</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">{t('basicInfo.budget', 'Budget')}</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder={t('basicInfo.budgetPlaceholder', 'Estimated budget')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {destination && startDate && endDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p>
            <strong>{t('basicInfo.duration', 'Duration')}:</strong> 
            {calculateDuration(startDate, endDate)} {t('basicInfo.days', 'days')}
          </p>
          {budget && (
            <p>
              <strong>{t('basicInfo.budget', 'Budget')}:</strong> 
              {currency(budget)} ({currency((budget / calculateDuration(startDate, endDate)).toFixed(2))}/{t('basicInfo.days', 'day')})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;