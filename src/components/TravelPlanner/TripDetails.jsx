import React, { useState } from 'react';
import { calculateDuration, shareTrip, exportTripToPDF, emailTripDetails } from '../../utils/helpers';
import ExpenseTracker from '../ExpenseTracker/ExpenseTracker';
import BudgetChart from '../Budget/BudgetChart';
import DynamicCalendar from '../Calendar/DynamicCalendar';
import ItineraryView from '../Itinerary/ItineraryView';

function TripDetails({ trip, editTrip, closeTrip, shareEmail, setShareEmail }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tripExpenses, setTripExpenses] = useState(trip.expenses || []);
  
  // Update trip expenses (in a real app, this would update the trip in a database)
  const updateTripExpenses = (expenses) => {
    setTripExpenses(expenses);
    // In a full implementation, this would update the parent trip state as well
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{trip.destination}</h2>
            <p className="text-gray-600">
              {trip.startDate} to {trip.endDate} ({calculateDuration(trip.startDate, trip.endDate)} days)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => editTrip(trip)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Edit Trip
            </button>
            <button
              onClick={closeTrip}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Back to Trips
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-2 py-2 px-4 font-medium ${
                activeTab === 'overview' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium ${
                activeTab === 'itinerary' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('itinerary')}
            >
              Itinerary
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium ${
                activeTab === 'tasks' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium ${
                activeTab === 'expenses' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium ${
                activeTab === 'share' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('share')}
            >
              Share
            </button>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Trip Budget */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Budget</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Total Budget</h4>
                    <p className="text-2xl font-bold text-blue-700">${trip.budget}</p>
                    {trip.budgetBreakdown && (
                      <div className="mt-3 space-y-1">
                        <p><span className="font-medium">Accommodation:</span> ${trip.budgetBreakdown.accommodation}</p>
                        <p><span className="font-medium">Food:</span> ${trip.budgetBreakdown.food}</p>
                        <p><span className="font-medium">Transportation:</span> ${trip.budgetBreakdown.transportation}</p>
                        <p><span className="font-medium">Activities:</span> ${trip.budgetBreakdown.activities}</p>
                        <p><span className="font-medium">Other:</span> ${trip.budgetBreakdown.other}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Budget Visualization</h4>
                    <BudgetChart budgetData={trip.budgetBreakdown || {}} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trip Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Transportation Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Transportation</h3>
                {trip.transports && trip.transports.length > 0 ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      {trip.transports.map(t => (
                        <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="font-medium">{t.type}</div>
                          <div className="text-sm">From: {t.from}</div>
                          <div className="text-sm">To: {t.to}</div>
                          {t.price && <div className="text-sm">Price: ${t.price}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500">No transportation options added.</p>
                  </div>
                )}
              </div>
              
              {/* Tasks Section (replacing Local Information) */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Tasks</h3>
                {trip.tasks && trip.tasks.length > 0 ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {trip.tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                          <div className="mr-3">
                            {task.completed ? 
                              <span className="text-green-500">✓</span> : 
                              <span className="text-yellow-500">○</span>}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.text}
                            </div>
                            {task.date && <div className="text-xs text-gray-500">Due: {task.date}</div>}
                          </div>
                        </div>
                      ))}
                      
                      {trip.tasks.length > 5 && (
                        <div className="text-center mt-2">
                          <button 
                            onClick={() => setActiveTab('tasks')}
                            className="text-blue-500 text-sm"
                          >
                            View all {trip.tasks.length} tasks
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500">No tasks added to this trip.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Photos Gallery */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Photo Gallery</h3>
              {trip.photos && trip.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {trip.photos.map(photo => (
                    <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || "Travel inspiration"}
                        className="w-full h-36 object-cover"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                      {photo.caption && (
                        <div className="p-2 text-sm">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No photos added to this trip.</p>
                </div>
              )}
            </div>
            
            {/* Notes Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Notes</h3>
              {trip.notes && trip.notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.notes.map(note => (
                    <div key={note.id} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <div className="font-medium">{note.title}</div>
                        {note.category && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {note.category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1">{note.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No notes added to this trip.</p>
                </div>
              )}
            </div>
            
            {/* External Services */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">External Services</h3>
              {trip.externalServices && trip.externalServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {trip.externalServices.map(service => (
                    <div key={service.id} className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium flex items-center">
                        {service.type === 'Map' && <span className="mr-2">🗺️</span>}
                        {service.type === 'Booking' && <span className="mr-2">🏨</span>}
                        {service.type === 'Weather' && <span className="mr-2">🌤️</span>}
                        {service.type === 'Translation' && <span className="mr-2">🔤</span>}
                        {service.type === 'Advisory' && <span className="mr-2">⚠️</span>}
                        {service.type === 'Other' && <span className="mr-2">🔗</span>}
                        {service.type}
                      </div>
                      
                      <div className="text-sm mt-1">
                        <a 
                          href={service.url.startsWith('http') ? service.url : `https://${service.url}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-words"
                        >
                          {service.url}
                        </a>
                      </div>
                      
                      {service.note && (
                        <div className="text-sm mt-1 text-gray-600">
                          {service.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No external services added to this trip.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <ItineraryView 
            trip={trip}
            tripTasks={trip.tasks || []}
          />
        )}
        
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Tasks</h3>
            
            {(!trip.tasks || trip.tasks.length === 0) ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">No tasks have been added to this trip.</p>
                <button
                  onClick={() => editTrip(trip)}
                  className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add Tasks
                </button>
              </div>
            ) : (
              <div>
                {/* Task Progress */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Overall Progress</h4>
                    <div className="text-right">
                      <span className="font-medium">
                        {trip.tasks.filter(task => task.completed).length} of {trip.tasks.length} tasks complete
                      </span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 rounded-full text-sm">
                        {Math.round((trip.tasks.filter(task => task.completed).length / trip.tasks.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${(trip.tasks.filter(task => task.completed).length / trip.tasks.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Tasks Grouped by Category */}
                <div className="space-y-6">
                  {/* Organize tasks by category */}
                  {Object.entries(
                    trip.tasks.reduce((acc, task) => {
                      if (!acc[task.category]) {
                        acc[task.category] = [];
                      }
                      acc[task.category].push(task);
                      return acc;
                    }, {})
                  ).map(([category, categoryTasks]) => (
                    <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-medium capitalize">
                        {category}
                        <span className="ml-2 text-sm text-gray-600">
                          ({categoryTasks.filter(t => t.completed).length}/{categoryTasks.length} completed)
                        </span>
                      </div>
                      <div>
                        {categoryTasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`flex items-start p-3 border-b border-gray-100 last:border-b-0 ${task.completed ? 'bg-gray-50' : ''}`}
                          >
                            <div className="flex-1">
                              <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.text}
                              </p>
                              <div className="mt-1 flex text-xs space-x-2">
                                {task.date && (
                                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                    {new Date(task.date).toLocaleDateString()}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full bg-gray-100 ${
                                  task.priority === 'high' 
                                    ? 'text-red-600' 
                                    : task.priority === 'medium'
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 flex items-center">
                              {task.completed ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => editTrip(trip)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Manage Tasks
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <ExpenseTracker 
            tripExpenses={tripExpenses}
            updateTripExpenses={updateTripExpenses}
          />
        )}
        
        {/* Share Tab */}
        {activeTab === 'share' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Share Your Trip</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Share via Social Media</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
                  <button
                    onClick={() => shareTrip(trip, 'Facebook')}
                    className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <span className="mr-2">Facebook</span>
                  </button>
                  <button
                    onClick={() => shareTrip(trip, 'Twitter')}
                    className="w-full flex items-center justify-center bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                  >
                    <span className="mr-2">Twitter</span>
                  </button>
                  <button
                    onClick={() => shareTrip(trip, 'WhatsApp')}
                    className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    <span className="mr-2">WhatsApp</span>
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Export Options</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
                  <button
                    onClick={() => exportTripToPDF(trip)}
                    className="w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    <span className="mr-2">Export as PDF</span>
                  </button>
                  
                  <div className="pt-2">
                    <label className="block text-gray-700 mb-2">Email Itinerary</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={e => setShareEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 p-2 border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => emailTripDetails(trip, shareEmail)}
                        disabled={!shareEmail}
                        className={`px-4 py-2 rounded ${
                          !shareEmail
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Collaborate Section */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Collaborate with Travel Companions</h4>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-600 mb-3">
                  Invite others to view and contribute to your trip planning.
                </p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter companion's email"
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    <select className="p-2 border border-gray-300 rounded">
                      <option value="view">Can View</option>
                      <option value="edit">Can Edit</option>
                    </select>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Invite
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium mb-2">Shared With</h5>
                    {/* In a real app, this would show actual collaborators */}
                    <p className="text-gray-500 text-sm italic">No one yet. Invite companions above.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;