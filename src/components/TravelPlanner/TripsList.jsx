import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDuration } from '../../utils/helpers';
import { useI18n } from '../../utils/i18n';

function TripsList({ trips, viewTrip, editTrip, deleteTrip, compareTrips, setView, onNewTrip, loadTrips, userSettings }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Local state to ensure we always have the latest trips data
  const [localTrips, setLocalTrips] = useState(trips || []);
  
  // When TripsList first mounts, make sure to check localStorage directly
  useEffect(() => {
    console.log("TripsList - Component mounted, checking localStorage for trips");
    try {
      const savedTrips = localStorage.getItem('travelPlannerTrips');
      if (savedTrips) {
        const parsedTrips = JSON.parse(savedTrips);
        if (parsedTrips && parsedTrips.length > 0) {
          console.log("TripsList - Found trips in localStorage on mount:", parsedTrips);
          setLocalTrips(parsedTrips);
        }
      }
    } catch (error) {
      console.error("Error checking localStorage in TripsList on mount:", error);
    }
  }, []); // Empty dependency array means this runs only once on mount
  
  // Sync local state with props and check localStorage if needed
  useEffect(() => {
    const loadTripsFromStorage = () => {
      try {
        const savedTrips = localStorage.getItem('travelPlannerTrips');
        if (savedTrips) {
          const parsedTrips = JSON.parse(savedTrips);
          if (parsedTrips && parsedTrips.length > 0) {
            console.log("TripsList - Loading trips directly from localStorage:", parsedTrips);
            setLocalTrips(parsedTrips);
            return true; // Successfully loaded trips
          }
        }
        return false; // No trips in localStorage
      } catch (error) {
        console.error("Error loading trips in TripsList:", error);
        return false;
      }
    };
  
    // First check if props has trips
    if (trips && trips.length > 0) {
      console.log("TripsList - Setting localTrips from props:", trips);
      setLocalTrips(trips);
    } else {
      // If not, try to load from localStorage
      loadTripsFromStorage();
      // Don't call loadTrips here anymore - this was causing the infinite loop
      const loaded = loadTripsFromStorage();
      
      // If we still don't have trips and loadTrips is available, call it
      if (!loaded && typeof loadTrips === 'function') {
        console.log("TripsList - No trips found, calling loadTrips");
        loadTrips();
      }
    }
  }, [trips, loadTrips]);
  
  // When this component mounts, ensure trips are loaded
  useEffect(() => {
    if (typeof loadTrips === 'function') {
      console.log("TripsList - Calling loadTrips on mount");
      loadTrips();
    }
  }, [loadTrips]);
  
  // Debugging - log trips when component mounts and when trips change
  useEffect(() => {
    console.log("TripsList rendered with localTrips:", localTrips);
  }, [localTrips]);
  
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
  // Add a flag to prevent endless loadTrips calls
  const [loadTripsAttempted, setLoadTripsAttempted] = useState(false);
  useEffect(() => {
    if (!loadTripsAttempted && typeof loadTrips === 'function') {
      console.log("TripsList - Initial loadTrips call on mount");
      loadTrips();
      setLoadTripsAttempted(true);
    }
  }, [loadTrips, loadTripsAttempted]);
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
  
 // Add to handleDeleteTrip in TripsList.jsx
const handleDeleteTrip = (tripId) => {
  console.log("Delete trip button clicked for ID:", tripId);
  
  if (typeof deleteTrip === 'function') {
    // Add confirmation dialog to prevent accidental deletions
    if (window.confirm(t('trips.confirmDelete', 'Are you sure you want to delete this trip?'))) {
      // Directly update local state
      setLocalTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      
      // Call parent's delete function
      deleteTrip(tripId);
      
      // Force reload from localStorage after a short delay
      setTimeout(() => {
        const savedTrips = localStorage.getItem('travelPlannerTrips');
        if (savedTrips) {
          try {
            const parsedTrips = JSON.parse(savedTrips);
            setLocalTrips(parsedTrips);
          } catch (error) {
            console.error("Error parsing trips after delete:", error);
          }
        } else {
          // If nothing in localStorage, ensure local state is empty
          setLocalTrips([]);
        }
      }, 100);
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
  
  // If localTrips is empty after checking localStorage, then show empty state
  if (!localTrips || localTrips.length === 0) {
    console.log("No trips found in TripsList");
    return (
      <div className="max-w-6xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">{t('trips.myTrips', 'My Trips')}</h2>
          <div>
            <button
              onClick={handleNewTrip}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
            >
              <span className="mr-2">+</span> {t('trips.newTrip', 'New Trip')}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">{t('trips.noTripsYet', 'You haven\'t created any trips yet.')}</p>
          <button
            onClick={handleNewTrip}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {t('trips.createFirstTrip', 'Create Your First Trip')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto pb-24"> {/* Increased bottom padding to avoid mobile nav overlap */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('trips.myTrips', 'My Trips')}</h2>
        <div className="flex space-x-2">
          {localTrips.length >= 2 && (
            <button
              onClick={handleCompareTrips}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">⚖️</span> {t('trips.compareTrips', 'Compare Trips')}
            </button>
          )}
          
          <button
            onClick={handleNewTrip}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">+</span> {t('trips.newTrip', 'New Trip')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localTrips.map(trip => (
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
      
      {/* Mobile-friendly action button - fixed positioning and z-index adjusted */}
      <div className="md:hidden fixed bottom-24 right-4 z-30">
        <button
          onClick={handleNewTrip}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          aria-label={t('trips.newTrip', 'New Trip')}
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