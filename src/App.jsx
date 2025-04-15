import React from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';

function App() {
  return (
    <div className="App">
      {/* Main Content */}
      <EnhancedTripPlanner />
      
      {/* Offline Indicator */}
      <EnhancedOfflineIndicator />
    </div>
  );
}

export default App;