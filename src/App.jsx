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

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const deviceInfo = useDeviceDetection();

  return (
    <SettingsProvider>
      <I18nProvider> {/* Wrap with I18nProvider */}
        <AppSettingsWrapper>
          <div className="App">
            {/* Main Content */}
            <EnhancedTripPlanner 
              showSettings={showSettings}
              onOpenSettings={() => setShowSettings(true)}
              onCloseSettings={() => setShowSettings(false)}
            />
            
            {/* Settings Modal */}
            {showSettings && (
              <UserSettings onClose={() => setShowSettings(false)} />
            )}
            
            {/* Offline Indicator */}
            <EnhancedOfflineIndicator />
            
            {/* Mobile Navigation for small screens */}
            {deviceInfo.isMobile && (
              <MobileNavigation 
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
          </div>
        </AppSettingsWrapper>
      </I18nProvider>
    </SettingsProvider>
  );
}

export default App;