import React from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import { SettingsProvider } from './context/SettingsContext';
import AppSettingsWrapper from './components/UI/AppSettingsWrapper';

function App() {
  return (
    <SettingsProvider>
      <AppSettingsWrapper>
        <div className="App">
          {/* Main Content */}
          <EnhancedTripPlanner />
          
          {/* Offline Indicator */}
          <EnhancedOfflineIndicator />
        </div>
      </AppSettingsWrapper>
    </SettingsProvider>
  );
}

export default App;