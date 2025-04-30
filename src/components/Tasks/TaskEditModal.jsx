import React, { useState } from 'react';
import { useI18n } from '../../utils/i18n'; // Add import for i18n
import TaskDependencies from './TaskDependencies';

function TaskEditModal({ task, tasks, onSave, onCancel, startDate, endDate }) {
  const { t } = useI18n(); // Add i18n hook
  const [editedTask, setEditedTask] = useState(task);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'advanced'
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Update edited task
  const updateEditedTask = (updatedTask) => {
    setEditedTask(updatedTask);
  };
  
  // Check if task is complete
  const isComplete = () => {
    // Check if this task is completed
    if (editedTask.completed) return true;
    
    // Not completed - check if it has dependencies
    if (!editedTask.dependencies || editedTask.dependencies.length === 0) {
      return false;
    }
    
    // Check if all dependencies are completed
    const dependenciesComplete = editedTask.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.completed;
    });
    
    return dependenciesComplete;
  };
  
  // Check if task can be completed
  const canComplete = () => {
    // If already completed, it can be uncompleted
    if (editedTask.completed) return true;
    
    // If no dependencies, it can be completed
    if (!editedTask.dependencies || editedTask.dependencies.length === 0) {
      return true;
    }
    
    // Check if all dependencies are completed
    const dependenciesComplete = editedTask.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.completed;
    });
    
    return dependenciesComplete;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {editedTask.completed ? t('tasks.viewTask', 'View Task') : t('tasks.editTask', 'Edit Task')}
        </h3>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('basic')}
          >
            {t('tasks.basicInfo', 'Basic Info')}
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'advanced' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('advanced')}
          >
            {t('tasks.dependencies', 'Dependencies')}
          </button>
        </div>
        
        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('tasks.taskDescription', 'Task Description')}</label>
              <input
                type="text"
                value={editedTask.text}
                onChange={e => setEditedTask({...editedTask, text: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={editedTask.completed}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.dueDate', 'Due Date')}</label>
                <input
                  type="date"
                  value={editedTask.date || ''}
                  onChange={e => setEditedTask({...editedTask, date: e.target.value})}
                  min={startDate || ''}
                  max={endDate || ''}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={editedTask.completed}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.time', 'Time')} ({t('tasks.optional', 'Optional')})</label>
                <input
                  type="time"
                  value={editedTask.time || ''}
                  onChange={e => setEditedTask({...editedTask, time: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={editedTask.completed}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.category', 'Category')}</label>
                <select
                  value={editedTask.category}
                  onChange={e => setEditedTask({...editedTask, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={editedTask.completed}
                >
                  <option value="preparation">{t('tasks.categories.preparation', 'Preparation')}</option>
                  <option value="packing">{t('tasks.categories.packing', 'Packing')}</option>
                  <option value="booking">{t('tasks.categories.booking', 'Booking')}</option>
                  <option value="activity">{t('tasks.categories.activity', 'Activity')}</option>
                  <option value="transportation">{t('tasks.categories.transportation', 'Transportation')}</option>
                  <option value="accommodation">{t('tasks.categories.accommodation', 'Accommodation')}</option>
                  <option value="other">{t('tasks.categories.other', 'Other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('tasks.priority', 'Priority')}</label>
                <select
                  value={editedTask.priority}
                  onChange={e => setEditedTask({...editedTask, priority: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={editedTask.completed}
                >
                  <option value="high">{t('tasks.priorities.high', 'High')}</option>
                  <option value="medium">{t('tasks.priorities.medium', 'Medium')}</option>
                  <option value="low">{t('tasks.priorities.low', 'Low')}</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={editedTask.completed}
                onChange={e => {
                  if (!canComplete() && !editedTask.completed) return;
                  
                  setEditedTask({
                    ...editedTask, 
                    completed: e.target.checked,
                    completedAt: e.target.checked ? new Date().toISOString() : null
                  });
                }}
                className="mr-2"
                disabled={!canComplete() && !editedTask.completed}
              />
              <label className={`text-sm ${!canComplete() && !editedTask.completed ? 'text-gray-400' : 'text-gray-700'}`}>
                {t('tasks.markAsCompleted', 'Mark as completed')}
                {!canComplete() && !editedTask.completed && ` (${t('tasks.completeDependenciesFirst', 'Complete dependencies first')})`}
              </label>
            </div>
            
            {editedTask.completed && editedTask.completedAt && (
              <div className="text-xs text-gray-500 mt-1">
                {t('tasks.completedOn', 'Completed on')}: {formatDate(editedTask.completedAt)}
              </div>
            )}
            
            {editedTask.createdAt && (
              <div className="text-xs text-gray-500">
                {t('tasks.createdOn', 'Created on')}: {formatDate(editedTask.createdAt)}
              </div>
            )}
          </div>
        )}
        
        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <TaskDependencies 
            task={editedTask}
            tasks={tasks}
            updateTask={updateEditedTask}
          />
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            {t('form.cancel', 'Cancel')}
          </button>
          <button
            onClick={() => onSave(editedTask)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editedTask.completed ? t('form.close', 'Close') : t('form.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditModal;