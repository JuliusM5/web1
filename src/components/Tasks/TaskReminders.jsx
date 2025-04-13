import React, { useState, useEffect } from 'react';

function TaskReminders({ tasks, onViewTask }) {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  
  // Find tasks that are coming up soon (within 24 hours)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);
    
    const upcoming = tasks
      .filter(task => {
        if (!task.date || task.completed) return false;
        
        const taskDate = new Date(task.date);
        if (task.time) {
          const [hours, minutes] = task.time.split(':');
          taskDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
        
        return taskDate > now && taskDate <= tomorrow;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (a.time) {
          const [hoursA, minutesA] = a.time.split(':');
          dateA.setHours(parseInt(hoursA, 10), parseInt(minutesA, 10));
        }
        
        if (b.time) {
          const [hoursB, minutesB] = b.time.split(':');
          dateB.setHours(parseInt(hoursB, 10), parseInt(minutesB, 10));
        }
        
        return dateA - dateB;
      });
    
    setUpcomingTasks(upcoming);
    
    // Show reminders if there are upcoming tasks
    if (upcoming.length > 0) {
      setShowReminders(true);
    }
  }, [tasks]);
  
  // Format the time until a task is due
  const formatTimeUntil = (task) => {
    const now = new Date();
    const taskDate = new Date(task.date);
    
    if (task.time) {
      const [hours, minutes] = task.time.split(':');
      taskDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    } else {
      // If no time is set, use end of day
      taskDate.setHours(23, 59, 59);
    }
    
    const diffMs = taskDate - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs <= 0 && diffMins <= 0) {
      return 'Now';
    } else if (diffHrs < 1) {
      return `${diffMins} min`;
    } else if (diffHrs < 24) {
      return `${diffHrs} hr${diffHrs > 1 ? 's' : ''}`;
    }
    
    return 'Soon';
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };
  
  if (!showReminders || upcomingTasks.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
        <div className="font-semibold">Upcoming Tasks</div>
        <button 
          onClick={() => setShowReminders(false)}
          className="text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {upcomingTasks.map(task => (
          <div 
            key={task.id} 
            className={`p-3 border-l-4 hover:bg-gray-50 cursor-pointer ${getPriorityColor(task.priority)}`}
            onClick={() => onViewTask && onViewTask(task)}
          >
            <div className="flex justify-between">
              <div className="font-medium">{task.text}</div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {formatTimeUntil(task)}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {task.date} {task.time && `at ${task.time}`}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 bg-gray-50 rounded-b-lg text-center text-sm">
        <button className="text-blue-600 hover:text-blue-800" onClick={() => setShowReminders(false)}>
          Dismiss All
        </button>
      </div>
    </div>
  );
}

export default TaskReminders;