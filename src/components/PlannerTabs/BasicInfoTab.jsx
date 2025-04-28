import React from 'react';
import { calculateDuration } from '../../utils/helpers';
import { useAppSettings } from '../../utils/useAppSettings';

function BasicInfoTab({ 
  destination, setDestination, startDate, setStartDate, 
  endDate, setEndDate, budget, setBudget, setTab 
}) {
  // Get currency formatter from app settings
  const { currency } = useAppSettings();

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Where are you going?"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Enter any city or destination to get started</p>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Budget</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="Estimated budget"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {destination && startDate && endDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p><strong>Duration:</strong> {calculateDuration(startDate, endDate)} days</p>
          {budget && (
            <p><strong>Budget:</strong> {currency(budget)} ({currency((budget / calculateDuration(startDate, endDate)).toFixed(2))}/day)</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;