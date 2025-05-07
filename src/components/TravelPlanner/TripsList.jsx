// src/components/TravelPlanner/TripsList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDuration } from '../../utils/helpers';
import { useI18n } from '../../utils/i18n';

function TripsList({ trips, viewTrip, editTrip, deleteTrip, compareTrips, setView, onNewTrip }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Ensure the action handlers work properly with proper debugging
  const handleViewTrip = (trip) => {
    console.log("View trip button clicked for:", trip.destination);
    
    if (typeof viewTrip === 'function') {
      viewTrip(trip);
    } else {
      console.error("viewTrip function is not defined");
      
      // Fallback behavior if viewTrip isn't a function
      if (typeof setView === 'function') {
        console.log("Using fallback behavior with setView");
        setView('tripDetails');
      }
    }
  };
  
  const handleEditTrip = (trip) => {
    console.log("Edit trip button clicked for:", trip.destination);
    
    if (typeof editTrip === 'function') {
      editTrip(trip);
    } else {
      console.error("editTrip function is not defined");
      
      // Fallback behavior if editTrip isn't a function
      if (typeof setView === 'function') {
        console.log("Using fallback behavior with setView");
        setView('planner');
      }
    }
  };
  
  const handleDeleteTrip = (tripId) => {
    console.log("Delete trip button clicked for ID:", tripId);
    
    if (typeof deleteTrip === 'function') {
      // Add confirmation dialog to prevent accidental deletions
      if (window.confirm(t('trips.confirmDelete', 'Are you sure you want to delete this trip?'))) {
        deleteTrip(tripId);
      }
    } else {
      console.error("deleteTrip function is not defined");
    }
  };
  
  // Handle Compare Trips button
  const handleCompareTrips = () => {
    console.log("Compare trips button clicked");
    
    if (typeof compareTrips === 'function') {
      compareTrips();
    } else {
      console.error("compareTrips function is not defined");
    }
  };
  
  // Handle New Trip button
  const handleNewTrip = () => {
    console.log("New trip button clicked");
    
    if (typeof onNewTrip === 'function') {
      onNewTrip();
    } else if (typeof setView === 'function') {
      console.log("Using fallback behavior with setView");
      setView('planner');
    } else {
      console.error("Neither onNewTrip nor setView functions are defined");
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('trips.myTrips', 'My Trips')}</h2>
        <div className="flex space-x-2">
          {trips.length >= 2 && (
            <button
              onClick={handleCompareTrips}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">⚖️</span> {t('trips.compareTrips', 'Compare Trips')}
            </button>
          )}
          
        </div>
      </div>
      
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-lg shadow overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-blue-600 text-white p-3">
                <h3 className="text-xl font-bold">{trip.destination}</h3>
              </div>
              <div className="p-4">
                <p className="mb-1"><strong>{t('trips.dates', 'Dates')}:</strong> {trip.startDate} {t('trips.to', 'to')} {trip.endDate}</p>
                <p><strong>{t('trips.duration', 'Duration')}:</strong> {calculateDuration(trip.startDate, trip.endDate)} {t('trips.days', 'days')}</p>
                {trip.budget && <p><strong>{t('trips.budget', 'Budget')}:</strong> ${trip.budget}</p>}
                
                {trip.transports && trip.transports.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><strong>{t('trips.transportation', 'Transportation')}:</strong> {trip.transports.length} {t('trips.options', 'options')}</p>
                  </div>
                )}
                
                {trip.notes && trip.notes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><strong>{t('trips.notes', 'Notes')}:</strong> {trip.notes.length} {t('trips.items', 'items')}</p>
                  </div>
                )}
                
                {trip.photos && trip.photos.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><strong>{t('trips.photos', 'Photos')}:</strong> {trip.photos.length} {t('trips.saved', 'saved')}</p>
                  </div>
                )}
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex-1"
                  >
                    {t('trips.viewDetails', 'View Details')}
                  </button>
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600 transition-colors flex-1"
                  >
                    {t('trips.editTrip', 'Edit Trip')}
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex-1"
                  >
                    {t('trips.delete', 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      
      
      {/* Mobile-friendly action button */}
      <div className="md:hidden fixed bottom-16 right-4">
        <button
          onClick={handleNewTrip}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TripsList;