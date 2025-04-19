import React from 'react';
import { calculateDuration } from '../../utils/helpers';

function Dashboard({ trips, viewTrip, setView }) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold">Total Trips</h3>
          <p className="text-3xl font-bold mt-2">{totalTrips}</p>
        </div>
        
        <div className="bg-green-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold">Upcoming</h3>
          <p className="text-3xl font-bold mt-2">{upcomingTrips}</p>
        </div>
        
        <div className="bg-purple-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold">Days Traveled</h3>
          <p className="text-3xl font-bold mt-2">{totalDays}</p>
        </div>
        
        <div className="bg-orange-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold">Budget Total</h3>
          <p className="text-3xl font-bold mt-2">${totalBudget}</p>
        </div>
      </div>
      
      {/* Upcoming Trip */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Next Adventure</h3>
        
        {upcomingTrip ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 p-3 text-white">
              <h4 className="text-lg font-bold">{upcomingTrip.destination}</h4>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-gray-600">Start Date:</span> {upcomingTrip.startDate}
                </div>
                <div>
                  <span className="text-gray-600">Days:</span> {calculateDuration(upcomingTrip.startDate, upcomingTrip.endDate)}
                </div>
              </div>
              
              <div className="flex justify-between mb-3">
                <div>
                  <span className="text-gray-600">Budget:</span> ${upcomingTrip.budget}
                </div>
                <div>
                  <span className="text-gray-600">Transportation:</span> {upcomingTrip.transports?.length || 0} items
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
                onClick={() => setView('planner')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Plan a Trip Now
              </button>
          </div>
        )}
      </div>
      
      {/* Trip Timeline */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Travel Timeline</h3>
        
        {trips.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute top-0 bottom-0 left-5 w-1 bg-blue-200"></div>
              
              {/* Timeline items */}
              <div className="space-y-6">
                {trips
                  .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                  .map(trip => (
                    <div key={trip.id} className="flex">
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                          <span>✈️</span>
                        </div>
                      </div>
                      <div className="ml-4 -mt-2">
                        <div 
                          className="cursor-pointer"
                          onClick={() => viewTrip(trip)}
                        >
                          <h4 className="text-lg font-bold text-blue-600">{trip.destination}</h4>
                          <p className="text-gray-600">{trip.startDate} to {trip.endDate}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {calculateDuration(trip.startDate, trip.endDate)} days
                            {trip.budget ? ` · $${trip.budget} budget` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Your travel timeline will appear here once you plan trips.</p>
          </div>
        )}
      </div>
      
      {/* Travel Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Travel Statistics</h3>
        
        {trips.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Top Destinations</h4>
                <div className="space-y-2">
                  {/* In a real app, this would display destinations by frequency */}
                  {Array.from(new Set(trips.map(trip => trip.destination)))
                    .slice(0, 5)
                    .map((destination, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {index + 1}
                        </div>
                        <span className="ml-3">{destination}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Budget by Category</h4>
                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-center">
                    Budget breakdown chart would appear here<br />
                    <span className="text-sm">Showing allocation across categories</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Your travel statistics will appear here once you plan trips.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;