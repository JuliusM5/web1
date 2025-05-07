import React, { useEffect } from 'react';
import BasicInfoTab from '../PlannerTabs/BasicInfoTab';
import BudgetTab from '../PlannerTabs/BudgetTab';
import TransportTab from '../PlannerTabs/TransportTab';
import PhotosTab from '../PlannerTabs/PhotosTab';
import NotesTab from '../PlannerTabs/NotesTab';
import TasksTab from '../PlannerTabs/TasksTab';
import ExternalTab from '../PlannerTabs/ExternalTab';
import PackingTab from '../PlannerTabs/PackingTab'; 
import { useI18n } from '../../utils/i18n'; // Import the i18n hook


function TripPlanner({ 
  tab, setTab, editMode, setEditMode, currentTripId, setCurrentTripId,
  destination, setDestination, startDate, setStartDate, endDate, setEndDate,
  budget, setBudget, budgetCategories, setBudgetCategories, 
  tripNotes, setTripNotes, transports, setTransports, photos, setPhotos,
  externalServices, setExternalServices, noteTitle, setNoteTitle, 
  noteText, setNoteText, noteCategory, setNoteCategory, transportType, 
  setTransportType, transportFrom, setTransportFrom, transportTo, setTransportTo,
  transportPrice, setTransportPrice, photoUrl, setPhotoUrl, photoCaption, 
  setPhotoCaption, serviceType, setServiceType, serviceUrl, setServiceUrl, 
  serviceNote, setServiceNote, trips, setTrips, setView, onTripSaved,
  tripTasks, setTripTasks, loadTrips
}) {
  // Use the i18n hook for translations
  const { t } = useI18n();
  
  // Verify trips array is properly initialized
  useEffect(() => {
    console.log("TripPlanner mounted. Trips:", trips);
  }, [trips]);
  
  // Add a new note
  function addNote() {
    if (noteTitle && noteText) {
      setTripNotes([...tripNotes, {
        id: Date.now(),
        title: noteTitle,
        text: noteText,
        category: noteCategory
      }]);
      setNoteTitle('');
      setNoteText('');
    }
  }
  
  // Add a new transportation option
  function addTransport() {
    if (transportType && transportFrom && transportTo) {
      setTransports([...transports, {
        id: Date.now(),
        type: transportType,
        from: transportFrom,
        to: transportTo,
        price: transportPrice
      }]);
      setTransportType('');
      setTransportFrom('');
      setTransportTo('');
      setTransportPrice('');
    }
  }
  
  // Add a new photo
  function addPhoto() {
    if (photoUrl) {
      setPhotos([...photos, {
        id: Date.now(),
        url: photoUrl,
        caption: photoCaption
      }]);
      setPhotoUrl('');
      setPhotoCaption('');
    }
  }
  
  // Add a new external service
  function addExternalService() {
    if (serviceType && serviceUrl) {
      setExternalServices([...externalServices, {
        id: Date.now(),
        type: serviceType,
        url: serviceUrl,
        note: serviceNote
      }]);
      setServiceType('');
      setServiceUrl('');
      setServiceNote('');
    }
  }
  
  // Update budget categories
  function handleBudgetChange(category, value) {
    setBudgetCategories({
      ...budgetCategories,
      [category]: Number(value) || 0
    });
  }
  
  // Improved saveTrip function with better data consistency
  function saveTrip() {
    if (destination && startDate && endDate) {
      const tripData = {
        id: editMode && currentTripId ? currentTripId : Date.now(),
        destination,
        startDate,
        endDate,
        budget,
        budgetBreakdown: {...budgetCategories},
        notes: [...tripNotes],
        tasks: [...tripTasks],
        transports: [...transports],
        photos: [...photos],
        externalServices: [...externalServices],
        created: editMode ? null : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // First read the current trips from localStorage to ensure we're working with the latest data
      let currentTrips = [];
      try {
        const savedTrips = localStorage.getItem('travelPlannerTrips');
        if (savedTrips) {
          currentTrips = JSON.parse(savedTrips);
          console.log("Retrieved current trips from localStorage:", currentTrips);
        }
      } catch (error) {
        console.error("Error reading current trips from localStorage:", error);
      }
      
      // Now update with our new trip
      let updatedTrips;
      if (editMode) {
        // Update existing trip
        updatedTrips = currentTrips.map(trip => trip.id === currentTripId ? tripData : trip);
        console.log("Updating existing trip:", tripData);
      } else {
        // Add new trip
        updatedTrips = [...currentTrips, tripData];
        console.log("Adding new trip:", tripData);
      }
      
      // Set the updated trips in state
      setTrips(updatedTrips);
      
      // Save trips to localStorage directly to ensure they're saved before navigating
      try {
        localStorage.setItem('travelPlannerTrips', JSON.stringify(updatedTrips));
        console.log("Trips saved to localStorage:", updatedTrips);
        
        // Use the callback if provided
        if (typeof onTripSaved === 'function') {
          console.log("Calling onTripSaved callback");
          onTripSaved(tripData, editMode);
        } else {
          // Fallback to direct view change with delay
          console.log("No onTripSaved callback, using fallback view change");
          setTimeout(() => {
            // Load trips before navigation to ensure data consistency
            if (typeof loadTrips === 'function') {
              loadTrips();
            }
            console.log("Switching to trips view");
            setView('trips');
          }, 50);
        }
      } catch (error) {
        console.error("Error saving trips to localStorage:", error);
        // Still try to navigate even if localStorage fails
        if (typeof setView === 'function') {
          setTimeout(() => setView('trips'), 50);
        }
      }
      
      // Reset all state
      setEditMode(false);
      setCurrentTripId(null);
      setDestination('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setBudgetCategories({
        accommodation: 0,
        food: 0,
        transportation: 0,
        activities: 0,
        other: 0
      });
      setTripNotes([]);
      setTripTasks([]);
      setTransports([]);
      setPhotos([]);
      setExternalServices([]);
    }
  }
  
  // Cancel edit mode
  function cancelEdit() {
    setEditMode(false);
    setCurrentTripId(null);
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setBudgetCategories({
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      other: 0
    });
    setTripNotes([]);
    setTripTasks([]);
    setTransports([]);
    setPhotos([]);
    setExternalServices([]);
    setView('trips');
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {editMode ? t('planner.updateTrip', 'Update Trip') : t('planner.saveTrip', 'Save Trip')}
      </h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setTab('basic')}
          className={`px-3 py-1 rounded ${tab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.basicInfo', 'Basic Info')}
        </button>
        <button 
          onClick={() => setTab('budget')}
          className={`px-3 py-1 rounded ${tab === 'budget' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.budget', 'Budget')}
        </button>
        <button 
          onClick={() => setTab('transport')}
          className={`px-3 py-1 rounded ${tab === 'transport' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.transport', 'Transportation')}
        </button>
        <button 
          onClick={() => setTab('photos')}
          className={`px-3 py-1 rounded ${tab === 'photos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.photos', 'Photos')}
        </button>
        <button 
          onClick={() => setTab('tasks')}
          className={`px-3 py-1 rounded ${tab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.tasks', 'Tasks')}
        </button>
        <button 
          onClick={() => setTab('packing')}
          className={`px-3 py-1 rounded ${tab === 'packing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.packing', 'Packing')}
        </button>
        <button 
          onClick={() => setTab('notes')}
          className={`px-3 py-1 rounded ${tab === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.notes', 'Notes')}
        </button>
        <button 
          onClick={() => setTab('external')}
          className={`px-3 py-1 rounded ${tab === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t('planner.external', 'External')}
        </button>
      </div>
      
      {/* Tab Content */}
      {tab === 'basic' && (
        <BasicInfoTab 
          destination={destination}
          setDestination={setDestination}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          budget={budget}
          setBudget={setBudget}
          setTab={setTab}
        />
      )}
      
      {tab === 'budget' && (
        <BudgetTab 
          budgetCategories={budgetCategories}
          handleBudgetChange={handleBudgetChange}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      
      {tab === 'transport' && (
        <TransportTab 
          transportType={transportType}
          setTransportType={setTransportType}
          transportFrom={transportFrom}
          setTransportFrom={setTransportFrom}
          transportTo={transportTo}
          setTransportTo={setTransportTo}
          transportPrice={transportPrice}
          setTransportPrice={setTransportPrice}
          transports={transports}
          setTransports={setTransports}
          addTransport={addTransport}
        />
      )}
      
      {tab === 'photos' && (
        <PhotosTab 
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          photoCaption={photoCaption}
          setPhotoCaption={setPhotoCaption}
          photos={photos}
          setPhotos={setPhotos}
          addPhoto={addPhoto}
        />
      )}
      
      {tab === 'notes' && (
        <NotesTab 
          noteTitle={noteTitle}
          setNoteTitle={setNoteTitle}
          noteText={noteText}
          setNoteText={setNoteText}
          noteCategory={noteCategory}
          setNoteCategory={setNoteCategory}
          tripNotes={tripNotes}
          setTripNotes={setTripNotes}
          addNote={addNote}
        />
      )}
      
      {tab === 'external' && (
        <ExternalTab 
          serviceType={serviceType}
          setServiceType={setServiceType}
          serviceUrl={serviceUrl}
          setServiceUrl={setServiceUrl}
          serviceNote={serviceNote}
          setServiceNote={setServiceNote}
          externalServices={externalServices}
          setExternalServices={setExternalServices}
          addExternalService={addExternalService}
          destination={destination}
        />
      )}

      {tab === 'tasks' && (
        <TasksTab 
          tripTasks={tripTasks}
          setTripTasks={setTripTasks}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      
      {/* New Packing Tab */}
      {tab === 'packing' && (
        <PackingTab
          tripTasks={tripTasks}
          setTripTasks={setTripTasks}
          destination={destination}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    
      {/* Save Trip Button */}
      <div className="mt-6 text-center">
        <button
          onClick={saveTrip}
          disabled={!destination || !startDate || !endDate}
          className={`px-6 py-2 rounded-lg ${
            !destination || !startDate || !endDate
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-md'
          }`}
        >
          {editMode ? t('planner.updateTrip', 'Update Trip') : t('planner.saveTrip', 'Save Trip')}
        </button>
        
        {editMode && (
          <button
            onClick={cancelEdit}
            className="ml-4 px-6 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 shadow-md"
          >
            {t('form.cancel', 'Cancel')}
          </button>
        )}
      </div>
    </div>
  );
}

export default TripPlanner;