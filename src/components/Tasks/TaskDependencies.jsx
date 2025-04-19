import React, { useState } from 'react';

function TaskDependencies({ task, tasks, updateTask }) {
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  
  // Get task dependencies
  const dependencies = task.dependencies || [];
  
  // Get tasks that this task depends on
  const dependsOn = dependencies.map(depId => tasks.find(t => t.id === depId)).filter(Boolean);
  
  // Get tasks that depend on this task
  const dependents = tasks.filter(t => 
    t.dependencies && t.dependencies.includes(task.id)
  );
  
  // Format task for display
  const formatTaskName = (t) => {
    if (!t) return 'Unknown Task';
    
    let name = t.text;
    
    // Truncate if too long
    if (name.length > 30) {
      name = name.substring(0, 27) + '...';
    }
    
    // Add completion status
    return t.completed ? `✓ ${name}` : name;
  };
  
  // Add a dependency
  const addDependency = (dependencyId) => {
    // Create a new array with the new dependency
    const newDependencies = [...dependencies, dependencyId];
    
    // Update the task
    updateTask({
      ...task,
      dependencies: newDependencies
    });
  };
  
  // Remove a dependency
  const removeDependency = (dependencyId) => {
    // Create a new array without the removed dependency
    const newDependencies = dependencies.filter(id => id !== dependencyId);
    
    // Update the task
    updateTask({
      ...task,
      dependencies: newDependencies
    });
  };
  
  // Check if a task is available to be added as a dependency
  const canAddAsDependency = (t) => {
    // Can't depend on itself
    if (t.id === task.id) return false;
    
    // Can't depend on tasks that already depend on this task (would create circular dependencies)
    if (t.dependencies && t.dependencies.includes(task.id)) return false;
    
    // Can't add tasks that are already dependencies
    if (dependencies.includes(t.id)) return false;
    
    return true;
  };
  
  // Get available tasks for adding as dependencies
  const availableTasks = tasks.filter(canAddAsDependency);
  
  return (
    <div>
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Task Dependencies</h4>
        
        {/* Tasks this task depends on */}
        <div className="mb-3">
          <h5 className="text-sm text-gray-500 mb-1">This task depends on:</h5>
          {dependsOn.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No dependencies</p>
          ) : (
            <ul className="space-y-1">
              {dependsOn.map(depTask => (
                <li 
                  key={depTask.id} 
                  className={`flex justify-between items-center text-sm p-2 rounded ${
                    depTask.completed ? 'bg-green-50' : 'bg-yellow-50'
                  }`}
                >
                  <span className={depTask.completed ? 'line-through text-gray-500' : ''}>
                    {formatTaskName(depTask)}
                  </span>
                  <button
                    onClick={() => removeDependency(depTask.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove dependency"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Tasks that depend on this task */}
        {dependents.length > 0 && (
          <div>
            <h5 className="text-sm text-gray-500 mb-1">Tasks that depend on this:</h5>
            <ul className="space-y-1">
              {dependents.map(depTask => (
                <li 
                  key={depTask.id} 
                  className={`text-sm p-2 rounded ${
                    depTask.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {formatTaskName(depTask)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button
        onClick={() => setShowDependencyModal(true)}
        className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
      >
        Manage Dependencies
      </button>
      
      {/* Dependency Management Modal */}
      {showDependencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Manage Dependencies</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Current Dependencies</h4>
              {dependsOn.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No dependencies</p>
              ) : (
                <ul className="space-y-1 mb-3">
                  {dependsOn.map(depTask => (
                    <li 
                      key={depTask.id} 
                      className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                    >
                      <span className={depTask.completed ? 'line-through text-gray-500' : ''}>
                        {formatTaskName(depTask)}
                      </span>
                      <button
                        onClick={() => removeDependency(depTask.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove dependency"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Add Dependencies</h4>
              {availableTasks.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No available tasks to add as dependencies</p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
                  <ul className="divide-y divide-gray-200">
                    {availableTasks.map(availTask => (
                      <li key={availTask.id} className="p-2 hover:bg-gray-50">
                        <button
                          onClick={() => addDependency(availTask.id)}
                          className="flex w-full items-center justify-between"
                        >
                          <span className={`text-sm text-left ${availTask.completed ? 'line-through text-gray-500' : ''}`}>
                            {formatTaskName(availTask)}
                          </span>
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDependencyModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDependencies;