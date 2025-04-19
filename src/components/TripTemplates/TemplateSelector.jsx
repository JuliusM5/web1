// src/components/TripTemplates/TemplateSelector.jsx
import React, { useState, useEffect } from 'react';

function TemplateSelector({ onSelectTemplate, onSkip }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('tripTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // If no templates, allow skipping
      onSkip();
    }
  }, [onSkip]);
  
  // Handle selecting a template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };
  
  // Confirm template selection
  const confirmSelection = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };
  
  // Calculate the total budget of a template
  const calculateTotalBudget = (budgetCategories) => {
    return Object.values(budgetCategories).reduce((sum, val) => sum + val, 0);
  };
  
  // Group templates by type (based on duration)
  const groupedTemplates = templates.reduce((groups, template) => {
    let group = 'other';
    
    if (template.data.duration <= 3) {
      group = 'short';
    } else if (template.data.duration <= 7) {
      group = 'medium';
    } else {
      group = 'long';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(template);
    return groups;
  }, {});
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Start with a Template</h2>
      
      <p className="text-gray-600 mb-6">
        Choose a template to quick-start your trip planning with predefined settings, tasks, and budget allocations.
      </p>
      
      <div className="space-y-6">
        {/* Short Trips */}
        {groupedTemplates.short && groupedTemplates.short.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Short Trips (1-3 days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTemplates.short.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg">{template.name}</h4>
                    {selectedTemplate?.id === template.id && (
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-1 mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{template.data.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">${calculateTotalBudget(template.data.budgetCategories)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tasks</p>
                      <p className="font-medium">{template.data.tasks.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Notes</p>
                      <p className="font-medium">{template.data.notes.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Medium Trips */}
        {groupedTemplates.medium && groupedTemplates.medium.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Medium Trips (4-7 days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTemplates.medium.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg">{template.name}</h4>
                    {selectedTemplate?.id === template.id && (
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-1 mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{template.data.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">${calculateTotalBudget(template.data.budgetCategories)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tasks</p>
                      <p className="font-medium">{template.data.tasks.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Notes</p>
                      <p className="font-medium">{template.data.notes.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Long Trips */}
        {groupedTemplates.long && groupedTemplates.long.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Long Trips (8+ days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTemplates.long.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg">{template.name}</h4>
                    {selectedTemplate?.id === template.id && (
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-1 mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{template.data.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">${calculateTotalBudget(template.data.budgetCategories)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tasks</p>
                      <p className="font-medium">{template.data.tasks.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Notes</p>
                      <p className="font-medium">{template.data.notes.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Other Templates */}
        {groupedTemplates.other && groupedTemplates.other.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Other Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTemplates.other.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <h4 className="font-bold">{template.name}</h4>
                  <p className="text-gray-600 text-sm mt-1 mb-3">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{template.data.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">${calculateTotalBudget(template.data.budgetCategories)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tasks</p>
                      <p className="font-medium">{template.data.tasks.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Notes</p>
                      <p className="font-medium">{template.data.notes.length} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Preview selected template */}
      {selectedTemplate && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-3">Selected Template: {selectedTemplate.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Budget Allocation</h4>
              <div className="space-y-1">
                {Object.entries(selectedTemplate.data.budgetCategories).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-blue-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotalBudget(selectedTemplate.data.budgetCategories)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Included Tasks ({selectedTemplate.data.tasks.length})</h4>
              {selectedTemplate.data.tasks.length > 0 ? (
                <div className="max-h-40 overflow-y-auto pr-2">
                  <ul className="space-y-1">
                    {selectedTemplate.data.tasks.slice(0, 8).map((task, index) => (
                      <li key={index} className="text-sm">
                        • {task.text} 
                        <span className="text-xs ml-1 text-gray-500">
                          ({task.priority} priority)
                        </span>
                      </li>
                    ))}
                    {selectedTemplate.data.tasks.length > 8 && (
                      <li className="text-sm text-gray-500">
                        ...and {selectedTemplate.data.tasks.length - 8} more tasks
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tasks included in this template</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Skip Template
        </button>
        
        <button
          onClick={confirmSelection}
          disabled={!selectedTemplate}
          className={`px-6 py-2 rounded ${
            !selectedTemplate
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Use Selected Template
        </button>
      </div>
    </div>
  );
}

export default TemplateSelector;