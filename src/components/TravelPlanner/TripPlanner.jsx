import React from 'react';
import BasicInfoTab from '../PlannerTabs/BasicInfoTab';
import BudgetTab from '../PlannerTabs/BudgetTab';
import TransportTab from '../PlannerTabs/TransportTab';
import PhotosTab from '../PlannerTabs/PhotosTab';
import NotesTab from '../PlannerTabs/NotesTab';
import TasksTab from '../PlannerTabs/TasksTab';
import ExternalTab from '../PlannerTabs/ExternalTab';


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
  serviceNote, setServiceNote, getDestinationInfo, trips, setTrips, setView,
  tripTasks, setTripTasks
}) {
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
  
  // Save the trip
  function saveTrip() {
    if (destination && startDate && endDate) {
      const tripData = {
        id: editMode && currentTripId ? currentTripId : Date.now(),
        destination,
        startDate,
        endDate,
        notes: [...tripNotes],
        tasks: [...tripTasks],
        transports: [...transports],
        photos: [...photos],
        externalServices: [...externalServices],
        info: getDestinationInfo(),
        created: editMode ? null : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      if (editMode) {
        // Update existing trip
        setTrips(trips.map(trip => trip.id === currentTripId ? tripData : trip));
        setEditMode(false);
        setCurrentTripId(null);
      } else {
        // Add new trip
        setTrips([...trips, tripData]);
      }
      
      // Reset all state
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
      
      // Switch to trips view
      setView('trips');
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
    setTransports([]);
    setPhotos([]);
    setExternalServices([]);
    setView('trips');
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {editMode ? 'Edit Trip' : 'Plan Your Trip'}
      </h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setTab('basic')}
          className={`px-3 py-1 rounded ${tab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Basic Info
        </button>
        <button 
          onClick={() => setTab('budget')}
          className={`px-3 py-1 rounded ${tab === 'budget' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Budget
        </button>
        <button 
          onClick={() => setTab('transport')}
          className={`px-3 py-1 rounded ${tab === 'transport' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Transportation
        </button>
        <button 
          onClick={() => setTab('photos')}
          className={`px-3 py-1 rounded ${tab === 'photos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Photos
        </button>
        <button 
          onClick={() => setTab('tasks')}
          className={`px-3 py-1 rounded ${tab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tasks
        </button>
        <button 
          onClick={() => setTab('notes')}
          className={`px-3 py-1 rounded ${tab === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Notes
        </button>
        <button 
          onClick={() => setTab('external')}
          className={`px-3 py-1 rounded ${tab === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          External
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
          getDestinationInfo={getDestinationInfo}
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
          getDestinationInfo={getDestinationInfo}
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
          {editMode ? 'Update Trip' : 'Save Trip'}
        </button>
        
        {editMode && (
          <button
            onClick={cancelEdit}
            className="ml-4 px-6 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 shadow-md"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default TripPlanner;