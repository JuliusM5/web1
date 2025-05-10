// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import Header from './components/UI/Header';
import CheapFlightsDashboard from './components/CheapFlights/CheapFlightsDashboard';
import { SettingsProvider } from './context/SettingsContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { MobileSubscriptionProvider } from './context/MobileSubscriptionContext';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './utils/i18n';
import AppSettingsWrapper from './components/UI/AppSettingsWrapper';
import UserSettings from './components/Settings/UserSettings';
import MobileNavigation from './components/UI/MobileNavigation';
import { useDeviceDetection } from './utils/deviceDetection';
import PremiumFeaturesNotice from './components/CheapFlights/PremiumFeaturesNotice';
import NotificationSettings from './components/Settings/NotificationSettings';
// Initialize error monitoring
import initErrorMonitoring from './utils/errorMonitoring';
// Import the subscription components with the correct path
import PlanCards from './components/Accessibility/Subscription/PlanCards';
import Checkout from './components/Accessibility/Subscription/Checkout';
import ManageSubscription from './components/Accessibility/Subscription/ManageSubscription';
import SubscriptionConfirmation from './components/Accessibility/Subscription/SubscriptionConfirmation';
import SubscriptionSuccess from './components/Subscription/SubscriptionSuccess';
// Import the missing components
import MobileCodeActivation from './components/Subscription/MobileCodeActivation';
import PremiumFeatures from './components/Subscription/PremiumFeatures';
import PremiumFeatureShowcase from './components/Subscription/PremiumFeatureShowcase';
import MockCheckout from './components/Subscription/MockCheckout';
// Import the TripTemplates component
import TemplateManager from './components/TripTemplates/TemplateManager';
// Import Premium Content Guard
import PremiumContentGuard from './components/Subscription/PremiumContentGuard';

// Now initialize error monitoring AFTER all imports
initErrorMonitoring();

// Internal route-based hook for syncing view state
function useViewStateSync(setView) {
  const location = useLocation();
  
  useEffect(() => {
    // Update view state based on current route
    const path = location.pathname;
    if (path === '/') {
      console.log('Setting view to dashboard based on route');
      setView('dashboard');
    } else if (path === '/planner') {
      console.log('Setting view to planner based on route');
      setView('planner');
    } else if (path === '/trips') {
      console.log('Setting view to trips based on route');
      setView('trips');
    } else if (path === '/flights') {
      console.log('Setting view to flights based on route');
      // No need to setView here since flights is handled by a separate component
    }
  }, [location.pathname, setView]);
  
  return location;
}

// App Routes component with state for trip planning
function AppRoutes() {
  const deviceInfo = useDeviceDetection();
  const [showSettings, setShowSettings] = useState(false);
  
  // State for managing views
  const [view, setView] = useState('dashboard');
  
  // Sync view state with current route
  const location = useViewStateSync(setView);
  
  // Sample state for trip count (in a real app, this would come from your data source)
  const [trips, setTrips] = useState([]);
  
  // Log view state changes for debugging
  useEffect(() => {
    console.log("View state changed to:", view);
  }, [view]);
  
  // Handle settings functions
  const handleOpenSettings = () => {
    setShowSettings(true);
  };
  
  const handleCloseSettings = () => {
    setShowSettings(false);
  };
  
  // Trip planner specific functions
  const handleNewTrip = () => {
    console.log("App: Creating new trip");
    setView('planner');
  };
  
  return (
    <div className="App">
      {/* ONLY ONE HEADER - Pass it to the EnhancedTripPlanner with showHeader={false} */}
      <Header 
        view={view} 
        setView={setView} 
        onNewTrip={handleNewTrip}
        onOpenSettings={handleOpenSettings}
      />
      
      <Routes>
        {/* Main app routes */}
        <Route path="/" element={
          <EnhancedTripPlanner 
            showHeader={false}
            view={view}
            setView={setView}
            showSettings={showSettings}
            onOpenSettings={handleOpenSettings}
            onCloseSettings={handleCloseSettings}
          />
        } />
        <Route path="/flights" element={<CheapFlightsDashboard />} />
        
        {/* Plan Trip route - NOT behind premium guard */}
        <Route path="/planner" element={
          <EnhancedTripPlanner 
            showHeader={false}
            view="planner"
            setView={setView}
            showSettings={showSettings}
            onOpenSettings={handleOpenSettings}
            onCloseSettings={handleCloseSettings}
          />
        } />
        
        {/* My Trips route - No longer behind premium guard */}
        <Route path="/trips" element={
          <EnhancedTripPlanner 
            showHeader={false}
            view="trips"
            setView={setView}
            showSettings={showSettings}
            onOpenSettings={handleOpenSettings}
            onCloseSettings={handleCloseSettings}
          />
        } />
        
        {/* Templates route - Behind premium guard */}
        <Route path="/templates" element={
          <PremiumContentGuard>
            <TemplateManager 
              trips={[]} 
              onUseTemplate={() => {}}
              onClose={() => window.history.back()}
            />
          </PremiumContentGuard>
        } />
        
        {/* Subscription routes */}
        <Route path="/subscription/plans" element={<PlanCards />} />
        <Route path="/subscription/checkout/:planId" element={<Checkout />} />
        <Route path="/subscription/manage" element={<ManageSubscription />} />
        <Route path="/subscription/confirm" element={<SubscriptionConfirmation />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/activate-code" element={<MobileCodeActivation />} />
        <Route path="/premium-features" element={<PremiumFeatures />} />
        <Route path="/premium-features/:featureId" element={<PremiumFeatureShowcase />} />
        <Route path="/mock-checkout" element={<MockCheckout />} />
        
        {/* Settings routes */}
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
      </Routes>
      
      {/* Rest of the component remains the same */}
      <EnhancedOfflineIndicator />
      <PremiumFeaturesNotice />
      {deviceInfo.isMobile && (
        <MobileNavigation 
          view={view}
          setView={setView}
          onNewTrip={handleNewTrip}
          onOpenSettings={handleOpenSettings}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <MobileSubscriptionProvider>
            <SettingsProvider>
              <I18nProvider>
                <AppSettingsWrapper>
                  <AppRoutes />
                </AppSettingsWrapper>
              </I18nProvider>
            </SettingsProvider>
          </MobileSubscriptionProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;