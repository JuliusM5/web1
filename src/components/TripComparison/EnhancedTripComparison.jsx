// src/components/TripComparison/EnhancedTripComparison.jsx
import React, { useState, useEffect } from 'react';
import { compareTrips, calculateDuration } from '../../utils/helpers';
import BudgetChart from '../Budget/BudgetChart';

function EnhancedTripComparison({ trips, closeTripComparison }) {
  const [trip1Id, setTrip1Id] = useState('');
  const [trip2Id, setTrip2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [comparisonView, setComparisonView] = useState('overview'); // 'overview', 'budget', 'activities', 'timeline'
  
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
  
  // Generate categories for comparison
  const generateComparisonCategories = () => {
    if (!comparison) return [];
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    
    return [
      {
        id: 'duration',
        name: 'Duration',
        trip1Value: `${comparison.duration.trip1} days`,
        trip2Value: `${comparison.duration.trip2} days`,
        difference: comparison.duration.trip1 - comparison.duration.trip2,
        differenceText: `${Math.abs(comparison.duration.trip1 - comparison.duration.trip2)} days ${
          comparison.duration.trip1 > comparison.duration.trip2 ? 'longer' : 'shorter'
        }`,
        isDifferent: comparison.duration.different
      },
      {
        id: 'budget',
        name: 'Total Budget',
        trip1Value: `$${comparison.budget.trip1}`,
        trip2Value: `$${comparison.budget.trip2}`,
        difference: comparison.budget.difference,
        differenceText: `$${Math.abs(comparison.budget.difference)} ${
          comparison.budget.difference > 0 ? 'more' : 'less'
        }`,
        isDifferent: comparison.budget.different
      },
      {
        id: 'dailyCost',
        name: 'Daily Cost',
        trip1Value: `$${(comparison.budget.trip1 / comparison.duration.trip1).toFixed(2)}/day`,
        trip2Value: `$${(comparison.budget.trip2 / comparison.duration.trip2).toFixed(2)}/day`,
        difference: (comparison.budget.trip1 / comparison.duration.trip1) - (comparison.budget.trip2 / comparison.duration.trip2),
        differenceText: `$${Math.abs((comparison.budget.trip1 / comparison.duration.trip1) - (comparison.budget.trip2 / comparison.duration.trip2)).toFixed(2)}/day ${
          (comparison.budget.trip1 / comparison.duration.trip1) > (comparison.budget.trip2 / comparison.duration.trip2) ? 'more' : 'less'
        }`,
        isDifferent: Math.abs((comparison.budget.trip1 / comparison.duration.trip1) - (comparison.budget.trip2 / comparison.duration.trip2)) > 0.01
      },
      {
        id: 'transport',
        name: 'Transportation Options',
        trip1Value: `${comparison.transportOptions.trip1} options`,
        trip2Value: `${comparison.transportOptions.trip2} options`,
        difference: comparison.transportOptions.trip1 - comparison.transportOptions.trip2,
        differenceText: `${Math.abs(comparison.transportOptions.trip1 - comparison.transportOptions.trip2)} more options`,
        isDifferent: comparison.transportOptions.different
      },
      {
        id: 'tasks',
        name: 'Planned Tasks',
        trip1Value: `${comparison.tasksCount.trip1} tasks`,
        trip2Value: `${comparison.tasksCount.trip2} tasks`,
        difference: comparison.tasksCount.trip1 - comparison.tasksCount.trip2,
        differenceText: `${Math.abs(comparison.tasksCount.trip1 - comparison.tasksCount.trip2)} more tasks`,
        isDifferent: comparison.tasksCount.different
      },
      {
        id: 'activities',
        name: 'Activities',
        trip1Value: `${trip1.tasks?.filter(t => t.category === 'activity').length || 0} activities`,
        trip2Value: `${trip2.tasks?.filter(t => t.category === 'activity').length || 0} activities`,
        difference: (trip1.tasks?.filter(t => t.category === 'activity').length || 0) - (trip2.tasks?.filter(t => t.category === 'activity').length || 0),
        differenceText: `${Math.abs((trip1.tasks?.filter(t => t.category === 'activity').length || 0) - (trip2.tasks?.filter(t => t.category === 'activity').length || 0))} more activities`,
        isDifferent: (trip1.tasks?.filter(t => t.category === 'activity').length || 0) !== (trip2.tasks?.filter(t => t.category === 'activity').length || 0)
      },
      {
        id: 'notes',
        name: 'Notes',
        trip1Value: `${comparison.notesCount.trip1} notes`,
        trip2Value: `${comparison.notesCount.trip2} notes`,
        difference: comparison.notesCount.trip1 - comparison.notesCount.trip2,
        differenceText: `${Math.abs(comparison.notesCount.trip1 - comparison.notesCount.trip2)} more notes`,
        isDifferent: comparison.notesCount.different
      }
    ];
  };
  
  // Get comparison charts data
  const getComparisonChartData = () => {
    if (!comparison) return [];
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    
    const categories = generateComparisonCategories();
    
    // Generate data for radar chart
    const radarData = categories.map(cat => ({
      category: cat.name,
      trip1: cat.id === 'budget' ? comparison.budget.trip1 : 
             cat.id === 'duration' ? comparison.duration.trip1 : 
             cat.id === 'dailyCost' ? comparison.budget.trip1 / comparison.duration.trip1 :
             cat.id === 'transport' ? comparison.transportOptions.trip1 :
             cat.id === 'tasks' ? comparison.tasksCount.trip1 :
             cat.id === 'activities' ? (trip1.tasks?.filter(t => t.category === 'activity').length || 0) :
             comparison.notesCount.trip1,
      trip2: cat.id === 'budget' ? comparison.budget.trip2 : 
             cat.id === 'duration' ? comparison.duration.trip2 : 
             cat.id === 'dailyCost' ? comparison.budget.trip2 / comparison.duration.trip2 :
             cat.id === 'transport' ? comparison.transportOptions.trip2 :
             cat.id === 'tasks' ? comparison.tasksCount.trip2 :
             cat.id === 'activities' ? (trip2.tasks?.filter(t => t.category === 'activity').length || 0) :
             comparison.notesCount.trip2
    }));
    
    return {
      radarData
    };
  };
  
  // Render the comparison bars
  const renderComparisonBars = () => {
    if (!comparison) return null;
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    const categories = generateComparisonCategories();
    
    return (
      <div className="space-y-4 mb-6">
        {categories.map(category => (
          <div key={category.id} className={`p-4 rounded-lg ${category.isDifferent ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <h4 className="font-medium mb-2">{category.name}</h4>
            <div className="flex flex-col sm:flex-row justify-between mb-2">
              <div className="mb-2 sm:mb-0">
                <span className="text-gray-700 font-medium">{trip1.destination}: </span>
                <span>{category.trip1Value}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">{trip2.destination}: </span>
                <span>{category.trip2Value}</span>
              </div>
            </div>
            
            {category.isDifferent && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Comparison</span>
                  <span className={`font-medium ${
                    category.id === 'budget' || category.id === 'dailyCost' 
                      ? category.difference > 0 ? 'text-red-600' : 'text-green-600'
                      : category.difference > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category.differenceText}
                  </span>
                </div>
                
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      category.id === 'budget' || category.id === 'dailyCost'
                        ? category.difference > 0 ? 'bg-red-500' : 'bg-green-500'
                        : category.difference > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        Math.abs(category.difference) / 
                        (category.id === 'budget' 
                          ? Math.max(comparison.budget.trip1, comparison.budget.trip2) 
                          : category.id === 'duration'
                            ? Math.max(comparison.duration.trip1, comparison.duration.trip2)
                            : 10
                        ) * 100, 
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render budget breakdown comparison
  const renderBudgetComparison = () => {
    if (!comparison || !comparison.budgetBreakdown) return null;
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold mb-4">Budget Breakdown Comparison</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Comparison with Charts */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-center font-medium">
              {trip1.destination}
            </h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <BudgetChart 
                budgetData={trip1.budgetBreakdown || {}}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h4 className="text-center font-medium">
              {trip2.destination}
            </h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <BudgetChart 
                budgetData={trip2.budgetBreakdown || {}}
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
                  {trip1.destination}
                </th>
                <th className="py-2 px-4 border-b text-center">
                  {trip2.destination}
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
              <tr className="bg-gray-100 font-bold">
                <td className="py-2 px-4 border-b">Total</td>
                <td className="py-2 px-4 border-b text-center">${comparison.budget.trip1}</td>
                <td className="py-2 px-4 border-b text-center">${comparison.budget.trip2}</td>
                <td className="py-2 px-4 border-b text-center">
                  <span className={comparison.budget.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                    {comparison.budget.difference > 0 ? '+' : ''}${comparison.budget.difference}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render activities comparison
  const renderActivitiesComparison = () => {
    if (!comparison) return null;
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    
    // Extract tasks
    const trip1Tasks = trip1.tasks || [];
    const trip2Tasks = trip2.tasks || [];
    
    // Group tasks by category
    const getTasksByCategory = (tasks) => {
      const grouped = {};
      
      tasks.forEach(task => {
        if (!grouped[task.category]) {
          grouped[task.category] = [];
        }
        grouped[task.category].push(task);
      });
      
      return grouped;
    };
    
    const trip1TasksByCategory = getTasksByCategory(trip1Tasks);
    const trip2TasksByCategory = getTasksByCategory(trip2Tasks);
    
    // Get all categories from both trips
    const allCategories = [...new Set([
      ...Object.keys(trip1TasksByCategory),
      ...Object.keys(trip2TasksByCategory)
    ])].sort();
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold mb-4">Activities & Tasks Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Category</th>
                <th className="py-2 px-4 border-b text-center">
                  {trip1.destination}
                </th>
                <th className="py-2 px-4 border-b text-center">
                  {trip2.destination}
                </th>
                <th className="py-2 px-4 border-b text-center">Difference</th>
              </tr>
            </thead>
            <tbody>
              {allCategories.map(category => {
                const trip1Count = trip1TasksByCategory[category]?.length || 0;
                const trip2Count = trip2TasksByCategory[category]?.length || 0;
                const diff = trip1Count - trip2Count;
                
                return (
                  <tr key={category} className={diff !== 0 ? 'bg-yellow-50' : ''}>
                    <td className="py-2 px-4 border-b font-medium capitalize">{category}</td>
                    <td className="py-2 px-4 border-b text-center">{trip1Count}</td>
                    <td className="py-2 px-4 border-b text-center">{trip2Count}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {diff !== 0 ? (
                        <span className={diff > 0 ? 'text-green-600' : 'text-red-600'}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      ) : (
                        <span className="text-gray-500">Same</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-bold">
                <td className="py-2 px-4 border-b">Total Tasks</td>
                <td className="py-2 px-4 border-b text-center">{trip1Tasks.length}</td>
                <td className="py-2 px-4 border-b text-center">{trip2Tasks.length}</td>
                <td className="py-2 px-4 border-b text-center">
                  <span className={trip1Tasks.length - trip2Tasks.length > 0 ? 'text-green-600' : trip1Tasks.length - trip2Tasks.length < 0 ? 'text-red-600' : 'text-gray-500'}>
                    {trip1Tasks.length - trip2Tasks.length > 0 ? '+' : ''}
                    {trip1Tasks.length - trip2Tasks.length !== 0 ? trip1Tasks.length - trip2Tasks.length : 'Same'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Task completion comparison */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">Task Completion Progress</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="font-medium text-center mb-2">{trip1.destination}</h5>
              <div className="flex justify-between text-sm mb-1">
                <span>{trip1Tasks.filter(t => t.completed).length} of {trip1Tasks.length} completed</span>
                <span className="font-medium">
                  {trip1Tasks.length > 0 ? Math.round((trip1Tasks.filter(t => t.completed).length / trip1Tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${trip1Tasks.length > 0 ? (trip1Tasks.filter(t => t.completed).length / trip1Tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="font-medium text-center mb-2">{trip2.destination}</h5>
              <div className="flex justify-between text-sm mb-1">
                <span>{trip2Tasks.filter(t => t.completed).length} of {trip2Tasks.length} completed</span>
                <span className="font-medium">
                  {trip2Tasks.length > 0 ? Math.round((trip2Tasks.filter(t => t.completed).length / trip2Tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${trip2Tasks.length > 0 ? (trip2Tasks.filter(t => t.completed).length / trip2Tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render timeline comparison
  const renderTimelineComparison = () => {
    if (!comparison) return null;
    
    const trip1 = trips.find(t => t.id.toString() === trip1Id.toString());
    const trip2 = trips.find(t => t.id.toString() === trip2Id.toString());
    
    // Generate an array of all dates in the trips
    const generateDateArray = (startDate, endDate) => {
      const dates = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      
      while (currentDate <= lastDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const trip1Dates = generateDateArray(trip1.startDate, trip1.endDate);
    const trip2Dates = generateDateArray(trip2.startDate, trip2.endDate);
    
    // Find the earliest start date and latest end date
    const earliestDate = new Date(Math.min(
      new Date(trip1.startDate).getTime(),
      new Date(trip2.startDate).getTime()
    ));
    
    const latestDate = new Date(Math.max(
      new Date(trip1.endDate).getTime(),
      new Date(trip2.endDate).getTime()
    ));
    
    // Generate array of all dates in the range
    const allDates = generateDateArray(earliestDate, latestDate);
    
    // Format date for display
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    // Check if a date is in trip1
    const isInTrip1 = (date) => {
      return date >= new Date(trip1.startDate) && date <= new Date(trip1.endDate);
    };
    
    // Check if a date is in trip2
    const isInTrip2 = (date) => {
      return date >= new Date(trip2.startDate) && date <= new Date(trip2.endDate);
    };
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold mb-4">Timeline Comparison</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-medium mr-2">{trip1.destination}:</span>
              <span>{formatDate(new Date(trip1.startDate))} - {formatDate(new Date(trip1.endDate))}</span>
              <span className="ml-2 text-sm text-gray-500">({comparison.duration.trip1} days)</span>
            </div>
            <div className="h-4 w-4 bg-blue-500 rounded"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium mr-2">{trip2.destination}:</span>
              <span>{formatDate(new Date(trip2.startDate))} - {formatDate(new Date(trip2.endDate))}</span>
              <span className="ml-2 text-sm text-gray-500">({comparison.duration.trip2} days)</span>
            </div>
            <div className="h-4 w-4 bg-green-500 rounded"></div>
          </div>
        </div>
        
        {/* Visual timeline */}
        <div className="relative h-16 bg-white rounded-lg border border-gray-200 mb-4">
          {/* Timeline bar for trip1 */}
          <div 
            className="absolute h-6 bg-blue-500 rounded-full top-2"
            style={{
              left: `${((new Date(trip1.startDate) - earliestDate) / (latestDate - earliestDate)) * 100}%`,
              width: `${(comparison.duration.trip1 * 24 * 60 * 60 * 1000) / (latestDate - earliestDate) * 100}%`
            }}
          ></div>
          
          {/* Timeline bar for trip2 */}
          <div 
            className="absolute h-6 bg-green-500 rounded-full bottom-2"
            style={{
              left: `${((new Date(trip2.startDate) - earliestDate) / (latestDate - earliestDate)) * 100}%`,
              width: `${(comparison.duration.trip2 * 24 * 60 * 60 * 1000) / (latestDate - earliestDate) * 100}%`
            }}
          ></div>
          
          {/* Date markers */}
          {[earliestDate, latestDate].map((date, i) => (
            <div 
              key={i}
              className="absolute bottom-0 transform -translate-x-1/2"
              style={{
                left: i === 0 ? '0%' : '100%'
              }}
            >
              <div className="h-full border-l border-gray-300"></div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(date)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Overlapping days */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Trip Overlap</h4>
          
          {/* Count overlapping days */}
          {(() => {
            const overlappingDays = allDates.filter(date => isInTrip1(date) && isInTrip2(date)).length;
            
            if (overlappingDays > 0) {
              return (
                <div className="bg-purple-100 p-3 rounded-lg text-purple-800">
                  <p>These trips have <strong>{overlappingDays} overlapping days</strong>.</p>
                  <p className="text-sm mt-1">
                    This means you would be in both destinations on the same dates, which isn't possible.
                    Consider rescheduling one of the trips.
                  </p>
                </div>
              );
            } else {
              const daysBetween = Math.floor((new Date(Math.min(
                new Date(trip2.startDate).getTime(),
                new Date(trip1.endDate).getTime()
              )) - new Date(Math.max(
                new Date(trip1.startDate).getTime(),
                new Date(trip2.endDate).getTime()
              ))) / (24 * 60 * 60 * 1000));
              
              if (daysBetween > 0) {
                return (
                  <div className="bg-green-100 p-3 rounded-lg text-green-800">
                    <p>These trips are spaced <strong>{daysBetween} days apart</strong>.</p>
                    <p className="text-sm mt-1">
                      This gives you enough time between trips to prepare and rest.
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="bg-yellow-100 p-3 rounded-lg text-yellow-800">
                    <p>These trips are scheduled back-to-back or on completely different dates.</p>
                    <p className="text-sm mt-1">
                      Make sure you have enough time to prepare between trips if they're close together.
                    </p>
                  </div>
                );
              }
            }
          })()}
        </div>
      </div>
    );
  };
  
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
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap -mb-px">
                  <button
                    onClick={() => setComparisonView('overview')}
                    className={`mr-4 py-2 px-4 font-medium border-b-2 ${
                      comparisonView === 'overview' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setComparisonView('budget')}
                    className={`mr-4 py-2 px-4 font-medium border-b-2 ${
                      comparisonView === 'budget' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    Budget
                  </button>
                  <button
                    onClick={() => setComparisonView('activities')}
                    className={`mr-4 py-2 px-4 font-medium border-b-2 ${
                      comparisonView === 'activities' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    Activities
                  </button>
                  <button
                    onClick={() => setComparisonView('timeline')}
                    className={`mr-4 py-2 px-4 font-medium border-b-2 ${
                      comparisonView === 'timeline' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    Timeline
                  </button>
                </nav>
              </div>
              
              {/* Overview View */}
              {comparisonView === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Trip Overview Comparison</h3>
                  {renderComparisonBars()}
                  
                  {/* Trip Comparison Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2">Trip Comparison Summary</h3>
                    
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">
                          {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                        </span> is
                        {' '}
                        <span className={
                          comparison.budget.difference > 0 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'
                        }>
                          ${Math.abs(comparison.budget.difference)}
                          {' '}
                          {comparison.budget.difference > 0 ? 'more' : 'less'} expensive
                        </span>
                        {' '}
                        than <span className="font-medium">
                          {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}
                        </span>.
                      </p>
                      
                      <p>
                        The trip to <span className="font-medium">
                          {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                        </span> is
                        {' '}
                        <span className="font-medium">
                          {comparison.duration.trip1 > comparison.duration.trip2 
                            ? `${comparison.duration.trip1 - comparison.duration.trip2} days longer` 
                            : comparison.duration.trip1 < comparison.duration.trip2
                              ? `${comparison.duration.trip2 - comparison.duration.trip1} days shorter`
                              : `the same length`
                          }
                        </span>.
                      </p>
                      
                      <p>
                        On a daily basis, <span className="font-medium">
                          {trips.find(t => t.id.toString() === trip1Id.toString())?.destination}
                        </span> costs
                        {' '}
                        <span className={
                          (comparison.budget.trip1 / comparison.duration.trip1) >
                          (comparison.budget.trip2 / comparison.duration.trip2)
                            ? 'font-medium text-red-600' : 'font-medium text-green-600'
                        }>
                          ${Math.abs((comparison.budget.trip1 / comparison.duration.trip1) - 
                            (comparison.budget.trip2 / comparison.duration.trip2)).toFixed(2)}
                          {' '}
                          {(comparison.budget.trip1 / comparison.duration.trip1) >
                            (comparison.budget.trip2 / comparison.duration.trip2) ? 'more' : 'less'}
                        </span>
                        {' '}
                        per day than <span className="font-medium">
                          {trips.find(t => t.id.toString() === trip2Id.toString())?.destination}
                        </span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Budget View */}
              {comparisonView === 'budget' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Budget Comparison</h3>
                  {renderBudgetComparison()}
                </div>
              )}
              
              {/* Activities View */}
              {comparisonView === 'activities' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Activities & Tasks Comparison</h3>
                  {renderActivitiesComparison()}
                </div>
              )}
              
              {/* Timeline View */}
              {comparisonView === 'timeline' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Timeline Comparison</h3>
                  {renderTimelineComparison()}
                </div>
              )}
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

export default EnhancedTripComparison;