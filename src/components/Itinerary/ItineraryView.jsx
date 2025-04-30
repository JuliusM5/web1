import React, { useState, useEffect, useMemo } from 'react';
import DynamicCalendar from '../Calendar/DynamicCalendar';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function ItineraryView({ trip, tripTasks = [] }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateEvents, setDateEvents] = useState([]);
  const [dailyItinerary, setDailyItinerary] = useState({});
  
  // Get i18n functionality
  const { t } = useI18n();
  
  // Set selected date to trip start date initially
  useEffect(() => {
    if (trip && trip.startDate && !selectedDate) {
      setSelectedDate(trip.startDate);
    }
  }, [trip, selectedDate]);
  
  // Create a structured daily itinerary from tasks - using useMemo to prevent recreation on every render
  const structuredItinerary = useMemo(() => {
    if (!tripTasks || tripTasks.length === 0) return {};
    
    const itinerary = {};
    
    // Group tasks by date
    tripTasks.forEach(task => {
      if (task.date) {
        if (!itinerary[task.date]) {
          itinerary[task.date] = [];
        }
        itinerary[task.date].push(task);
      }
    });
    
    // Also add trip.transports that have a date property
    if (trip.transports) {
      trip.transports.forEach(transport => {
        if (transport.date) {
          if (!itinerary[transport.date]) {
            itinerary[transport.date] = [];
          }
          itinerary[transport.date].push({
            ...transport,
            text: `${transport.type}: ${transport.from} ${t('itinerary.to', 'to')} ${transport.to}`,
            category: 'transportation'
          });
        }
      });
    }
    
    return itinerary;
  }, [tripTasks, trip.transports, t]); // Only recreate when these dependencies change
  
  // Update itinerary state when the memoized value changes
  useEffect(() => {
    setDailyItinerary(structuredItinerary);
  }, [structuredItinerary]);
  
  // Update events for selected date when either selectedDate or dailyItinerary changes
  useEffect(() => {
    if (selectedDate) {
      setDateEvents(dailyItinerary[selectedDate] || []);
    }
  }, [selectedDate, dailyItinerary]);
  
  // Handle date selection in calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Events will be updated via the useEffect above
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Get browser locale or use 'en-US' as fallback
    const userLocale = navigator.language || 'en-US';
    
    return date.toLocaleDateString(userLocale, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Add missing dates between start and end - memoized to avoid recreation on every render
  const allDates = useMemo(() => {
    if (!trip || !trip.startDate || !trip.endDate) return [];
    
    const dates = [];
    const currentDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [trip?.startDate, trip?.endDate]); // Only recalculate when dates change
  
  // Prepare task events for calendar once - memoized to prevent recreation on every render
  const calendarEvents = useMemo(() => {
    return tripTasks.filter(task => task.date);
  }, [tripTasks]);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{t('itinerary.title', 'Trip Itinerary')}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calendar View */}
        <div>
          <h4 className="font-medium mb-3">{t('itinerary.tripCalendar', 'Trip Calendar')}</h4>
          <DynamicCalendar 
            startDate={trip.startDate} 
            endDate={trip.endDate} 
            events={calendarEvents} // Use memoized events
            onDateClick={handleDateSelect}
            selectedDate={selectedDate} // Pass this explicitly
          />
        </div>
        
        {/* Daily View */}
        <div>
          <h4 className="font-medium mb-3">{t('itinerary.dailySchedule', 'Daily Schedule')}</h4>
          {selectedDate ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                <h5 className="font-medium text-blue-800">
                  {formatDate(selectedDate)}
                </h5>
              </div>
              
              <div className="p-4">
                {dateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {dateEvents
                      .sort((a, b) => {
                        // Sort by time if available, otherwise by priority
                        if (a.time && b.time) return a.time.localeCompare(b.time);
                        
                        // Sort by priority
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
                      })
                      .map(event => (
                        <div 
                          key={event.id} 
                          className={`p-3 rounded-lg ${
                            event.category === 'transportation' ? 'bg-green-50 border border-green-200' :
                            event.completed ? 'bg-gray-50 border border-gray-200' : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div className={event.completed ? 'line-through text-gray-500' : 'font-medium'}>
                              {event.text}
                            </div>
                            {event.time && (
                              <div className="text-sm bg-white px-2 py-0.5 rounded-full">
                                {event.time}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex mt-2 text-xs">
                            <span className="px-2 py-0.5 bg-white rounded-full capitalize">
                              {t(`tasks.categories.${event.category}`, event.category)}
                            </span>
                            {event.priority && (
                              <span className={`ml-2 px-2 py-0.5 rounded-full ${
                                event.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {t(`tasks.priorities.${event.priority}`, event.priority)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('itinerary.noEvents', 'No events scheduled for this day.')}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {t('itinerary.addEventsHint', 'Add tasks or events with this date to see them here.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600">{t('itinerary.selectDatePrompt', 'Select a date on the calendar to view events.')}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Full Itinerary */}
      <div>
        <h4 className="font-medium mb-3">{t('itinerary.completeItinerary', 'Complete Itinerary')}</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {allDates.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {allDates.map(date => (
                <div 
                  key={date} 
                  className={`${selectedDate === date ? 'bg-blue-50' : ''}`}
                >
                  <div 
                    className="px-4 py-3 font-medium flex justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDateSelect(date)}
                  >
                    <span>{formatDate(date)}</span>
                    <span className="text-sm text-gray-500">
                      {dailyItinerary[date]?.length || 0} {t('itinerary.events', 'events')}
                    </span>
                  </div>
                  
                  {selectedDate === date && dailyItinerary[date]?.length > 0 && (
                    <div className="p-3 space-y-2 border-t border-gray-100">
                      {dailyItinerary[date]
                        .sort((a, b) => {
                          // Sort by time if available, otherwise by priority
                          if (a.time && b.time) return a.time.localeCompare(b.time);
                          
                          // Sort by priority
                          const priorityOrder = { high: 0, medium: 1, low: 2 };
                          return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
                        })
                        .map(event => (
                          <div 
                            key={event.id} 
                            className={`p-2 text-sm rounded ${
                              event.category === 'transportation' ? 'bg-green-50' :
                              event.completed ? 'bg-gray-50' : 'bg-blue-50'
                            }`}
                          >
                            <div className="flex justify-between">
                              <span className={event.completed ? 'line-through text-gray-500' : ''}>
                                {event.text}
                              </span>
                              {event.time && (
                                <span className="text-xs bg-white px-1.5 py-0.5 rounded-full">
                                  {event.time}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('itinerary.noItineraryDates', 'No itinerary dates available.')}</p>
              <p className="text-gray-400 text-sm mt-1">
                {t('itinerary.addTripDatesHint', 'Add trip start and end dates to see your itinerary.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItineraryView;