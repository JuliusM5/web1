import React, { useState } from 'react';
import { calculateDuration } from '../../utils/helpers';

function MobileOptimizedDashboard({ trips, viewTrip, onNewTrip, userSettings }) {
  const [activeSection, setActiveSection] = useState('upcoming');
  
  // Calculate dashboard statistics
  const totalTrips = trips.length;
  const upcomingTrips = trips.filter(trip => new Date(trip.startDate) > new Date()).length;
  const totalDays = trips.reduce((sum, trip) => sum + calculateDuration(trip.startDate, trip.endDate), 0);
  const totalBudget = trips.reduce((sum, trip) => sum + (Number(trip.budget) || 0), 0);
  
  // Get upcoming trip (if any)
  const upcomingTrip = trips
    .filter(trip => new Date(trip.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  
  // Get most recent trip (if any)
  const recentTrip = trips
    .filter(trip => new Date(trip.endDate) < new Date())
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
  
  // Format date for better display on mobile
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-md mx-auto px-4">
      {/* Quick Action Button */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={onNewTrip}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Create new trip"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
      </div>
      
      <h2 className="text-2xl font-semibold mb-3 text-gray-800">Dashboard</h2>
      
      {/* Stats Cards - 2x2 Grid for Mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-600 text-white rounded-lg p-3 shadow-md">
          <p className="text-sm opacity-90">Trips</p>
          <p className="text-2xl font-bold">{totalTrips}</p>
        </div>
        
        <div className="bg-green-600 text-white rounded-lg p-3 shadow-md">
          <p className="text-sm opacity-90">Upcoming</p>
          <p className="text-2xl font-bold">{upcomingTrips}</p>
        </div>
        
        <div className="bg-purple-600 text-white rounded-lg p-3 shadow-md">
          <p className="text-sm opacity-90">Days</p>
          <p className="text-2xl font-bold">{totalDays}</p>
        </div>
        
        <div className="bg-orange-600 text-white rounded-lg p-3 shadow-md">
          <p className="text-sm opacity-90">Budget</p>
          <p className="text-2xl font-bold">${totalBudget}</p>
        </div>
      </div>
      
      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto hide-scrollbar">
        <button 
          className={`px-4 py-2 whitespace-nowrap ${
            activeSection === 'upcoming' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSection('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`px-4 py-2 whitespace-nowrap ${
            activeSection === 'recent' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSection('recent')}
        >
          Recent
        </button>
        <button 
          className={`px-4 py-2 whitespace-nowrap ${
            activeSection === 'all' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSection('all')}
        >
          All Trips
        </button>
      </div>
      
      {/* Upcoming Trips Section */}
      {activeSection === 'upcoming' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Next Adventure</h3>
          
          {upcomingTrip ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 p-3 text-white">
                <h4 className="text-lg font-bold">{upcomingTrip.destination}</h4>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-y-2 mb-3">
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Start</span>
                    <p className="font-medium">{formatDate(upcomingTrip.startDate)}</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Duration</span>
                    <p className="font-medium">{calculateDuration(upcomingTrip.startDate, upcomingTrip.endDate)} days</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Budget</span>
                    <p className="font-medium">${upcomingTrip.budget}</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Transport</span>
                    <p className="font-medium">{upcomingTrip.transports?.length || 0} items</p>
                  </div>
                </div>
                
                <button
                  onClick={() => viewTrip(upcomingTrip)}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  View Trip Details
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">No upcoming trips planned.</p>
              <button
                onClick={onNewTrip}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Plan a Trip Now
              </button>
            </div>
          )}
          
          {/* Upcoming Trips List */}
          {upcomingTrips > 1 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-800 mb-2">All Upcoming</h4>
              <div className="space-y-3">
                {trips
                  .filter(trip => new Date(trip.startDate) > new Date())
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .slice(0, 5)
                  .map(trip => (
                    <div 
                      key={trip.id} 
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
                      onClick={() => viewTrip(trip)}
                    >
                      <div>
                        <h5 className="font-medium">{trip.destination}</h5>
                        <p className="text-sm text-gray-600">{formatDate(trip.startDate)}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {calculateDuration(trip.startDate, trip.endDate)} days
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Recent Trips Section */}
      {activeSection === 'recent' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Trip</h3>
          
          {recentTrip ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-500 p-3 text-white">
                <h4 className="text-lg font-bold">{recentTrip.destination}</h4>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-y-2 mb-3">
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Dates</span>
                    <p className="font-medium">{formatDate(recentTrip.startDate)} - {formatDate(recentTrip.endDate)}</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Duration</span>
                    <p className="font-medium">{calculateDuration(recentTrip.startDate, recentTrip.endDate)} days</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Budget</span>
                    <p className="font-medium">${recentTrip.budget}</p>
                  </div>
                  <div className="w-1/2">
                    <span className="text-gray-600 text-sm">Transport</span>
                    <p className="font-medium">{recentTrip.transports?.length || 0} items</p>
                  </div>
                </div>
                
                <button
                  onClick={() => viewTrip(recentTrip)}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                >
                  View Trip Details
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No past trips found.</p>
            </div>
          )}
          
          {/* Past Trips List */}
          {trips.filter(trip => new Date(trip.endDate) < new Date()).length > 1 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-800 mb-2">Trip History</h4>
              <div className="space-y-3">
                {trips
                  .filter(trip => new Date(trip.endDate) < new Date())
                  .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
                  .slice(0, 5)
                  .map(trip => (
                    <div 
                      key={trip.id} 
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
                      onClick={() => viewTrip(trip)}
                    >
                      <div>
                        <h5 className="font-medium">{trip.destination}</h5>
                        <p className="text-sm text-gray-600">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                      </div>
                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {calculateDuration(trip.startDate, trip.endDate)} days
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* All Trips Section */}
      {activeSection === 'all' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">All Your Trips</h3>
          
          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .map(trip => {
                  const isUpcoming = new Date(trip.startDate) > new Date();
                  const isPast = new Date(trip.endDate) < new Date();
                  const isActive = !isUpcoming && !isPast;
                  
                  return (
                    <div 
                      key={trip.id} 
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                      onClick={() => viewTrip(trip)}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">{trip.destination}</h5>
                        {isUpcoming && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">Upcoming</span>}
                        {isActive && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">Active</span>}
                        {isPast && <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">Past</span>}
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-600">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                        <p className="text-sm font-medium">{calculateDuration(trip.startDate, trip.endDate)} days</p>
                      </div>
                      {trip.budget && <p className="text-sm text-gray-600 mt-1">Budget: ${trip.budget}</p>}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't planned any trips yet.</p>
              <button
                onClick={onNewTrip}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Plan Your First Trip
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Padding to account for FAB */}
      <div className="h-20"></div>
    </div>
  );
}

export default MobileOptimizedDashboard;