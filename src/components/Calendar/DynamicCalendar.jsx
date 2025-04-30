import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function DynamicCalendar({ startDate, endDate, events = [], onDateClick, selectedDate: externalSelectedDate }) {
  const [currentMonth, setCurrentMonth] = useState('');
  const [calendarDays, setCalendarDays] = useState([]);
  const [internalSelectedDate, setInternalSelectedDate] = useState('');
  
  // Get i18n functionality
  const { t } = useI18n();
  
  // Use externalSelectedDate if provided
  useEffect(() => {
    if (externalSelectedDate) {
      setInternalSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);
  
  // Initialize calendar with trip start date
  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      // Set current month to YYYY-MM format for the calendar
      setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      
      // If there's no selected date yet, use the start date
      if (!internalSelectedDate) {
        setInternalSelectedDate(startDate);
      }
    }
  }, [startDate, internalSelectedDate]);

  // Create calendar days array - using useMemo to prevent recreation on every render
  const generateCalendarDays = useMemo(() => {
    if (!currentMonth) return [];
    
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const startingDayOfWeek = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysInMonth = lastDay.getDate();
    
    // Create an array of calendar days
    const days = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', date: '', isCurrentMonth: false });
    }
    
    // Format start and end dates for comparison
    const tripStartDate = startDate ? new Date(startDate) : null;
    const tripEndDate = endDate ? new Date(endDate) : null;
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this date is within the trip dates
      const inTripRange = tripStartDate && tripEndDate ? 
        (date >= tripStartDate && date <= tripEndDate) : false;
      
      // Find events for this day
      const dayEvents = events.filter(event => event.date === dateString);
      
      days.push({
        day,
        date: dateString,
        isCurrentMonth: true,
        inTripRange,
        hasEvents: dayEvents.length > 0,
        events: dayEvents
      });
    }
    
    return days;
  }, [currentMonth, startDate, endDate, events]);
  
  // Update calendar days when the memoized value changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays);
  }, [generateCalendarDays]);
  
  // Navigate to previous month
  const prevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };
  
  // Format month for display
  const formatMonth = (monthString) => {
    if (!monthString) return '';
    
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1, 1);
    
    // Get browser locale or use 'en-US' as fallback
    const userLocale = navigator.language || 'en-US';
    
    return date.toLocaleDateString(userLocale, { 
      month: 'long', 
      year: 'numeric'
    });
  };
  
  // Handle date click
  const handleDateClick = (date) => {
    if (date && onDateClick) {
      setInternalSelectedDate(date);
      onDateClick(date);
    }
  };
  
  // Weekday names
  const weekdays = useMemo(() => {
    // Get localized weekday names based on user's locale
    const userLocale = navigator.language || 'en-US';
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2023, 0, i + 1); // Jan 1-7, 2023
      return date.toLocaleDateString(userLocale, { weekday: 'short' });
    });
  }, []);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex justify-between items-center bg-blue-50 px-4 py-3 border-b border-gray-200">
        <button
          onClick={prevMonth}
          className="p-1 text-gray-600 hover:text-gray-900"
        >
          ◀
        </button>
        <h3 className="font-medium text-blue-800">
          {formatMonth(currentMonth)}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 text-gray-600 hover:text-gray-900"
        >
          ▶
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-2">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekdays.map((day, index) => (
            <div key={index} className="text-center text-gray-500 text-xs font-medium py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div 
              key={index}
              onClick={() => day.isCurrentMonth ? handleDateClick(day.date) : null}
              className={`
                text-center py-1 ${day.isCurrentMonth ? 'cursor-pointer hover:bg-blue-50' : ''} rounded-md relative
                ${day.inTripRange ? 'bg-blue-50' : ''}
                ${day.date === internalSelectedDate ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <span className={`
                ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${day.date === internalSelectedDate ? 'font-bold text-blue-700' : ''}
              `}>
                {day.day}
              </span>
              
              {/* Event indicator */}
              {day.hasEvents && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center items-center space-x-4 border-t border-gray-200 p-2 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-blue-50 border border-gray-200 rounded-sm mr-1"></div>
          <span>{t('calendar.tripDays', 'Trip Days')}</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-white border border-gray-200 rounded-sm relative mr-1">
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <span>{t('calendar.events', 'Events')}</span>
        </div>
      </div>
    </div>
  );
}

export default DynamicCalendar;