import React from 'react';

function Header({ view, setView, onNewTrip, onOpenSettings, onOpenTemplates }) {
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
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <button 
                className={view === 'dashboard' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={view === 'planner' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => onNewTrip()}
              >
                Plan Trip
              </button>
            </li>
            <li>
              <button 
                className={view === 'trips' ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => setView('trips')}
              >
                My Trips
              </button>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button
            onClick={onOpenTemplates}
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Templates"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
            </svg>
          </button>
          <button
            onClick={() => onNewTrip()}
            className="md:flex hidden items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Trip
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;