import React, { useState, useCallback, memo } from 'react';
import { calculateDuration, exportTripToPDF } from '../../utils/helpers';
import { formatCurrency, formatDate } from '../../utils/settingsUtils';
import { useI18n } from '../../utils/i18n';

// Memoized components for better performance
const TripHeader = memo(({ trip, formatMobileDate, closeTrip, showActionsMenu, setShowActionsMenu }) => (
  <div className="sticky top-0 z-10 bg-white pb-3 pt-2">
    <div className="flex justify-between items-center mb-2">
      <button
        onClick={closeTrip}
        className="text-gray-600 p-2"
        aria-label="Go back"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>
      
      <div className="relative">
        <button
          onClick={() => setShowActionsMenu(!showActionsMenu)}
          className="text-gray-600 p-2"
          aria-label="More actions"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <h2 className="text-2xl font-bold text-gray-800">{trip?.destination || 'No Destination'}</h2>
    <div className="text-gray-600">
      <span>{formatMobileDate(trip?.startDate)} - {formatMobileDate(trip?.endDate)}</span>
      <span className="ml-2 text-sm">({calculateDuration(trip?.startDate, trip?.endDate)} days)</span>
    </div>
  </div>
));

const TabNavigation = memo(({ activeTab, setActiveTab }) => (
  <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mt-4 -mx-4 px-4">
    {[
      { id: 'overview', label: 'Overview' },
      { id: 'itinerary', label: 'Itinerary' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'budget', label: 'Budget' },
      { id: 'notes', label: 'Notes' }
    ].map(tab => (
      <button
        key={tab.id}
        className={`mr-4 py-2 font-medium whitespace-nowrap ${
          activeTab === tab.id 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500'
        }`}
        onClick={() => setActiveTab(tab.id)}
        aria-selected={activeTab === tab.id}
        role="tab"
      >
        {tab.label}
      </button>
    ))}
  </div>
));

const ActionsMenu = memo(({ showActionsMenu, editTrip, trip, handleExportPDF }) => {
  if (!showActionsMenu || !trip) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
      <div className="py-1">
        <button
          onClick={() => {
            editTrip(trip);
          }}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Edit Trip
        </button>
        <button
          onClick={handleExportPDF}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Export as PDF
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Trip to ${trip?.destination || 'Unknown Destination'}`,
                text: `Check out my trip to ${trip?.destination || 'Unknown Destination'}!`,
                url: window.location.href
              }).catch(err => console.error('Share failed:', err));
            } else {
              alert('Web Share API not supported on this browser');
            }
          }}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Share Trip
        </button>
      </div>
    </div>
  );
});

// Main component
function ImprovedMobileOptimizedTripDetails({ trip, editTrip, closeTrip, shareEmail, setShareEmail, userSettings }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const { t } = useI18n();
  
  // Format date for mobile display
  const formatMobileDate = useCallback((dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);
  
  // Handle PDF export
  const handleExportPDF = useCallback(() => {
    if (trip) {
      exportTripToPDF(trip, userSettings);
      setShowActionsMenu(false);
    }
  }, [trip, userSettings, setShowActionsMenu]);
  
  // Handle click outside actions menu
  const handleDocumentClick = useCallback((e) => {
    if (showActionsMenu) {
      setShowActionsMenu(false);
    }
  }, [showActionsMenu]);
  
  // Attach document click handler
  React.useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleDocumentClick]);
  
  // Check if trip is undefined and handle gracefully
  if (!trip) {
    return (
      <div className="px-4 max-w-md mx-auto flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Trip data not available</h2>
          <p className="text-gray-600 mb-4">Unable to load trip details</p>
          <button
            onClick={closeTrip}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Render tab content
  const renderTabContent = () => {
    // First check if trip exists
    if (!trip) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">Trip data not available</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return <OverviewTab trip={trip} formatMobileDate={formatMobileDate} userSettings={userSettings} setActiveTab={setActiveTab} />;
      case 'itinerary':
        return <ItineraryTab trip={trip} formatMobileDate={formatMobileDate} />;
      case 'tasks':
        return <TasksTab trip={trip} />;
      case 'budget':
        return <BudgetTab trip={trip} userSettings={userSettings} calculateDuration={calculateDuration} />;
      case 'notes':
        return <NotesTab trip={trip} />;
      default:
        return <OverviewTab trip={trip} formatMobileDate={formatMobileDate} userSettings={userSettings} setActiveTab={setActiveTab} />;
    }
  };
  
  return (
    <div className="px-4 max-w-md mx-auto pb-20">
      {/* Header */}
      <TripHeader 
        trip={trip} 
        formatMobileDate={formatMobileDate} 
        closeTrip={closeTrip} 
        showActionsMenu={showActionsMenu} 
        setShowActionsMenu={setShowActionsMenu} 
      />
      
      {/* Actions Menu */}
      <ActionsMenu 
        showActionsMenu={showActionsMenu} 
        editTrip={editTrip} 
        trip={trip} 
        handleExportPDF={handleExportPDF} 
      />
      
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Tab Content */}
      <div className="mt-4" role="tabpanel" aria-label={`${activeTab} tab content`}>
        {renderTabContent()}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between z-20">
        <button
          onClick={() => editTrip(trip)}
          className="w-1/2 bg-blue-600 text-white py-2 rounded-l-lg flex items-center justify-center"
          aria-label="Edit trip details"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          {t('actions.editTrip')}
        </button>
        <button
          onClick={handleExportPDF}
          className="w-1/2 bg-gray-600 text-white py-2 rounded-r-lg flex items-center justify-center"
          aria-label="Export trip details as PDF"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          {t('actions.exportPDF')}
        </button>
      </div>
    </div>
  );
}

// Tab content components
const OverviewTab = memo(({ trip, formatMobileDate, userSettings, setActiveTab }) => (
  <div className="space-y-4">
    {/* Trip Stats */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-100 p-3 rounded-lg text-center">
        <p className="text-xs text-blue-800">Duration</p>
        <p className="text-xl font-bold text-blue-800">{calculateDuration(trip?.startDate, trip?.endDate)} days</p>
      </div>
      <div className="bg-green-100 p-3 rounded-lg text-center">
        <p className="text-xs text-green-800">Budget</p>
        <p className="text-xl font-bold text-green-800">{formatCurrency(trip?.budget, userSettings)}</p>
      </div>
      <div className="bg-purple-100 p-3 rounded-lg text-center">
        <p className="text-xs text-purple-800">Tasks</p>
        <p className="text-xl font-bold text-purple-800">{trip?.tasks?.length || 0}</p>
      </div>
      <div className="bg-orange-100 p-3 rounded-lg text-center">
        <p className="text-xs text-orange-800">Notes</p>
        <p className="text-xl font-bold text-orange-800">{trip?.notes?.length || 0}</p>
      </div>
    </div>
    
    {/* Local Info */}
    {trip?.info && (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Local Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <span className="text-red-500 mr-2" aria-hidden="true">🚨</span>
            <div>
              <p className="font-medium">Emergency</p>
              <p>{trip.info.emergency}</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2" aria-hidden="true">💰</span>
            <div>
              <p className="font-medium">Currency</p>
              <p>{trip.info.currency}</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2" aria-hidden="true">🗣️</span>
            <div>
              <p className="font-medium">Language</p>
              <p>{trip.info.language}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Quick view sections with "See all" links */}
    {renderQuickViewSection({
      title: "Transportation",
      items: trip?.transports,
      maxItems: 3,
      targetTab: 'itinerary',
      setActiveTab,
      renderItem: (t) => (
        <div key={t.id} className="bg-gray-50 p-2 rounded-lg text-sm">
          <div className="font-medium">{t.type}</div>
          <div className="flex justify-between">
            <span>From: {t.from}</span>
            <span>To: {t.to}</span>
          </div>
          {t.price && <div className="text-right text-gray-600">${t.price}</div>}
        </div>
      )
    })}
    
    {renderQuickViewSection({
      title: "Tasks",
      items: trip?.tasks,
      maxItems: 4,
      targetTab: 'tasks',
      setActiveTab,
      renderItem: (task) => (
        <div key={task.id} className="flex items-center text-sm">
          <span className={`mr-2 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} aria-hidden="true">
            {task.completed ? '✓' : '○'}
          </span>
          <p className={task.completed ? 'line-through text-gray-500' : ''}>
            {task.text}
          </p>
        </div>
      )
    })}
    
    {/* Photos Quick View */}
    {trip?.photos && trip.photos.length > 0 && (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Photos</h3>
        <div className="flex overflow-x-auto -mx-1 px-1 pb-2 hide-scrollbar">
          {trip.photos.map(photo => (
            <div key={photo.id} className="flex-shrink-0 w-32 h-24 mr-2 rounded-lg overflow-hidden">
              <img 
                src={photo.url} 
                alt={photo.caption || "Trip photo"}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/300/200";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));

// Helper function for rendering quick view sections
function renderQuickViewSection({ title, items, maxItems, targetTab, setActiveTab, renderItem }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button
          onClick={() => setActiveTab(targetTab)}
          className="text-xs text-blue-600"
        >
          See all
        </button>
      </div>
      <div className="space-y-2">
        {items.slice(0, maxItems).map(renderItem)}
        {items.length > maxItems && (
          <p className="text-center text-sm text-gray-500">
            +{items.length - maxItems} more {title.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}

// Itinerary Tab Component
const ItineraryTab = memo(({ trip, formatMobileDate }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Trip Itinerary</h3>
    
    {/* Transportation */}
    {trip?.transports && trip.transports.length > 0 ? (
      <div className="space-y-3">
        <h4 className="text-sm text-gray-600">Transportation</h4>
        {trip.transports.map(t => (
          <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between">
              <div className="font-medium">{t.type}</div>
              {t.price && <div className="text-gray-600">${t.price}</div>}
            </div>
            <div className="mt-1 flex items-center text-sm">
              <div className="flex-1">
                <p className="text-gray-600">From:</p>
                <p className="font-medium">{t.from}</p>
              </div>
              <div className="text-gray-400 px-2" aria-hidden="true">➔</div>
              <div className="flex-1">
                <p className="text-gray-600">To:</p>
                <p className="font-medium">{t.to}</p>
              </div>
            </div>
            {t.date && (
              <div className="mt-1 text-sm">
                <span className="text-gray-600">Date:</span> {formatMobileDate(t.date)}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No transportation details added.</p>
      </div>
    )}
    
    {/* Daily Schedule */}
    <div className="mt-4">
      <h4 className="text-sm text-gray-600 mb-2">Day-by-Day Schedule</h4>
      {trip?.tasks && trip.tasks.filter(task => task.date).length > 0 ? (
        <div className="space-y-4">
          {/* Group tasks by date */}
          {Object.entries(
            trip.tasks
              .filter(task => task.date)
              .reduce((days, task) => {
                if (!days[task.date]) days[task.date] = [];
                days[task.date].push(task);
                return days;
              }, {})
          )
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, tasks]) => (
              <div key={date} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h5 className="font-medium">{formatMobileDate(date)}</h5>
                <div className="mt-2 space-y-2">
                  {tasks
                    .sort((a, b) => {
                      if (a.time && b.time) return a.time.localeCompare(b.time);
                      if (a.time) return -1;
                      if (b.time) return 1;
                      return 0;
                    })
                    .map(task => (
                      <div key={task.id} className="flex items-start">
                        {task.time && (
                          <div className="text-sm font-medium mr-2 text-gray-700">
                            {task.time.substring(0, 5)}
                          </div>
                        )}
                        <div className={`flex items-start flex-1 ${task.completed ? 'text-gray-500' : ''}`}>
                          <span className={`mt-0.5 mr-2 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} aria-hidden="true">
                            {task.completed ? '✓' : '○'}
                          </span>
                          <div className={task.completed ? 'line-through' : ''}>
                            <p>{task.text}</p>
                            <p className="text-xs text-gray-500 capitalize">{task.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">No scheduled activities found.</p>
        </div>
      )}
    </div>
  </div>
));

// Tasks Tab Component
const TasksTab = memo(({ trip }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-gray-800">Trip Tasks</h3>
      <div className="text-sm text-gray-600">
        {trip?.tasks?.filter(t => t.completed).length || 0}/{trip?.tasks?.length || 0} completed
      </div>
    </div>
    
    {trip?.tasks && trip.tasks.length > 0 ? (
      <div>
        {/* Task Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4" role="progressbar" 
          aria-valuenow={trip.tasks.length ? Math.round((trip.tasks.filter(t => t.completed).length / trip.tasks.length) * 100) : 0} 
          aria-valuemin="0" 
          aria-valuemax="100">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ 
              width: `${trip.tasks.length ? Math.round((trip.tasks.filter(t => t.completed).length / trip.tasks.length) * 100) : 0}%` 
            }}
          ></div>
        </div>
        
        {/* Tasks by Category */}
        <div className="space-y-4">
          {/* Group tasks by category */}
          {Object.entries(
            trip.tasks.reduce((categories, task) => {
              const category = task.category || 'other';
              if (!categories[category]) categories[category] = [];
              categories[category].push(task);
              return categories;
            }, {})
          ).map(([category, tasks]) => (
            <div key={category} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium capitalize">{category}</h4>
              <div className="mt-2 space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-start py-1 border-b border-gray-100 last:border-0">
                    <span className={`mt-0.5 mr-2 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} aria-hidden="true">
                      {task.completed ? '✓' : '○'}
                    </span>
                    <div className="flex-1">
                      <p className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.text}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.date && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            {formatDate(task.date)}
                          </span>
                        )}
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority || 'medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No tasks added to this trip.</p>
      </div>
    )}
  </div>
));

// Budget Tab Component
const BudgetTab = memo(({ trip, userSettings, calculateDuration }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Budget</h3>
    
    {/* Budget Overview */}
    <div className="bg-blue-100 p-4 rounded-lg text-center">
      <p className="text-sm text-blue-600">Total Budget</p>
      <p className="text-3xl font-bold text-blue-800">{formatCurrency(trip?.budget, userSettings)}</p>
      <p className="text-sm text-blue-600 mt-1">
        {formatCurrency((trip?.budget || 0) / calculateDuration(trip?.startDate, trip?.endDate), userSettings)} per day
      </p>
    </div>
    
    {/* Budget Breakdown */}
    {trip?.budgetBreakdown ? (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium mb-3">Budget Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(trip.budgetBreakdown).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  category === 'accommodation' ? 'bg-blue-500' :
                  category === 'food' ? 'bg-green-500' :
                  category === 'transportation' ? 'bg-yellow-500' :
                  category === 'activities' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} aria-hidden="true"></div>
                <span className="capitalize">{category}</span>
              </div>
              <span className="font-medium">{formatCurrency(amount, userSettings)}</span>
            </div>
          ))}
          
          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(
              Object.values(trip.budgetBreakdown).reduce((sum, amount) => sum + amount, 0),
              userSettings
            )}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No detailed budget breakdown available.</p>
      </div>
    )}
    
    {/* Expenses */}
    {trip?.expenses && trip.expenses.length > 0 && (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium mb-3">Expenses</h4>
        <div className="space-y-2">
          {trip.expenses.map(expense => (
            <div key={expense.id} className="flex justify-between items-center">
              <div>
                <p>{expense.description}</p>
                <p className="text-xs text-gray-500 capitalize">{expense.category} • {formatDate(expense.date)}</p>
              </div>
              <span className="font-medium">{formatCurrency(expense.amount, userSettings)}</span>
            </div>
          ))}
          
          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
            <span>Total Spent</span>
            <span>{formatCurrency(
              trip.expenses.reduce((sum, expense) => sum + expense.amount, 0),
              userSettings
            )}</span>
          </div>
        </div>
      </div>
    )}
    
    {/* Budget Tips */}
    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <h4 className="font-medium text-yellow-800 mb-1">Budget Tips:</h4>
      <ul className="text-sm text-yellow-800 space-y-1 ml-4" aria-label="Budget tips">
        <li>• Always keep a buffer of 10-15% for unexpected expenses</li>
        <li>• Research local tipping customs before your trip</li>
        <li>• Consider accommodations with kitchens to save on food</li>
      </ul>
    </div>
  </div>
));

// Notes Tab Component
const NotesTab = memo(({ trip }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Notes</h3>
    
    {trip?.notes && trip.notes.length > 0 ? (
      <div className="space-y-3">
        {trip.notes.map(note => (
          <div key={note.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-1">
              <h4 className="font-medium">{note.title}</h4>
              {note.category && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {note.category}
                </span>
              )}
            </div>
            <p className="text-gray-700">{note.text}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No notes added to this trip.</p>
      </div>
    )}
  </div>
));

export default ImprovedMobileOptimizedTripDetails;