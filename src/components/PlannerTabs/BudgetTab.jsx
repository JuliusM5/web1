import React from 'react';
import { calculateDuration, calculateTotalBudget } from '../../utils/helpers';
import BudgetChart from '../Budget/BudgetChart';
import { useAppSettings } from '../../utils/useAppSettings';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function BudgetTab({ budgetCategories, handleBudgetChange, startDate, endDate }) {
  // Get currency formatter from app settings
  const { currency } = useAppSettings();
  // Get i18n functionality
  const { t } = useI18n();
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{t('planner.budget')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1">{t('budget.accommodation')}</label>
              <input
                type="number"
                value={budgetCategories.accommodation || ''}
                onChange={e => handleBudgetChange('accommodation', e.target.value)}
                placeholder={t('budget.accommodationPlaceholder', 'Hotels, Airbnb, etc.')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">{t('budget.food')}</label>
              <input
                type="number"
                value={budgetCategories.food || ''}
                onChange={e => handleBudgetChange('food', e.target.value)}
                placeholder={t('budget.foodPlaceholder', 'Restaurants, groceries, etc.')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">{t('budget.transportation')}</label>
              <input
                type="number"
                value={budgetCategories.transportation || ''}
                onChange={e => handleBudgetChange('transportation', e.target.value)}
                placeholder={t('budget.transportationPlaceholder', 'Flights, trains, taxis, etc.')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">{t('budget.activities')}</label>
              <input
                type="number"
                value={budgetCategories.activities || ''}
                onChange={e => handleBudgetChange('activities', e.target.value)}
                placeholder={t('budget.activitiesPlaceholder', 'Tours, attractions, etc.')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">{t('budget.other')}</label>
              <input
                type="number"
                value={budgetCategories.other || ''}
                onChange={e => handleBudgetChange('other', e.target.value)}
                placeholder={t('budget.otherPlaceholder', 'Souvenirs, gifts, miscellaneous')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">{t('budget.summary')}</h4>
            
            {/* Budget Chart */}
            <div className="mb-4">
              <BudgetChart budgetData={budgetCategories} />
            </div>
            
            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-bold text-lg">{t('budget.total')}: {currency(calculateTotalBudget(budgetCategories))}</p>
            </div>
          </div>
          
          {startDate && endDate && calculateTotalBudget(budgetCategories) > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2 text-green-800">{t('budget.dailyBudget')}</h4>
              <p className="text-green-800">
                {currency((calculateTotalBudget(budgetCategories) / calculateDuration(startDate, endDate)).toFixed(2))} {t('budget.perDay')} {t('budget.for')} {calculateDuration(startDate, endDate)} {t('budget.days')}
              </p>
            </div>
          )}
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">{t('budget.budgetTips')}:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>{t('budget.tip1')}</li>
              <li>{t('budget.tip2')}</li>
              <li>{t('budget.tip3')}</li>
              <li>{t('budget.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetTab;