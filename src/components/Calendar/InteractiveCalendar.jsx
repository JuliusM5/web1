import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n'; // Updated import path

function InteractiveCalendar({ 
  startDate, 
  endDate, 
  events = [], 
  onDateClick, 
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent 
}) {
  const { t } = useI18n(); // Add the translation function
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Event creation state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventCategory, setEventCategory] = useState('activity');
  const [eventPriority, setEventPriority] = useState('medium');
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Parse trip dates
  const tripStart = startDate ? new Date(startDate) : null;
  const tripEnd = endDate ? new Date(endDate) : null;
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Jump to trip start month
  const goToTripMonth = () => {
    if (tripStart) {
      setCurrentDate(new Date(tripStart.getFullYear(), tripStart.getMonth(), 1));
    }
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (!day || !day.date) return;
    
    setSelectedDate(day.date);
    
    // Call the parent's onDateClick function if provided
    if (onDateClick) {
      onDateClick(day.date, day.events);
    }
    
    // Show event modal if the date is within the trip
    if (day.isTripDay) {
      setShowEventModal(true);
      setEditingEvent(null);
      // Reset form
      setEventTitle('');
      setEventTime('');
      setEventCategory('activity');
      setEventPriority('medium');
    }
  };
  
  // Open event edit modal
  const openEventEditor = (event, e) => {
    e.stopPropagation(); // Prevent triggering date click
    
    setEditingEvent(event);
    setEventTitle(event.text || event.title || '');
    setEventTime(event.time || '');
    setEventCategory(event.category || 'activity');
    setEventPriority(event.priority || 'medium');
    setShowEventModal(true);
  };
  
  // Handle saving event
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      alert(t('calendar.enterEventTitle')); // Translated alert
      return;
    }
    
    const eventData = {
      id: editingEvent ? editingEvent.id : Date.now(),
      text: eventTitle,
      date: selectedDate,
      time: eventTime,
      category: eventCategory,
      priority: eventPriority
    };
    
    if (editingEvent) {
      // Update existing event
      if (onUpdateEvent) onUpdateEvent({...editingEvent, ...eventData});
    } else {
      // Add new event
      if (onAddEvent) onAddEvent(eventData);
    }
    
    // Reset state and close modal
    setEventTitle('');
    setEventTime('');
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // Handle deleting event
  const handleDeleteEvent = () => {
    if (editingEvent && onDeleteEvent) {
      onDeleteEvent(editingEvent.id);
    }
    
    // Reset state and close modal
    setEventTitle('');
    setEventTime('');
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  // Generate calendar days for the current month
  useEffect(() => {
    // Set current date to trip start month when calendar first loads if tripStart exists
    if (tripStart && !currentMonth) {
      setCurrentDate(new Date(tripStart.getFullYear(), tripStart.getMonth(), 1));
    }
  
    // Update month and year display
    setCurrentMonth(currentDate.toLocaleString('default', { month: 'long' }));
    setCurrentYear(currentDate.getFullYear());
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Array to hold all calendar cells
    const days = [];
    
    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: null,
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isTripDay: false
      });
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const formattedDate = formatDate(date);
      
      // Check if this day is in the trip range
      let isTripDay = false;
      if (tripStart && tripEnd) {
        isTripDay = date >= tripStart && date <= tripEnd;
      }
      
      // Check if this is today
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      
      // Check if there are events for this day
      const dayEvents = events.filter(event => {
        // Account for events with 'date' property and task objects
        const eventDate = event.date || (event.task ? event.task.date : null);
        return eventDate === formattedDate;
      });
      
      days.push({
        day,
        date: formattedDate,
        isCurrentMonth: true,
        isToday,
        isTripDay,
        events: dayEvents,
        isSelected: formattedDate === selectedDate
      });
    }
    
    // Add empty cells for days after the end of the month to complete the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push({
        day: null,
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isTripDay: false
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, startDate, endDate, events, selectedDate, tripStart, tripEnd, currentMonth]);
  
  // Format event title for display
  const formatEventTitle = (event) => {
    const title = event.text || event.title || t('calendar.defaultEventName'); // Translate default name
    if (title.length > 15) {
      return title.substring(0, 12) + '...';
    }
    return title;
  };
  
  // Get priority color class
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Define weekdays for different languages
  const weekdays = [
    t('calendar.sun'), 
    t('calendar.mon'), 
    t('calendar.tue'), 
    t('calendar.wed'), 
    t('calendar.thu'), 
    t('calendar.fri'), 
    t('calendar.sat')
  ];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Calendar header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-medium text-lg">
          {currentMonth} {currentYear}
        </h3>
        <div className="flex space-x-2">
          {tripStart && (
            <button 
              onClick={goToTripMonth}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {t('calendar.tripMonth')}
            </button>
          )}
          <button 
            onClick={prevMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            ◀
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {weekdays.map((day, index) => (
          <div key={index} className="py-2 border-b border-gray-200 font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`
              p-1 h-24 border border-gray-100 relative overflow-hidden
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-300' : ''}
              ${day.isToday ? 'bg-yellow-50' : ''}
              ${day.isTripDay ? 'bg-blue-50' : ''}
              ${day.isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}
              ${day.day === tripStart?.getDate() && currentDate.getMonth() === tripStart?.getMonth() && currentDate.getFullYear() === tripStart?.getFullYear() ? 'border-l-4 border-green-500' : ''}
              ${day.day === tripEnd?.getDate() && currentDate.getMonth() === tripEnd?.getMonth() && currentDate.getFullYear() === tripEnd?.getFullYear() ? 'border-r-4 border-red-500' : ''}
              ${day.date && day.isTripDay ? 'cursor-pointer hover:bg-blue-100' : day.date ? 'cursor-pointer hover:bg-gray-100' : ''}
            `}
            onClick={() => handleDateClick(day)}
          >
            {day.day && (
              <>
                <div className="flex justify-between items-center">
                  <div className={`
                    w-6 h-6 flex items-center justify-center text-sm
                    ${day.events?.length > 0 ? 'font-bold' : ''}
                  `}>
                    {day.day}
                  </div>
                  
                  {day.isTripDay && (
                    <button 
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day.date);
                        setShowEventModal(true);
                        setEditingEvent(null);
                        setEventTitle('');
                        setEventTime('');
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
                
                {/* Events list */}
                <div className="mt-1 space-y-1 max-h-16 overflow-hidden">
                  {day.events?.slice(0, 3).map((event, idx) => (
                    <div 
                      key={idx} 
                      onClick={(e) => openEventEditor(event, e)}
                      className={`text-xs px-1 py-0.5 truncate rounded cursor-pointer text-left ${
                        getPriorityColor(event.priority)
                      } ${event.completed ? 'opacity-60 line-through' : ''}`}
                    >
                      {event.time && <span className="mr-1 font-bold">{event.time.substring(0, 5)}</span>}
                      {formatEventTitle(event)}
                    </div>
                  ))}
                  
                  {day.events?.length > 3 && (
                    <div className="text-xs text-center text-gray-600">
                      +{day.events.length - 3} {t('calendar.more')}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-50 border border-gray-200 mr-1"></div>
            <span>{t('calendar.tripDays')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-l-4 border-green-500 mr-1"></div>
            <span>{t('calendar.startDate')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-r-4 border-red-500 mr-1"></div>
            <span>{t('calendar.endDate')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-red-200 mr-1"></div>
            <span>{t('tasks.priorities.high')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-yellow-200 mr-1"></div>
            <span>{t('tasks.priorities.medium')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-200 mr-1"></div>
            <span>{t('tasks.priorities.low')}</span>
          </div>
        </div>
      </div>
      
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? t('calendar.editEvent') : t('calendar.addEvent')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">{t('calendar.eventTitle')}</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={t('calendar.eventTitlePlaceholder')}
                  className="w-full p-2 border border-gray-300 rounded"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">{t('calendar.date')}</label>
                <input
                  type="date"
                  value={selectedDate}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">{t('calendar.dateChangeHint')}</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">{t('calendar.time')} ({t('form.optional')})</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">{t('calendar.category')}</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="activity">{t('tasks.categories.activity')}</option>
                    <option value="transportation">{t('tasks.categories.transportation')}</option>
                    <option value="accommodation">{t('tasks.categories.accommodation')}</option>
                    <option value="meal">{t('calendar.categories.meal')}</option>
                    <option value="meeting">{t('calendar.categories.meeting')}</option>
                    <option value="tour">{t('calendar.categories.tour')}</option>
                    <option value="other">{t('tasks.categories.other')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">{t('tasks.priority')}</label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="high">{t('tasks.priorities.high')}</option>
                    <option value="medium">{t('tasks.priorities.medium')}</option>
                    <option value="low">{t('tasks.priorities.low')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <div>
                {editingEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    {t('form.delete')}
                  </button>
                )}
              </div>
              
              <div className="space-x-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                >
                  {t('form.cancel')}
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingEvent ? t('form.update') : t('form.add')} {t('calendar.event')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveCalendar;