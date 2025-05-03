import React, { useState } from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import { SettingsProvider } from './context/SettingsContext';
import { I18nProvider } from './utils/i18n';
import AppSettingsWrapper from './components/UI/AppSettingsWrapper';
import UserSettings from './components/Settings/UserSettings';
import MobileNavigation from './components/UI/MobileNavigation';
import { useDeviceDetection } from './utils/deviceDetection';
import FlightSearch from './components/FlightSearch/FlightSearch';
import Header from './components/UI/Header';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const deviceInfo = useDeviceDetection();

  const handleNewTrip = () => {
    setCurrentView('planner');
  };

  return (
    <SettingsProvider>
      <I18nProvider>
        <AppSettingsWrapper>
          <div className="App">
            {/* Single Header with navigation */}
            <Header
              view={currentView}
              setView={setCurrentView}
              onNewTrip={handleNewTrip}
              onOpenSettings={() => setShowSettings(true)}
              onOpenTemplates={() => {/* Handle templates */}}
            />
            
            {/* Main Content based on current view */}
            {currentView === 'flights' ? (
              <FlightSearch />
            ) : (
              <EnhancedTripPlanner 
                showSettings={showSettings}
                onOpenSettings={() => setShowSettings(true)}
                onCloseSettings={() => setShowSettings(false)}
                currentView={currentView}
              />
            )}
            
            {/* Settings Modal */}
            {showSettings && (
              <UserSettings onClose={() => setShowSettings(false)} />
            )}
            
            {/* Offline Indicator */}
            <EnhancedOfflineIndicator />
            
            {/* Mobile Navigation for small screens */}
            {deviceInfo.isMobile && (
              <MobileNavigation 
                view={currentView}
                setView={setCurrentView}
                onNewTrip={handleNewTrip}
                onOpenSettings={() => setShowSettings(true)}
                onOpenTemplates={() => {/* Handle templates */}}
              />
            )}
          </div>
        </AppSettingsWrapper>
      </I18nProvider>
    </SettingsProvider>
  );
}

export default App;