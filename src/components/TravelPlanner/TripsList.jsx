import React from 'react';
import { calculateDuration } from '../../utils/helpers';
import MapView from '../Map/MapView';

function TripsList({ trips, viewTrip, editTrip, deleteTrip, setView, compareTrips }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Trips</h2>
        {trips.length >= 2 && (
          <button
            onClick={compareTrips}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
          >
            <span className="mr-2">⚖️</span> Compare Trips
          </button>
        )}
      </div>
      ) : (
        <div className="space-y-6">
          {/* Map Preview of All Trips */}
          {trips.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold">Your Trip Destinations</h3>
              </div>
              <div className="h-64">
                <MapView 
                  destination={trips[0].destination}
                  transportLocations={trips.map(trip => ({
                    from: trip.destination,
                    to: trip.destination,
                    type: 'Location'
                  }))}
                />
              </div>
            </div>
          )}
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg shadow overflow-hidden hover-card">
                <div className="bg-blue-600 text-white p-3">
                  <h3 className="text-xl font-bold">{trip.destination}</h3>
                </div>
                <div className="p-4">
                  <p className="mb-1"><strong>Dates:</strong> {trip.startDate} to {trip.endDate}</p>
                  <p><strong>Duration:</strong> {calculateDuration(trip.startDate, trip.endDate)} days</p>
                  {trip.budget && <p><strong>Budget:</strong> ${trip.budget}</p>}
                  
                  {trip.info && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p><strong>Local Info:</strong></p>
                      <p className="text-sm">Currency: {trip.info.currency}</p>
                      <p className="text-sm">Emergency: {trip.info.emergency}</p>
                    </div>
                  )}
                  
                  {trip.transports && trip.transports.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>Transportation:</strong> {trip.transports.length} options</p>
                    </div>
                  )}
                  
                  {trip.notes && trip.notes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>Notes:</strong> {trip.notes.length} items</p>
                    </div>
                  )}
                  
                  {trip.photos && trip.photos.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>Photos:</strong> {trip.photos.length} saved</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => viewTrip(trip)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => editTrip(trip)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit Trip
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    </div>
  );
}

export default TripsList;
