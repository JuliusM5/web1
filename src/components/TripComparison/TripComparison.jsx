import React, { useState, useEffect } from 'react';
import { compareTrips, calculateDuration } from '../../utils/helpers';
import BudgetChart from '../Budget/BudgetChart';

function TripComparison({ trips, closeTripComparison }) {
  const [trip1Id, setTrip1Id] = useState('');
  const [trip2Id, setTrip2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  
  // Update comparison when trips are selected
  useEffect(() => {
    if (trip1Id && trip2Id && trip1Id !== trip2Id) {
      const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
      const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
      
      if (trip1 && trip2) {
        const result = compareTrips(trip1, trip2);
        setComparison(result);
      }
    } else {
      setComparison(null);
    }
  }, [trip1Id, trip2Id, trips]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Trip Comparison</h2>
        <button
          onClick={closeTripComparison}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
      
      {trips.length < 2 ? (
        <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">You need at least two trips to compare.</p>
          <p className="mt-2 text-sm text-yellow-700">Please create more trips to use this feature.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Trip 1 Selector */}
            <div>
              <label className="block text-gray-700 mb-2">First Trip</label>
              <select
                value={trip1Id}
                onChange={e => setTrip1Id(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a trip</option>
                {trips.map(trip => (
                  <option key={`t1-${trip.id}`} value={trip.id}>
                    {trip.destination} ({trip.startDate} to {trip.endDate})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Trip 2 Selector */}
            <div>
              <label className="block text-gray-700 mb-2">Second Trip</label>
              <select
                value={trip2Id}
                onChange={e => setTrip2Id(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a trip</option>
                {trips.map(trip => (
                  <option 
                    key={`t2-${trip.id}`} 
                    value={trip.id}
                    disabled={trip.id.toString() === trip1Id.toString()}
                  >
                    {trip.destination} ({trip.startDate} to {trip.endDate})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {comparison ? (
            <div className="space-y-6">
              {/* Basic Comparison Table */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-4">Trip Overview Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left"></th>
                        <th className="py-2 px-4 border-b text-center">
                          {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                        </th>
                        <th className="py-2 px-4 border-b text-center">
                          {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}
                        </th>
                        <th className="py-2 px-4 border-b text-center">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={comparison.duration.different ? 'bg-yellow-50' : ''}>
                        <td className="py-2 px-4 border-b font-medium">Duration</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.duration.trip1} days</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.duration.trip2} days</td>
                        <td className="py-2 px-4 border-b text-center">
                          {comparison.duration.different ? (
                            <span className={comparison.duration.trip1 > comparison.duration.trip2 ? 'text-green-600' : 'text-red-600'}>
                              {comparison.duration.trip1 > comparison.duration.trip2 ? '+' : ''}
                              {comparison.duration.trip1 - comparison.duration.trip2} days
                            </span>
                          ) : (
                            <span className="text-gray-500">Same</span>
                          )}
                        </td>
                      </tr>
                      
                      <tr className={comparison.budget.different ? 'bg-yellow-50' : ''}>
                        <td className="py-2 px-4 border-b font-medium">Total Budget</td>
                        <td className="py-2 px-4 border-b text-center">${comparison.budget.trip1}</td>
                        <td className="py-2 px-4 border-b text-center">${comparison.budget.trip2}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {comparison.budget.different ? (
                            <span className={comparison.budget.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                              {comparison.budget.difference > 0 ? '+' : ''}
                              ${comparison.budget.difference}
                            </span>
                          ) : (
                            <span className="text-gray-500">Same</span>
                          )}
                        </td>
                      </tr>
                      
                      <tr>
                        <td className="py-2 px-4 border-b font-medium">Daily Cost</td>
                        <td className="py-2 px-4 border-b text-center">
                          ${(comparison.budget.trip1 / comparison.duration.trip1).toFixed(2)}/day
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          ${(comparison.budget.trip2 / comparison.duration.trip2).toFixed(2)}/day
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {(comparison.budget.trip1 / comparison.duration.trip1).toFixed(2) !== 
                           (comparison.budget.trip2 / comparison.duration.trip2).toFixed(2) ? (
                            <span className={
                              (comparison.budget.trip1 / comparison.duration.trip1) > 
                              (comparison.budget.trip2 / comparison.duration.trip2) 
                                ? 'text-red-600' : 'text-green-600'
                            }>
                              ${Math.abs(((comparison.budget.trip1 / comparison.duration.trip1) - 
                                 (comparison.budget.trip2 / comparison.duration.trip2))).toFixed(2)}/day
                            </span>
                          ) : (
                            <span className="text-gray-500">Same</span>
                          )}
                        </td>
                      </tr>
                      
                      <tr className={comparison.transportOptions.different ? 'bg-yellow-50' : ''}>
                        <td className="py-2 px-4 border-b font-medium">Transportation Options</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.transportOptions.trip1}</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.transportOptions.trip2}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {comparison.transportOptions.different ? (
                            <span>
                              {comparison.transportOptions.trip1 > comparison.transportOptions.trip2 ? '+' : ''}
                              {comparison.transportOptions.trip1 - comparison.transportOptions.trip2}
                            </span>
                          ) : (
                            <span className="text-gray-500">Same</span>
                          )}
                        </td>
                      </tr>
                      
                      <tr className={comparison.tasksCount.different ? 'bg-yellow-50' : ''}>
                        <td className="py-2 px-4 border-b font-medium">Tasks</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.tasksCount.trip1}</td>
                        <td className="py-2 px-4 border-b text-center">{comparison.tasksCount.trip2}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {comparison.tasksCount.different ? (
                            <span>
                              {comparison.tasksCount.trip1 > comparison.tasksCount.trip2 ? '+' : ''}
                              {comparison.tasksCount.trip1 - comparison.tasksCount.trip2}
                            </span>
                          ) : (
                            <span className="text-gray-500">Same</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Budget Breakdown Comparison */}
              {comparison.budgetBreakdown && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold mb-4">Budget Breakdown Comparison</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visual Comparison with Charts */}
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-center font-medium">
                        {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <BudgetChart 
                          budgetData={trips.find(t => t.id.toString() === trip1Id.toString())?.budgetBreakdown || {}}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-center font-medium">
                        {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <BudgetChart 
                          budgetData={trips.find(t => t.id.toString() === trip2Id.toString())?.budgetBreakdown || {}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Budget Comparison Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Category</th>
                          <th className="py-2 px-4 border-b text-center">
                            {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                          </th>
                          <th className="py-2 px-4 border-b text-center">
                            {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}
                          </th>
                          <th className="py-2 px-4 border-b text-center">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(comparison.budgetBreakdown).map(([category, data]) => (
                          <tr key={category} className={data.different ? 'bg-yellow-50' : ''}>
                            <td className="py-2 px-4 border-b font-medium capitalize">{category}</td>
                            <td className="py-2 px-4 border-b text-center">${data.trip1}</td>
                            <td className="py-2 px-4 border-b text-center">${data.trip2}</td>
                            <td className="py-2 px-4 border-b text-center">
                              {data.different ? (
                                <span className={data.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {data.difference > 0 ? '+' : ''}${data.difference}
                                </span>
                              ) : (
                                <span className="text-gray-500">Same</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2">Trip Comparison Summary</h3>
                <p>
                  {trips.find(t => t.id.toString() === trip1Id.toString())?.destination} is
                  {' '}
                  <span className={
                    comparison.budget.difference > 0 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'
                  }>
                    ${Math.abs(comparison.budget.difference)}
                    {' '}
                    {comparison.budget.difference > 0 ? 'more' : 'less'} expensive
                  </span>
                  {' '}
                  than {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}.
                </p>
                <p className="mt-2">
                  The trip to {trips.find(t => t.id.toString() === trip1Id.toString())?.destination} is
                  {' '}
                  <span className="font-semibold">
                    {comparison.duration.trip1 > comparison.duration.trip2 
                      ? `${comparison.duration.trip1 - comparison.duration.trip2} days longer` 
                      : comparison.duration.trip1 < comparison.duration.trip2
                        ? `${comparison.duration.trip2 - comparison.duration.trip1} days shorter`
                        : `the same length`
                    }
                  </span>.
                </p>
                <p className="mt-2">
                  On a daily basis, {trips.find(t => t.id.toString() === trip1Id.toString())?.destination} costs
                  {' '}
                  <span className={
                    (comparison.budget.trip1 / comparison.duration.trip1) >
                    (comparison.budget.trip2 / comparison.duration.trip2)
                      ? 'font-semibold text-red-600' : 'font-semibold text-green-600'
                  }>
                    ${Math.abs((comparison.budget.trip1 / comparison.duration.trip1) - 
                      (comparison.budget.trip2 / comparison.duration.trip2)).toFixed(2)}
                    {' '}
                    {(comparison.budget.trip1 / comparison.duration.trip1) >
                      (comparison.budget.trip2 / comparison.duration.trip2) ? 'more' : 'less'}
                  </span>
                  {' '}
                  per day than {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}.
                </p>
              </div>
            </div>
          ) : (
            trip1Id && trip2Id ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Unable to compare these trips. Please ensure both trips are selected correctly.</p>
              </div>
            ) : (
              <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">Select two trips to compare them.</p>
                <p className="mt-2 text-sm text-blue-700">You'll see a detailed comparison of budgets, durations, and features.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default TripComparison;