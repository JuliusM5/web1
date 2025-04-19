import React, { useState } from 'react';

function EnhancedHeader({ view, setView, onNewTrip, onOpenSettings, onOpenTemplates }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="white" stroke="white" strokeWidth="1" />
            <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
            <path d="M12 22V11" stroke="#3B82F6" strokeWidth="2" />
            <path d="M17 8.5L12 11L7 8.5" stroke="#3B82F6" strokeWidth="1" />
          </svg>
          <h1 className="text-2xl font-bold">TravelEase</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <button 
            className={view === 'dashboard' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={view === 'planner' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
            onClick={onNewTrip}
          >
            Plan Trip
          </button>
          <button 
            className={view === 'trips' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
            onClick={() => setView('trips')}
          >
            My Trips
          </button>
          <button 
            className="hover:text-blue-100"
            onClick={onOpenTemplates}
          >
            Templates
          </button>
          <button 
            className="hover:text-blue-100"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </nav>
        
        {/* Mobile menu button */}
        <div className="block md:hidden">
          <button 
            onClick={toggleDropdown}
            className="flex items-center px-3 py-2 rounded border border-blue-400 hover:border-white"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
          
          {/* Mobile dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-20">
              <button
                onClick={() => {
                  setView('dashboard');
                  setShowDropdown(false);
                }}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNewTrip();
                  setShowDropdown(false);
                }}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Plan Trip
              </button>
              <button
                onClick={() => {
                  setView('trips');
                  setShowDropdown(false);
                }}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                My Trips
              </button>
              <button
                onClick={() => {
                  onOpenTemplates();
                  setShowDropdown(false);
                }}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Templates
              </button>
              <button
                onClick={() => {
                  onOpenSettings();
                  setShowDropdown(false);
                }}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons below header on some views */}
      {(view === 'dashboard' || view === 'trips') && (
        <div className="container mx-auto mt-4 flex justify-end">
          <button
            onClick={onNewTrip}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-50 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Trip
          </button>
        </div>
      )}
    </header>
  );
}

export default EnhancedHeader;