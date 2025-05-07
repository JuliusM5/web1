import React, { useState } from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import Header from './components/UI/Header';
// Import the CheapFlightsDashboard component
import CheapFlightsDashboard from './components/CheapFlights/CheapFlightsDashboard';
import { SettingsProvider } from './context/SettingsContext';
import { SubscriptionProvider } from './context/SubscriptionContext'; // Add this import
import { AuthProvider } from './context/AuthContext'; // Add this import
import { I18nProvider } from './utils/i18n';
import AppSettingsWrapper from './components/UI/AppSettingsWrapper';
import UserSettings from './components/Settings/UserSettings';
import MobileNavigation from './components/UI/MobileNavigation';
import { useDeviceDetection } from './utils/deviceDetection';

function App() {
  // Add the state variable for the current view
  const [view, setView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const deviceInfo = useDeviceDetection();

  // Handler for creating a new trip
  const handleNewTrip = () => {
    setView('planner');
  };

  // Handler for opening settings
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // Handler for closing settings
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Handler for opening templates
  const handleOpenTemplates = () => {
    // Handle templates functionality here
  };

  return (
    <AuthProvider>  {/* Add AuthProvider */}
      <SubscriptionProvider>  {/* Add SubscriptionProvider */}
        <SettingsProvider>
          <I18nProvider>
            <AppSettingsWrapper>
              <div className="App">
                {/* Pass the view state and setView function to Header */}
                <Header 
                  view={view} 
                  setView={setView} 
                  onNewTrip={handleNewTrip}
                  onOpenSettings={handleOpenSettings}
                  onOpenTemplates={handleOpenTemplates}
                />
                
                {/* Always render EnhancedTripPlanner but only make it visible for relevant views */}
                {(view === 'dashboard' || view === 'planner' || view === 'trips' || view === 'tripDetails') && (
                  <EnhancedTripPlanner 
                    showSettings={showSettings}
                    onOpenSettings={handleOpenSettings}
                    onCloseSettings={handleCloseSettings}
                    showHeader={false}
                    view={view}
                    setView={setView}
                  />
                )}
                
                {/* Show CheapFlightsDashboard when view is 'flights' or 'cheapFlights' */}
                {(view === 'flights' || view === 'cheapFlights') && (
                  <CheapFlightsDashboard />
                )}
                
                {/* Settings Modal */}
                {showSettings && (
                  <UserSettings onClose={handleCloseSettings} />
                )}
                
                {/* Offline Indicator */}
                <EnhancedOfflineIndicator />
                
                {/* Mobile Navigation for small screens */}
                {deviceInfo.isMobile && (
                  <MobileNavigation 
                    view={view}
                    setView={setView}
                    onNewTrip={handleNewTrip}
                    onOpenSettings={handleOpenSettings}
                    onOpenTemplates={handleOpenTemplates}
                  />
                )}
              </div>
            </AppSettingsWrapper>
          </I18nProvider>
        </SettingsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;