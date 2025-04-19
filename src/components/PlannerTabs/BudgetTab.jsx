import React from 'react';
import { calculateDuration, calculateTotalBudget } from '../../utils/helpers';
import BudgetChart from '../Budget/BudgetChart';

function BudgetTab({ budgetCategories, handleBudgetChange, startDate, endDate }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Budget Planner</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1">Accommodation ($)</label>
              <input
                type="number"
                value={budgetCategories.accommodation || ''}
                onChange={e => handleBudgetChange('accommodation', e.target.value)}
                placeholder="Hotels, Airbnb, etc."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Food ($)</label>
              <input
                type="number"
                value={budgetCategories.food || ''}
                onChange={e => handleBudgetChange('food', e.target.value)}
                placeholder="Restaurants, groceries, etc."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Transportation ($)</label>
              <input
                type="number"
                value={budgetCategories.transportation || ''}
                onChange={e => handleBudgetChange('transportation', e.target.value)}
                placeholder="Flights, trains, taxis, etc."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Activities ($)</label>
              <input
                type="number"
                value={budgetCategories.activities || ''}
                onChange={e => handleBudgetChange('activities', e.target.value)}
                placeholder="Tours, attractions, etc."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Other ($)</label>
              <input
                type="number"
                value={budgetCategories.other || ''}
                onChange={e => handleBudgetChange('other', e.target.value)}
                placeholder="Souvenirs, gifts, miscellaneous"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Budget Summary</h4>
            
            {/* Budget Chart */}
            <div className="mb-4">
              <BudgetChart budgetData={budgetCategories} />
            </div>
            
            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-bold text-lg">Total: ${calculateTotalBudget(budgetCategories)}</p>
            </div>
          </div>
          
          {startDate && endDate && calculateTotalBudget(budgetCategories) > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2 text-green-800">Daily Budget</h4>
              <p className="text-green-800">
                ${(calculateTotalBudget(budgetCategories) / calculateDuration(startDate, endDate)).toFixed(2)} per day for {calculateDuration(startDate, endDate)} days
              </p>
            </div>
          )}
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">Budget Tips:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>Always keep a buffer of 10-15% for unexpected expenses</li>
              <li>Research local tipping customs before your trip</li>
              <li>Consider accommodations with kitchens to save on food</li>
              <li>Look for city passes that include multiple attractions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetTab;