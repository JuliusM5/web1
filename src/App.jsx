import React from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';

function App() {
  return (
    <div className="App">
      <EnhancedTripPlanner />
      <EnhancedOfflineIndicator />
    </div>
  );
}

export default App;