import React, { useState } from 'react';
import './App.css';
import EnhancedTripPlanner from './components/TravelPlanner/EnhancedTripPlanner';
import EnhancedOfflineIndicator from './components/Offline/EnhancedOfflineIndicator';
import OffersMain from './components/Offers/OffersMain';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [currentView, setCurrentView] = useState('planner'); // 'planner', 'offers'
  
  return (
    <AuthProvider>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">TravelEase</h1>
            </div>
            
            <div className="flex space-x-6">
              <button 
                className={`hover:text-blue-200 ${currentView === 'planner' ? 'font-bold border-b-2 border-white' : ''}`}
                onClick={() => setCurrentView('planner')}
              >
                Trip Planner
              </button>
              <button 
                className={`hover:text-blue-200 ${currentView === 'offers' ? 'font-bold border-b-2 border-white' : ''}`}
                onClick={() => setCurrentView('offers')}
              >
                Our Offers
              </button>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        {currentView === 'planner' && <EnhancedTripPlanner />}
        {currentView === 'offers' && <OffersMain />}
        
        {/* Offline Indicator */}
        <EnhancedOfflineIndicator />
      </div>
    </AuthProvider>
  );
}

export default App;