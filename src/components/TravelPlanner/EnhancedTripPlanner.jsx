import React, { useState, useEffect } from 'react';
import Header from '../UI/EnhancedHeader';
import Dashboard from '../Dashboard/Dashboard';
import TripPlanner from './TripPlanner';
import TripsList from './TripsList';
import TripDetails from './TripDetails';
import EnhancedTripComparison from '../TripComparison/EnhancedTripComparison';
import destinations from '../../data/destinations';
import UserSettings from '../Settings/UserSettings';
import TemplateManager from '../TripTemplates/TemplateManager';
import TemplateSelector from '../TripTemplates/TemplateSelector';
import { getUserSettings, applyThemeSettings } from '../../utils/settingsUtils';
import InteractiveCalendar from '../Calendar/InteractiveCalendar';

function EnhancedTripPlanner() {
  // View state
  const [view, setView] = useState('dashboard');
  const [tab, setTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // User settings
  const [userSettings, setUserSettings] = useState(getUserSettings());
  
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

  // Apply theme settings when component mounts
  useEffect(() => {
    applyThemeSettings(userSettings);
  }, [userSettings]);

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
  
  // Handle creating a new trip
  function handleNewTrip() {
    // Reset form state
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
    
    setCurrentTripId(null);
    setEditMode(false);
    
    // Show template selector if we have templates
    const savedTemplates = localStorage.getItem('tripTemplates');
    if (savedTemplates && JSON.parse(savedTemplates).length > 0) {
      setShowTemplateSelector(true);
    } else {
      // No templates, just go to planner
      setView('planner');
      setTab('basic');
    }
  }
  
  // Handle saving settings
  function handleSaveSettings(newSettings) {
    setUserSettings(newSettings);
    applyThemeSettings(newSettings);
  }
  
  // Handle using a template
  function handleUseTemplate(template) {
    // Set trip duration
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + template.data.duration - 1);
    
    setStartDate(startDate);
    setEndDate(endDate.toISOString().split('T')[0]);
    
    // Set budget categories
    setBudgetCategories(template.data.budgetCategories);
    
    // Set total budget
    const totalBudget = Object.values(template.data.budgetCategories).reduce((sum, val) => sum + val, 0);
    setBudget(totalBudget);
    
    // Set tasks
    setTripTasks(template.data.tasks.map(task => ({
      ...task,
      id: Date.now() + Math.floor(Math.random() * 1000),
      completed: false
    })));
    
    // Set notes
    setTripNotes(template.data.notes.map(note => ({
      ...note,
      id: Date.now() + Math.floor(Math.random() * 1000)
    })));
    
    // Set transports
    setTransports(template.data.transports.map(transport => ({
      ...transport,
      id: Date.now() + Math.floor(Math.random() * 1000)
    })));
    
    // Close template selector and show planner
    setShowTemplateSelector(false);
    setView('planner');
    setTab('basic');
  }
  
  // Add a calendar event (task)
  function handleAddCalendarEvent(eventData) {
    const newTask = {
      id: Date.now(),
      text: eventData.text,
      date: eventData.date,
      time: eventData.time,
      category: eventData.category,
      priority: eventData.priority,
      completed: false
    };
    
    setTripTasks([...tripTasks, newTask]);
  }
  
  // Update a calendar event (task)
  function handleUpdateCalendarEvent(eventData) {
    setTripTasks(tripTasks.map(task => 
      task.id === eventData.id ? {...task, ...eventData} : task
    ));
  }
  
  // Delete a calendar event (task)
  function handleDeleteCalendarEvent(eventId) {
    setTripTasks(tripTasks.filter(task => task.id !== eventId));
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Header 
        view={view} 
        setView={setView} 
        onNewTrip={handleNewTrip}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTemplates={() => setShowTemplateManager(true)}
      />
      
      <main className="container mx-auto p-4 mt-6">
        {showComparison && (
          <EnhancedTripComparison 
            trips={trips}
            closeTripComparison={() => setShowComparison(false)}
          />
        )}
        
        {showSettings && (
          <UserSettings 
            onClose={() => setShowSettings(false)}
            onSaveSettings={handleSaveSettings}
          />
        )}
        
        {showTemplateManager && (
          <TemplateManager 
            trips={trips}
            onUseTemplate={handleUseTemplate}
            onClose={() => setShowTemplateManager(false)}
          />
        )}
        
        {showTemplateSelector && (
          <TemplateSelector
            onSelectTemplate={handleUseTemplate}
            onSkip={() => {
              setShowTemplateSelector(false);
              setView('planner');
              setTab('basic');
            }}
          />
        )}
        
        {!showComparison && !showSettings && !showTemplateManager && !showTemplateSelector && view === 'dashboard' && (
          <Dashboard 
            trips={trips}
            viewTrip={viewTrip}
            setView={setView}
            onNewTrip={handleNewTrip}
            userSettings={userSettings}
            calendarComponent={
              <InteractiveCalendar 
                startDate={startDate}
                endDate={endDate}
                events={tripTasks}
                onDateClick={() => {}}
                onAddEvent={handleAddCalendarEvent}
                onUpdateEvent={handleUpdateCalendarEvent}
                onDeleteEvent={handleDeleteCalendarEvent}
              />
            }
          />
        )}
        
        {!showComparison && !showSettings && !showTemplateManager && !showTemplateSelector && view === 'planner' && (
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
            userSettings={userSettings}
          />
        )}
        
        {!showComparison && !showSettings && !showTemplateManager && !showTemplateSelector && view === 'trips' && (
          <TripsList 
            trips={trips}
            viewTrip={viewTrip}
            editTrip={editTrip}
            deleteTrip={deleteTrip}
            setView={setView}
            compareTrips={() => setShowComparison(true)}
            onNewTrip={handleNewTrip}
            userSettings={userSettings}
          />
        )}
        
        {!showComparison && !showSettings && !showTemplateManager && !showTemplateSelector && view === 'tripDetails' && selectedTrip && (
          <TripDetails 
            trip={selectedTrip}
            editTrip={editTrip}
            closeTrip={closeTrip}
            shareEmail={shareEmail}
            setShareEmail={setShareEmail}
            userSettings={userSettings}
          />
        )}
      </main>
      
      {/* Footer with settings shortcut */}
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">TravelEase</h3>
            <p className="text-sm text-gray-400">Plan your trips with ease</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-300 hover:text-white"
            >
              Settings
            </button>
            <button
              onClick={() => setShowTemplateManager(true)}
              className="text-gray-300 hover:text-white"
            >
              Templates
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EnhancedTripPlanner;