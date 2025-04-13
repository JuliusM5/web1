import React from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import OfflineIndicator from './components/Offline/OfflineIndicator';

function App() {
  return (
    <div className="App">
      <EnhancedTripPlanner />
      <OfflineIndicator />
    </div>
  );
}

export default App;
