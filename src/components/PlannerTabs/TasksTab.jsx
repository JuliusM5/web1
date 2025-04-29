import React, { useState, useEffect } from 'react';
import TaskEditModal from '../Tasks/TaskEditModal';
import TaskReminders from '../Tasks/TaskReminders';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function TasksTab({
  tripTasks,
  setTripTasks,
  startDate,
  endDate
}) {
  // Get i18n functionality
  const { t } = useI18n();
  
  // Task form state
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskCategory, setTaskCategory] = useState('preparation');
  const [taskPriority, setTaskPriority] = useState('medium');
  
  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Task filtering and display options
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'time', or 'created'
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'category', or 'none'
  
  // Set default task date to trip start date if available
  useEffect(() => {
    if (startDate && !taskDate) {
      setTaskDate(startDate);
    }
  }, [startDate, taskDate]);
  
  // Add a new task
  function addTask() {
    if (taskText) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: taskDate || null,
        time: taskTime || null,
        category: taskCategory,
        priority: taskPriority,
        dependencies: [],
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      setTripTasks([...tripTasks, newTask]);
      
      // Reset form fields except category and priority
      setTaskText('');
      setTaskTime('');
      // Keep the same category and priority for quick addition of similar tasks
    }
  }
  
  // Open edit modal for a task
  function openEditModal(task) {
    setEditingTask(task);
    setShowEditModal(true);
  }
  
  // Save edited task
  function saveEditedTask(editedTask) {
    setTripTasks(tripTasks.map(task => 
      task.id === editedTask.id ? editedTask : task
    ));
    setShowEditModal(false);
    setEditingTask(null);
  }
  
  // Close the edit modal
  function closeEditModal() {
    setShowEditModal(false);
    setEditingTask(null);
  }
  
  // Toggle task completion status
  function toggleTaskCompleted(id) {
    // Find the task
    const task = tripTasks.find(t => t.id === id);
    
    // Check if task has dependencies that aren't completed
    if (task && !task.completed && task.dependencies && task.dependencies.length > 0) {
      const dependenciesComplete = task.dependencies.every(depId => {
        const depTask = tripTasks.find(t => t.id === depId);
        return depTask && depTask.completed;
      });
      
      if (!dependenciesComplete) {
        // Don't allow completion if dependencies aren't complete
        alert(t('tasks.dependenciesNotCompleteError'));
        return;
      }
    }
    
    // Toggle completion status
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
    // Check if any tasks depend on this one
    const dependentTasks = tripTasks.filter(task => 
      task.dependencies && task.dependencies.includes(id)
    );
    
    if (dependentTasks.length > 0) {
      // Ask for confirmation
      const confirmDelete = window.confirm(
        t('tasks.deleteTaskWithDependentsConfirmation', { count: dependentTasks.length })
      );
      
      if (!confirmDelete) return;
      
      // Remove the dependency from dependent tasks
      setTripTasks(tripTasks.map(task => {
        if (task.dependencies && task.dependencies.includes(id)) {
          return {
            ...task,
            dependencies: task.dependencies.filter(depId => depId !== id)
          };
        }
        return task;
      }).filter(task => task.id !== id));
    } else {
      // No dependencies, just remove the task
      setTripTasks(tripTasks.filter(task => task.id !== id));
    }
  }
  
  // Filter tasks based on filter settings
  const filteredTasks = tripTasks.filter(task => {
    // Filter by completion status
    if (!showCompleted && task.completed) return false;
    
    // Filter by category
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    
    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    return true;
  });
  
  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        // Sort by date, null dates at the end
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        // If same date, sort by time if available
        if (a.date === b.date) {
          if (!a.time && !b.time) return 0;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        }
        return new Date(a.date) - new Date(b.date);
      
      case 'time':
        // Sort by time, null times at the end
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      
      case 'priority':
        // Sort by priority (high -> medium -> low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      
      case 'created':
        // Sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
        
      default:
        return 0;
    }
  });
  
  // Group tasks if grouping is enabled
  let groupedTasks = sortedTasks;
  
  if (groupBy !== 'none') {
    const grouped = {};
    
    if (groupBy === 'date') {
      // Group by date
      // Add tasks with dates
      sortedTasks.filter(task => task.date).forEach(task => {
        if (!grouped[task.date]) {
          grouped[task.date] = [];
        }
        grouped[task.date].push(task);
      });
      
      // Add undated tasks at the end
      grouped[t('tasks.noDate')] = sortedTasks.filter(task => !task.date);
      
      // Sort date groups chronologically
      groupedTasks = Object.entries(grouped)
        .sort(([dateA], [dateB]) => {
          if (dateA === t('tasks.noDate')) return 1;
          if (dateB === t('tasks.noDate')) return -1;
          return new Date(dateA) - new Date(dateB);
        });
    } else if (groupBy === 'category') {
      // Group by category
      sortedTasks.forEach(task => {
        if (!grouped[task.category]) {
          grouped[task.category] = [];
        }
        grouped[task.category].push(task);
      });
      
      // Convert to array for rendering
      groupedTasks = Object.entries(grouped);
    }
  } else {
    // If no grouping, wrap tasks in a format compatible with the rendering logic
    groupedTasks = [[t('tasks.allTasks'), sortedTasks]];
  }
  
  // Helper to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Helper to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate task statistics
  const totalTasks = tripTasks.length;
  const completedTasks = tripTasks.filter(task => task.completed).length;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  // Check if a task has dependencies and if they're completed
  const getDependencyStatus = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return { hasDependencies: false, allCompleted: true };
    }
    
    const dependenciesComplete = task.dependencies.every(depId => {
      const depTask = tripTasks.find(t => t.id === depId);
      return depTask && depTask.completed;
    });
    
    return { hasDependencies: true, allCompleted: dependenciesComplete };
  };
  
  // Get unique categories from tasks
  const categories = ['all', ...new Set(tripTasks.map(task => task.category))];
  
  // Handle view task from reminders
  const handleViewTaskFromReminder = (task) => {
    openEditModal(task);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Task Form */}
        <div>
          <h3 className="font-semibold mb-3">{t('tasks.addTask')}</h3>
          
          <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('tasks.taskDescription')}</label>
              <input
                type="text"
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                placeholder={t('tasks.whatNeedsToBeDone')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.dueDate')}</label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  min={startDate || ''}
                  max={endDate || ''}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.time')} ({t('tasks.optional')})</label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            {startDate && endDate && (
              <p className="text-xs text-gray-500">
                {t('tasks.tripDates')}: {formatDate(startDate)} {t('tasks.to')} {formatDate(endDate)}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.category')}</label>
                <select
                  value={taskCategory}
                  onChange={e => setTaskCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="preparation">{t('tasks.categories.preparation')}</option>
                  <option value="packing">{t('tasks.categories.packing')}</option>
                  <option value="booking">{t('tasks.categories.booking')}</option>
                  <option value="activity">{t('tasks.categories.activity')}</option>
                  <option value="transportation">{t('tasks.categories.transportation')}</option>
                  <option value="accommodation">{t('tasks.categories.accommodation')}</option>
                  <option value="other">{t('tasks.categories.other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.priority')}</label>
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="high">{t('tasks.priorities.high')}</option>
                  <option value="medium">{t('tasks.priorities.medium')}</option>
                  <option value="low">{t('tasks.priorities.low')}</option>
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
              {t('tasks.addTask')}
            </button>
          </div>
          
          {/* Task statistics */}
          {tripTasks.length > 0 && (
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">{t('tasks.taskProgress')}</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm">{completedTasks} {t('tasks.of')} {totalTasks} {t('tasks.completed')}</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              {/* Task breakdown by category */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="text-sm font-medium text-blue-800 mb-2">{t('tasks.taskBreakdown')}</h5>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {categories.filter(cat => cat !== 'all').map(category => {
                    const categoryTasks = tripTasks.filter(task => task.category === category);
                    const categoryCompleted = categoryTasks.filter(task => task.completed).length;
                    
                    if (categoryTasks.length === 0) return null;
                    
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-xs capitalize">{t(`tasks.categories.${category}`, category)}:</span>
                        <span className="text-xs">
                          {categoryCompleted}/{categoryTasks.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tasks List with Filters */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{t('tasks.yourTasks')}</h3>
            
            {/* Task filters/sort dropdown */}
            <div className="relative">
              <button
                type="button"
                className="text-sm bg-white border border-gray-300 rounded px-3 py-1 flex items-center"
                onClick={() => document.getElementById('task-options').classList.toggle('hidden')}
              >
                <span>{t('tasks.options')}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div id="task-options" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-3 space-y-3">
                  {/* Show/hide completed */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={() => setShowCompleted(!showCompleted)}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('tasks.showCompleted')}</span>
                  </label>
                  
                  {/* Category filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tasks.filterByCategory')}</label>
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="all">{t('tasks.allCategories')}</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category} className="capitalize">
                          {t(`tasks.categories.${category}`, category)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Priority filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tasks.filterByPriority')}</label>
                    <select
                      value={filterPriority}
                      onChange={e => setFilterPriority(e.target.value)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="all">{t('tasks.allPriorities')}</option>
                      <option value="high">{t('tasks.priorities.high')}</option>
                      <option value="medium">{t('tasks.priorities.medium')}</option>
                      <option value="low">{t('tasks.priorities.low')}</option>
                    </select>
                  </div>
                  
                  {/* Sort options */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tasks.sortBy')}</label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="date">{t('tasks.dueDate')}</option>
                      <option value="time">{t('tasks.time')}</option>
                      <option value="priority">{t('tasks.priority')}</option>
                      <option value="created">{t('tasks.recentlyAdded')}</option>
                    </select>
                  </div>
                  
                  {/* Group options */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tasks.groupBy')}</label>
                    <select
                      value={groupBy}
                      onChange={e => setGroupBy(e.target.value)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="date">{t('tasks.date')}</option>
                      <option value="category">{t('tasks.category')}</option>
                      <option value="none">{t('tasks.noGrouping')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">{t('tasks.noTasksMatch')}</p>
              <button
                onClick={() => {
                  setShowCompleted(true);
                  setFilterCategory('all');
                  setFilterPriority('all');
                }}
                className="mt-2 text-blue-500 text-sm"
              >
                {t('tasks.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Grouped tasks */}
              <div className="max-h-[500px] overflow-y-auto">
                {groupedTasks.map(([groupName, tasks]) => (
                  <div key={groupName} className="border-b border-gray-200 last:border-b-0">
                    <div className="bg-gray-100 px-4 py-2 font-medium flex justify-between items-center">
                      {groupBy === 'date' && groupName !== t('tasks.noDate') ? (
                        <span>{formatDate(groupName)}</span>
                      ) : (
                        <span className="capitalize">{t(`tasks.categories.${groupName}`, groupName)}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {tasks.length} {t('tasks.taskCount', { count: tasks.length })}
                      </span>
                    </div>
                    <div>
                      {tasks.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          {t('tasks.noTasksInGroup')}
                        </div>
                      ) : (
                        tasks.map(task => {
                          const { hasDependencies, allCompleted } = getDependencyStatus(task);
                          
                          return (
                            <div 
                              key={task.id} 
                              className={`flex items-start p-3 border-b border-gray-100 last:border-b-0 
                                ${task.completed ? 'bg-gray-50' : ''}`}
                            >
                              <div className="flex-shrink-0 pt-1">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTaskCompleted(task.id)}
                                  className="h-4 w-4"
                                  disabled={!task.completed && hasDependencies && !allCompleted}
                                  title={!task.completed && hasDependencies && !allCompleted ? 
                                    t('tasks.completeDependenciesFirst') : ""}
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <p className={`${task.completed ? 'line-through text-gray-500' : 'font-medium'}`}>
                                    {task.text}
                                  </p>
                                  {hasDependencies && !task.completed && (
                                    <span 
                                      className={`ml-2 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full
                                        ${allCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                      title={allCompleted ? t('tasks.dependenciesComplete') : t('tasks.dependenciesPending')}
                                    >
                                      {allCompleted ? t('tasks.ready') : t('tasks.waiting')}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                  {task.date && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                      {formatDate(task.date)}
                                      {task.time && (
                                        <span className="ml-1">, {task.time}</span>
                                      )}
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded-full flex items-center ${getPriorityColor(task.priority)}`}>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    {t(`tasks.priorities.${task.priority}`, task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 capitalize">
                                    {t(`tasks.categories.${task.category}`, task.category)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-2 flex items-center space-x-1">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="text-gray-400 hover:text-blue-500 p-1"
                                  title={t('tasks.editTask')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                  title={t('tasks.deleteTask')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick tip card */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">{t('tasks.taskPlanningTips')}:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>{t('tasks.tips.packingChecklist')}</li>
              <li>{t('tasks.tips.bookingDeadlines')}</li>
              <li>{t('tasks.tips.prioritySensitive')}</li>
              <li>{t('tasks.tips.useDependencies')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Task Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal 
          task={editingTask}
          tasks={tripTasks}
          onSave={saveEditedTask}
          onCancel={closeEditModal}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      
      {/* Task Reminders */}
      <TaskReminders 
        tasks={tripTasks}
        onViewTask={handleViewTaskFromReminder}
      />
    </div>
  );
}

export default TasksTab;