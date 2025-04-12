import React, { useState } from 'react';

function TasksTab({
  tripTasks,
  setTripTasks
}) {
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskCategory, setTaskCategory] = useState('preparation');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [showCompleted, setShowCompleted] = useState(true);
  const [groupByDate, setGroupByDate] = useState(true);
  
  // Add a new task
  function addTask() {
    if (taskText) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: taskDate || null,
        category: taskCategory,
        priority: taskPriority,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      setTripTasks([...tripTasks, newTask]);
      setTaskText('');
    }
  }
  
  // Toggle task completion status
  function toggleTaskCompleted(id) {
    setTripTasks(tripTasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  }
  
  // Delete a task
  function deleteTask(id) {
    setTripTasks(tripTasks.filter(task => task.id !== id));
  }
  
  // Filter tasks for display based on completion status
  const filteredTasks = tripTasks.filter(task => showCompleted || !task.completed);
  
  // Helper to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Group tasks by date if needed
  let groupedTasks = filteredTasks;
  if (groupByDate) {
    const grouped = {};
    
    // Add tasks with dates
    filteredTasks.filter(task => task.date).forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    
    // Add undated tasks at the end
    grouped['No Date'] = filteredTasks.filter(task => !task.date);
    
    groupedTasks = Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'No Date') return 1;
        if (dateB === 'No Date') return -1;
        return new Date(dateA) - new Date(dateB);
      });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3">Add Task</h3>
        
        <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Task Description</label>
            <input
              type="text"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Date (Optional)</label>
            <input
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Category</label>
              <select
                value={taskCategory}
                onChange={e => setTaskCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="preparation">Preparation</option>
                <option value="packing">Packing</option>
                <option value="booking">Booking</option>
                <option value="activity">Activity</option>
                <option value="transportation">Transportation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Priority</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={addTask}
            disabled={!taskText}
            className={`w-full py-2 rounded ${
              !taskText
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add Task
          </button>
        </div>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
          <h4 className="font-semibold text-yellow-800">Task Planning Tips:</h4>
          <ul className="mt-1 ml-4 list-disc text-yellow-800">
            <li>Create a packing checklist well before your trip</li>
            <li>Add reminders for important booking deadlines</li>
            <li>Break down your daily itinerary into specific tasks</li>
            <li>Set high priority for time-sensitive items</li>
          </ul>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Your Tasks</h3>
          <div className="flex space-x-3 text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
                className="mr-1"
              />
              Show Completed
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={groupByDate}
                onChange={() => setGroupByDate(!groupByDate)}
                className="mr-1"
              />
              Group by Date
            </label>
          </div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">No tasks added yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {groupByDate ? (
              // Tasks grouped by date
              <div>
                {groupedTasks.map(([date, tasks]) => (
                  <div key={date} className="border-b border-gray-200 last:border-b-0">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      {date === 'No Date' ? 'Anytime' : new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      <span className="ml-2 text-sm text-gray-600">({tasks.length} tasks)</span>
                    </div>
                    <div>
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-start p-3 border-b border-gray-100 last:border-b-0 ${task.completed ? 'bg-gray-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompleted(task.id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.text}
                            </p>
                            <div className="mt-1 flex text-xs space-x-2">
                              <span className={`px-2 py-0.5 rounded-full bg-gray-100 ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Tasks as flat list
              <div>
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-start p-3 border-b border-gray-200 last:border-b-0 ${task.completed ? 'bg-gray-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompleted(task.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.text}
                      </p>
                      <div className="mt-1 flex items-center text-xs space-x-2">
                        {task.date && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            {new Date(task.date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full bg-gray-100 ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {filteredTasks.length > 0 && (
          <div className="mt-3 bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm">
                {tripTasks.filter(task => task.completed).length} of {tripTasks.length} completed
              </span>
              <span className="text-sm font-medium">
                {Math.round((tripTasks.filter(task => task.completed).length / tripTasks.length) * 100)}% Complete
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(tripTasks.filter(task => task.completed).length / tripTasks.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksTab;