import React, { useState, useEffect } from 'react';

function DynamicCalendar({ startDate, endDate, events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  
  // Parse dates
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
  
  // Generate calendar days for the current month
  useEffect(() => {
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
      const formattedDate = date.toISOString().split('T')[0];
      
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
      const dayEvents = events.filter(event => event.date === formattedDate);
      
      days.push({
        day,
        date: formattedDate,
        isCurrentMonth: true,
        isToday,
        isTripDay,
        events: dayEvents
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
  }, [currentDate, startDate, endDate, events]);
  
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
              Trip Month
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
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
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
              p-2 h-16 sm:h-20 border border-gray-100 relative
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-300' : ''}
              ${day.isToday ? 'bg-yellow-50' : ''}
              ${day.isTripDay ? 'bg-blue-50' : ''}
              ${day.day === tripStart?.getDate() && currentDate.getMonth() === tripStart?.getMonth() ? 'border-l-4 border-green-500' : ''}
              ${day.day === tripEnd?.getDate() && currentDate.getMonth() === tripEnd?.getMonth() ? 'border-r-4 border-red-500' : ''}
            `}
          >
            {day.day && (
              <>
                <div className={`
                  w-6 h-6 mx-auto flex items-center justify-center
                  ${day.events?.length > 0 ? 'bg-blue-500 text-white rounded-full' : ''}
                `}>
                  {day.day}
                </div>
                {day.events?.length > 0 && (
                  <div className="absolute bottom-1 left-0 right-0 text-xs">
                    <div className="mx-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                )}
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
            <span>Trip Days</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-l-4 border-green-500 mr-1"></div>
            <span>Start Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-r-4 border-red-500 mr-1"></div>
            <span>End Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Has Events</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DynamicCalendar;