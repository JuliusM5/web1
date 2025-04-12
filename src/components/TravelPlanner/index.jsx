import React, { useState, useEffect } from 'react';
import Header from '../UI/Header';
import Dashboard from '../Dashboard/Dashboard';
import TripPlanner from './TripPlanner';
import TripsList from './TripsList';
import TripDetails from './TripDetails';
import TripComparison from '../TripComparison/TripComparison';
import destinations from '../../data/destinations';

function TravelPlanner() {
  // View state
  const [view, setView] = useState('dashboard'); // Changed default view to dashboard
  const [tab, setTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  
  // Collection state
  const [trips, setTrips] = useState([]);
  const [tripNotes, setTripNotes] = useState([]);
  const [tripTasks, setTripTasks] = useState([]);
  const [transports, setTransports] = useState([]);
  const [photos, setPhotos] = useState([]);
  
  // Basic trip info
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  
  // Form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('Restaurant');
  
  const [transportType, setTransportType] = useState('');
  const [transportFrom, setTransportFrom] = useState('');
  const [transportTo, setTransportTo] = useState('');
  const [transportPrice, setTransportPrice] = useState('');
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  
  // External services state
  const [externalServices, setExternalServices] = useState([]);
  const [serviceType, setServiceType] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  
  // Sharing state
  const [shareEmail, setShareEmail] = useState('');
  
  // Budget state
  const [budgetCategories, setBudgetCategories] = useState({
    accommodation: 0,
    food: 0,
    transportation: 0,
    activities: 0,
    other: 0
  });
  
  // Selected trip for viewing/editing
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Load trips from localStorage on component mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('travelPlannerTrips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  // Save trips to localStorage when trips state changes
  useEffect(() => {
    localStorage.setItem('travelPlannerTrips', JSON.stringify(trips));
  }, [trips]);
  
  // Helper function to get destination info
  function getDestinationInfo() {
    return destinations[destination] || null;
  }
  
  // View trip details
  function viewTrip(trip) {
    setSelectedTrip(trip);
    setView('tripDetails');
  }
  
  // Edit trip
  function editTrip(trip) {
    // Load trip data into form
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setBudget(trip.budget);
    if (trip.budgetBreakdown) {
      setBudgetCategories(trip.budgetBreakdown);
    }
    setTripNotes(trip.notes || []);
    setTripTasks(trip.tasks || []);
    setTransports(trip.transports || []);
    setPhotos(trip.photos || []);
    setExternalServices(trip.externalServices || []);
    
    setCurrentTripId(trip.id);
    setEditMode(true);
    setView('planner');
    setTab('basic');
  }
  
  // Close trip details
  function closeTrip() {
    setSelectedTrip(null);
    setView('trips');
  }
  
  // Delete a trip
  function deleteTrip(id) {
    setTrips(trips.filter(trip => trip.id !== id));
    if (selectedTrip && selectedTrip.id === id) {
      setSelectedTrip(null);
      setView('trips');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Header view={view} setView={setView} />
      
      <main className="container mx-auto p-4 mt-6">
        {showComparison && (
          <TripComparison 
            trips={trips}
            closeTripComparison={() => setShowComparison(false)}
          />
        )}
        
        {!showComparison && view === 'dashboard' && (
          <Dashboard 
          trips={trips}
          viewTrip={viewTrip}
          setView={setView}
        />
        )}
        
        {view === 'planner' && (
          <TripPlanner 
            tab={tab}
            setTab={setTab}
            editMode={editMode}
            setEditMode={setEditMode}
            currentTripId={currentTripId}
            setCurrentTripId={setCurrentTripId}
            destination={destination}
            setDestination={setDestination}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            budget={budget}
            setBudget={setBudget}
            budgetCategories={budgetCategories}
            setBudgetCategories={setBudgetCategories}
            tripNotes={tripNotes}
            setTripNotes={setTripNotes}
            tripTasks={tripTasks}
            setTripTasks={setTripTasks}
            transports={transports}
            setTransports={setTransports}
            photos={photos}
            setPhotos={setPhotos}
            externalServices={externalServices}
            setExternalServices={setExternalServices}
            noteTitle={noteTitle}
            setNoteTitle={setNoteTitle}
            noteText={noteText}
            setNoteText={setNoteText}
            noteCategory={noteCategory}
            setNoteCategory={setNoteCategory}
            transportType={transportType}
            setTransportType={setTransportType}
            transportFrom={transportFrom}
            setTransportFrom={setTransportFrom}
            transportTo={transportTo}
            setTransportTo={setTransportTo}
            transportPrice={transportPrice}
            setTransportPrice={setTransportPrice}
            photoUrl={photoUrl}
            setPhotoUrl={setPhotoUrl}
            photoCaption={photoCaption}
            setPhotoCaption={setPhotoCaption}
            serviceType={serviceType}
            setServiceType={setServiceType}
            serviceUrl={serviceUrl}
            setServiceUrl={setServiceUrl}
            serviceNote={serviceNote}
            setServiceNote={setServiceNote}
            getDestinationInfo={getDestinationInfo}
            trips={trips}
            setTrips={setTrips}
            setView={setView}
          />
        )}
        
        {!showComparison && view === 'trips' && (
          <TripsList 
            trips={trips}
            viewTrip={viewTrip}
            editTrip={editTrip}
            deleteTrip={deleteTrip}
            setView={setView}
            compareTrips={() => setShowComparison(true)}
          />
        )}
        
        {!showComparison && view === 'tripDetails' && selectedTrip && (
          <TripDetails 
            trip={selectedTrip}
            editTrip={editTrip}
            closeTrip={closeTrip}
            shareEmail={shareEmail}
            setShareEmail={setShareEmail}
          />
        )}
      </main>
    </div>
  );
}

export default TravelPlanner;