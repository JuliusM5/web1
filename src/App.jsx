import React from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        {/* Main Content */}
        <EnhancedTripPlanner />
        
        {/* Offline Indicator */}
        <EnhancedOfflineIndicator />
      </div>
    </SettingsProvider>
  );
}

export default App;