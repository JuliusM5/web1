import React, { useState, useEffect, useCallback } from 'react';
import Header from '../UI/Header';
import Dashboard from '../Dashboard/Dashboard';
import TripPlanner from './TripPlanner';
import TripsList from './TripsList';
import TripDetails from './TripDetails';
import EnhancedTripComparison from '../TripComparison/EnhancedTripComparison';
import destinations from '../../data/destinations';
import TemplateManager from '../TripTemplates/TemplateManager';
import TemplateSelector from '../TripTemplates/TemplateSelector';
import { useSettings } from '../../context/SettingsContext';
import InteractiveCalendar from '../Calendar/InteractiveCalendar';
import MobileOptimizedDashboard from '../Dashboard/MobileOptimizedDashboard';
import MobileOptimizedTripDetails from './MobileOptimizedTripDetails';
import { useDeviceDetection } from '../../utils/deviceDetection';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook
import Notification from '../UI/Notification'; // Import the Notification component
import LoadingIndicator from '../UI/LoadingIndicator'; // Import the LoadingIndicator component

function EnhancedTripPlanner({ showSettings, onOpenSettings, onCloseSettings, showHeader = true, view: externalView, setView: setExternalView }) {
  // Get device info for responsive design
  const deviceInfo = useDeviceDetection();
  const isMobile = deviceInfo.isMobile;
  
  // Get i18n functionality
  const { t } = useI18n();
  
  // Get settings from context
  const { settings } = useSettings();
  
  // View state - use internal view state as fallback
  const [internalView, setInternalView] = useState('dashboard');
  
  // Use either the external view state or the internal one
  const view = externalView !== undefined ? externalView : internalView;
  const setView = setExternalView !== undefined ? setExternalView : setInternalView;
  
  const [tab, setTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
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
  
  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  // Helper to show notifications
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({
      visible: true,
      message,
      type
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({...prev, visible: false}));
    }, 3000);
  }, []);

  // Load trips from localStorage on component mount
  useEffect(() => {
    console.log("EnhancedTripPlanner - Loading trips from localStorage");
    const savedTrips = localStorage.getItem('travelPlannerTrips');
    if (savedTrips) {
      try {
        const parsedTrips = JSON.parse(savedTrips);
        console.log("Loaded trips:", parsedTrips);
        setTrips(parsedTrips);
      } catch (error) {
        console.error("Error parsing trips from localStorage:", error);
      }
    }
  }, []);

  // Save trips to localStorage when trips state changes
  useEffect(() => {
    console.log("EnhancedTripPlanner - Saving trips to localStorage:", trips);
    localStorage.setItem('travelPlannerTrips', JSON.stringify(trips));
  }, [trips]);
  
  // Log view changes for debugging
  useEffect(() => {
    console.log("View changed to:", view);
  }, [view]);
  
  // Helper function to get destination info
  function getDestinationInfo() {
    return destinations[destination] || null;
  }
  
  // View trip details - defined as a memoized callback to avoid unnecessary re-renders
  const viewTrip = useCallback((trip) => {
    console.log("viewTrip called in EnhancedTripPlanner for:", trip.destination);
    setSelectedTrip(trip);
    setView('tripDetails');
  }, [setView]);
  
  // Edit trip - defined as a memoized callback
  const editTrip = useCallback((trip) => {
    console.log("editTrip called for:", trip.destination);
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
  }, [setView, setTab]);
  
  // Close trip details
  const closeTrip = useCallback(() => {
    setSelectedTrip(null);
    setView('trips');
  }, [setView]);
  
  // Delete a trip
  const deleteTrip = useCallback((id) => {
    console.log("Deleting trip with ID:", id);
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== id));
    if (selectedTrip && selectedTrip.id === id) {
      setSelectedTrip(null);
      setView('trips');
    }
  }, [selectedTrip, setView]);
  
  // Handle creating a new trip
  const handleNewTrip = useCallback(() => {
    console.log("handleNewTrip called");
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
  }, [setView, setTab]);

  // Compare trips
  const compareTrips = useCallback(() => {
    console.log("compareTrips called");
    setShowComparison(true);
  }, []);
  
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
  
  // Method to handle successful trip saving
  const handleTripSaved = useCallback((trip, isEdit) => {
    // Show loading indicator
    setIsLoading(true);
    setLoadingMessage(`${isEdit ? 'Updating' : 'Saving'} trip to ${trip.destination}...`);
    
    // Short timeout to allow UI to update
    setTimeout(() => {
      // Ensure trips are updated in localStorage
      const savedTrips = localStorage.getItem('travelPlannerTrips');
      if (savedTrips) {
        try {
          const parsedTrips = JSON.parse(savedTrips);
          console.log("Refreshing trips from localStorage after save:", parsedTrips);
          setTrips(parsedTrips);
        } catch (error) {
          console.error("Error parsing trips from localStorage after save:", error);
        }
      }
      
      // Navigate to trips view first
      setView('trips');
      
      // Hide loading after navigation
      setIsLoading(false);
      
      // Show success notification after a slight delay
      setTimeout(() => {
        const actionType = isEdit ? 'updated' : 'created';
        showNotification(`Trip to ${trip.destination} successfully ${actionType}!`, 'success');
      }, 300);
    }, 800); // Short delay for better UX
  }, [showNotification, setView, setIsLoading, setLoadingMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Show loading indicator if isLoading is true */}
      {isLoading && <LoadingIndicator message={loadingMessage} />}
      
      {/* Show notification if visible */}
      {notification.visible && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({...prev, visible: false}))}
        />
      )}
      
      {showHeader && (
        <Header 
          view={view} 
          setView={setView} 
          onNewTrip={handleNewTrip}
          onOpenSettings={onOpenSettings}
          onOpenTemplates={() => setShowTemplateManager(true)}
        />
      )}
      
      <main className="container mx-auto p-4 mt-6">
        {showComparison && (
          <EnhancedTripComparison 
            trips={trips}
            closeTripComparison={() => setShowComparison(false)}
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
        
        {!showComparison && !showTemplateManager && !showTemplateSelector && view === 'dashboard' && (
          isMobile ? (
            <MobileOptimizedDashboard
              trips={trips}
              viewTrip={viewTrip}
              onNewTrip={handleNewTrip}
            />
          ) : (
            <Dashboard 
              trips={trips}
              viewTrip={viewTrip}
              setView={setView}
              onNewTrip={handleNewTrip}
              userSettings={settings}
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
          )
        )}
        
        {!showComparison && !showTemplateManager && !showTemplateSelector && view === 'planner' && (
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
            onTripSaved={handleTripSaved}
            userSettings={settings}
          />
        )}
        
        {!showComparison && !showTemplateManager && !showTemplateSelector && view === 'trips' && (
          <TripsList 
            trips={trips}
            viewTrip={viewTrip}
            editTrip={editTrip}
            deleteTrip={deleteTrip}
            setView={setView}
            compareTrips={compareTrips}
            onNewTrip={handleNewTrip}
            userSettings={settings}
          />
        )}
        
        {!showComparison && !showTemplateManager && !showTemplateSelector && view === 'tripDetails' && (
          isMobile ? (
            selectedTrip ? (
              <MobileOptimizedTripDetails
                trip={selectedTrip}
                editTrip={editTrip}
                closeTrip={closeTrip}
                shareEmail={shareEmail}
                setShareEmail={setShareEmail}
                userSettings={settings}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
                  <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Trip Selected</h2>
                  <p className="text-gray-600 mb-4">Please select a trip to view its details</p>
                  <button
                    onClick={() => setView('trips')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    View All Trips
                  </button>
                </div>
              </div>
            )
          ) : (
            selectedTrip ? (
              <TripDetails 
                trip={selectedTrip}
                editTrip={editTrip}
                closeTrip={closeTrip}
                shareEmail={shareEmail}
                setShareEmail={setShareEmail}
                userSettings={settings}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
                  <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Trip Selected</h2>
                  <p className="text-gray-600 mb-4">Please select a trip to view its details</p>
                  <button
                    onClick={() => setView('trips')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    View All Trips
                  </button>
                </div>
              </div>
            )
          )
        )}
      </main>
      
      {/* Footer with settings shortcut */}
      {!isMobile && (
        <footer className="bg-gray-800 text-white p-4 mt-12">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{t('app.name')}</h3>
              <p className="text-sm text-gray-400">{t('app.tagline')}</p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onOpenSettings}
                className="text-gray-300 hover:text-white"
              >
                {t('nav.settings')}
              </button>
              <button
                onClick={() => setShowTemplateManager(true)}
                className="text-gray-300 hover:text-white"
              >
                {t('nav.templates')}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default EnhancedTripPlanner;