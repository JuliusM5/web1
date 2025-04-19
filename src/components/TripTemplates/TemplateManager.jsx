// src/components/TripTemplates/TemplateManager.jsx
import React, { useState, useEffect } from 'react';

function TemplateManager({ trips, onUseTemplate, onClose }) {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState('use'); // 'use' or 'save'
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Load templates from localStorage on component mount
  useEffect(() => {
    const templates = localStorage.getItem('tripTemplates');
    if (templates) {
      setSavedTemplates(JSON.parse(templates));
    } else {
      // If no templates found, add some default templates
      const defaultTemplates = [
        {
          id: 'weekend-getaway',
          name: 'Weekend Getaway',
          description: 'A quick 2-3 day trip with minimal planning, perfect for nearby destinations.',
          createdAt: new Date().toISOString(),
          data: {
            duration: 3,
            budgetCategories: {
              accommodation: 300,
              food: 200,
              transportation: 100,
              activities: 150,
              other: 50
            },
            tasks: [
              { text: 'Book accommodation', category: 'preparation', priority: 'high' },
              { text: 'Plan transportation', category: 'preparation', priority: 'high' },
              { text: 'Pack clothes', category: 'packing', priority: 'medium' },
              { text: 'Check weather forecast', category: 'preparation', priority: 'low' }
            ],
            transports: [],
            notes: [
              { title: 'Packing checklist', text: 'Clothes, toiletries, chargers, medication', category: 'General' }
            ]
          }
        },
        {
          id: 'one-week-vacation',
          name: 'One Week Vacation',
          description: 'A standard 7-day trip with typical vacation activities and budget allocation.',
          createdAt: new Date().toISOString(),
          data: {
            duration: 7,
            budgetCategories: {
              accommodation: 800,
              food: 500,
              transportation: 400,
              activities: 300,
              other: 200
            },
            tasks: [
              { text: 'Research destination', category: 'preparation', priority: 'high' },
              { text: 'Book flights', category: 'booking', priority: 'high' },
              { text: 'Book accommodation', category: 'booking', priority: 'high' },
              { text: 'Plan daily activities', category: 'preparation', priority: 'medium' },
              { text: 'Pack clothes', category: 'packing', priority: 'medium' },
              { text: 'Exchange currency', category: 'preparation', priority: 'medium' },
              { text: 'Check travel documents', category: 'preparation', priority: 'high' }
            ],
            transports: [],
            notes: [
              { title: 'Important documents', text: 'Passport, ID, travel insurance', category: 'General' },
              { title: 'Accommodation details', text: 'Check-in information, address, contact', category: 'Accommodation' }
            ]
          }
        },
        {
          id: 'two-week-international',
          name: 'Two Week International Trip',
          description: 'A comprehensive template for longer international vacations with detailed planning.',
          createdAt: new Date().toISOString(),
          data: {
            duration: 14,
            budgetCategories: {
              accommodation: 1800,
              food: 1000,
              transportation: 1200,
              activities: 800,
              other: 500
            },
            tasks: [
              { text: 'Check passport validity', category: 'preparation', priority: 'high' },
              { text: 'Research visa requirements', category: 'preparation', priority: 'high' },
              { text: 'Book flights', category: 'booking', priority: 'high' },
              { text: 'Book accommodation', category: 'booking', priority: 'high' },
              { text: 'Purchase travel insurance', category: 'preparation', priority: 'high' },
              { text: 'Research local customs and etiquette', category: 'preparation', priority: 'medium' },
              { text: 'Learn basic local phrases', category: 'preparation', priority: 'medium' },
              { text: 'Plan daily activities', category: 'preparation', priority: 'medium' },
              { text: 'Notify bank of travel plans', category: 'preparation', priority: 'medium' },
              { text: 'Arrange for pet/plant care', category: 'preparation', priority: 'medium' },
              { text: 'Pack clothes', category: 'packing', priority: 'medium' },
              { text: 'Pack essential medications', category: 'packing', priority: 'high' }
            ],
            transports: [],
            notes: [
              { title: 'Important documents', text: 'Passport, visa, ID, travel insurance, itinerary', category: 'General' },
              { title: 'Emergency contacts', text: 'Local embassy, insurance hotline, family contact', category: 'General' },
              { title: 'Local transportation', text: 'Research public transport options, taxi services', category: 'Transportation' }
            ]
          }
        },
        {
          id: 'business-trip',
          name: 'Business Trip',
          description: 'A focused template for work-related travel with emphasis on productivity and convenience.',
          createdAt: new Date().toISOString(),
          data: {
            duration: 4,
            budgetCategories: {
              accommodation: 600,
              food: 300,
              transportation: 500,
              activities: 100,
              other: 200
            },
            tasks: [
              { text: 'Book flights', category: 'booking', priority: 'high' },
              { text: 'Book accommodation near meeting location', category: 'booking', priority: 'high' },
              { text: 'Prepare meeting materials', category: 'preparation', priority: 'high' },
              { text: 'Check tech equipment', category: 'preparation', priority: 'high' },
              { text: 'Pack business attire', category: 'packing', priority: 'high' },
              { text: 'Arrange airport transfers', category: 'transportation', priority: 'medium' },
              { text: 'Prepare expense tracking', category: 'preparation', priority: 'medium' }
            ],
            transports: [],
            notes: [
              { title: 'Meeting schedule', text: 'Time, location, attendees, agenda', category: 'General' },
              { title: 'Client/Contact information', text: 'Names, roles, contact details', category: 'General' },
              { title: 'Expense policy', text: 'Reimbursement rules, per diem rates, receipt requirements', category: 'General' }
            ]
          }
        }
      ];
      
      setSavedTemplates(defaultTemplates);
      localStorage.setItem('tripTemplates', JSON.stringify(defaultTemplates));
    }
  }, []);
  
  // Save templates to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tripTemplates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);
  
  // Handle saving a new template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      setSaveError('Please enter a template name');
      return;
    }
    
    if (!selectedTripId) {
      setSaveError('Please select a trip to save as template');
      return;
    }
    
    // Find the selected trip
    const selectedTrip = trips.find(trip => trip.id.toString() === selectedTripId.toString());
    
    if (!selectedTrip) {
      setSaveError('Selected trip not found');
      return;
    }
    
    // Create a new template
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      description: templateDescription.trim() || `Template based on trip to ${selectedTrip.destination}`,
      createdAt: new Date().toISOString(),
      data: {
        // Include only reusable data (not destination-specific)
        duration: calculateDuration(selectedTrip.startDate, selectedTrip.endDate),
        budgetCategories: selectedTrip.budgetBreakdown || {
          accommodation: 0,
          food: 0,
          transportation: 0,
          activities: 0,
          other: 0
        },
        tasks: selectedTrip.tasks || [],
        transports: (selectedTrip.transports || []).map(t => ({
          ...t,
          from: '[From]', // Replace with generic placeholders
          to: '[To]'
        })),
        notes: selectedTrip.notes || [],
        externalServices: (selectedTrip.externalServices || []).map(s => ({
          ...s,
          url: s.type === 'Weather' ? 'weather.service' : 
               s.type === 'Map' ? 'maps.service' : 
               s.type === 'Translation' ? 'translate.service' : 
               'service.url',
        }))
      }
    };
    
    // Add to saved templates
    setSavedTemplates([...savedTemplates, newTemplate]);
    
    // Reset form
    setNewTemplateName('');
    setSelectedTripId('');
    setTemplateDescription('');
    setSaveError('');
  };
  
  // Handle using a template
  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = (templateId) => {
    setSavedTemplates(savedTemplates.filter(template => template.id !== templateId));
  };
  
  // Calculate trip duration helper
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Trip Templates</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Tab navigation */}
        <div className="px-4 border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              className={`py-2 font-medium border-b-2 ${activeTab === 'use' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}
              onClick={() => setActiveTab('use')}
            >
              Use Template
            </button>
            <button
              className={`py-2 font-medium border-b-2 ${activeTab === 'save' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}
              onClick={() => setActiveTab('save')}
            >
              Save as Template
            </button>
          </nav>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4">
          {/* Use Template Tab */}
          {activeTab === 'use' && (
            <div>
              <p className="text-gray-600 mb-4">
                Select a template to start a new trip with predefined settings, tasks, and budget allocations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTemplates.map(template => (
                  <div key={template.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative hover:shadow-md">
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Delete template"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                    
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm"><span className="font-medium">Duration:</span> {template.data.duration} days</div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Budget:</span> $
                        {Object.values(template.data.budgetCategories).reduce((sum, val) => sum + val, 0)}
                      </div>
                      
                      <div className="text-sm"><span className="font-medium">Tasks:</span> {template.data.tasks.length} tasks</div>
                      
                      <div className="text-sm"><span className="font-medium">Notes:</span> {template.data.notes.length} notes</div>
                    </div>
                    
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
              
              {savedTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates saved yet. Create your first template from an existing trip.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Save Template Tab */}
          {activeTab === 'save' && (
            <div>
              <p className="text-gray-600 mb-4">
                Save one of your existing trips as a reusable template.
              </p>
              
              {trips.length === 0 ? (
                <div className="text-center py-8 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700">You need to create a trip before you can save it as a template.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="E.g., Weekend Getaway, Business Trip, Family Vacation"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Template Description</label>
                    <textarea
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      placeholder="Describe what this template is good for"
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Select Trip to Save as Template</label>
                    <select
                      value={selectedTripId}
                      onChange={e => setSelectedTripId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select a trip</option>
                      {trips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {trip.destination} ({trip.startDate} to {trip.endDate})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {saveError && (
                    <div className="text-red-500 text-sm">{saveError}</div>
                  )}
                  
                  {selectedTripId && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Template Preview</h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        The following elements will be saved in your template:
                      </p>
                      
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        <li>Trip duration</li>
                        <li>Budget categories and amounts</li>
                        <li>Task list (with generic descriptions)</li>
                        <li>Notes (with generic content)</li>
                        <li>External service types</li>
                      </ul>
                      
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Note:</strong> Destination-specific information will be generalized.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveTemplate}
                      disabled={!newTemplateName || !selectedTripId}
                      className={`px-4 py-2 rounded ${
                        !newTemplateName || !selectedTripId
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Save as Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateManager;