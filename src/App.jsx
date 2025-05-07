// Updated App.jsx with improved routing and view state synchronization
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import Header from './components/UI/Header';
import CheapFlightsDashboard from './components/CheapFlights/CheapFlightsDashboard';
import { SettingsProvider } from './context/SettingsContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './utils/i18n';
import AppSettingsWrapper from './components/UI/AppSettingsWrapper';
import UserSettings from './components/Settings/UserSettings';
import MobileNavigation from './components/UI/MobileNavigation';
import { useDeviceDetection } from './utils/deviceDetection';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import PrivateRoute from './components/Auth/PrivateRoute';
import PremiumFeaturesNotice from './components/CheapFlights/PremiumFeaturesNotice';
import NotificationSettings from './components/Settings/NotificationSettings';

// Import the subscription components with the correct path
import PlanCards from './components/Accessibility/Subscription/PlanCards';
import Checkout from './components/Accessibility/Subscription/Checkout';
import ManageSubscription from './components/Accessibility/Subscription/ManageSubscription';

// Import the TripTemplates component
import TemplateManager from './components/TripTemplates/TemplateManager';

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
        
        {/* Travel Planner routes */}
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
        
        <Route path="/templates" element={
          <TemplateManager 
            trips={[]} 
            onUseTemplate={() => {}}
            onClose={() => window.history.back()}
          />
        } />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes */}
        <Route path="/settings" element={
          <PrivateRoute>
            <UserSettings />
          </PrivateRoute>
        } />
        
        <Route path="/notification-settings" element={
          <PrivateRoute>
            <NotificationSettings />
          </PrivateRoute>
        } />
        
        {/* Subscription routes */}
        <Route path="/subscription/plans" element={
          <PrivateRoute>
            <PlanCards />
          </PrivateRoute>
        } />
        
        <Route path="/subscription/checkout/:planId" element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        } />
        
        <Route path="/subscription/manage" element={
          <PrivateRoute>
            <ManageSubscription />
          </PrivateRoute>
        } />
      </Routes>
      
      {/* Offline indicator */}
      <EnhancedOfflineIndicator />
      
      {/* Premium features notice for free users */}
      <PremiumFeaturesNotice />
      
      {/* Mobile Navigation for small screens */}
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
          <SettingsProvider>
            <I18nProvider>
              <AppSettingsWrapper>
                <AppRoutes />
              </AppSettingsWrapper>
            </I18nProvider>
          </SettingsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;