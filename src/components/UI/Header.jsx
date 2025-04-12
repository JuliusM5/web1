import React from 'react';

function Header({ view, setView }) {
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
        <nav>
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
                onClick={() => setView('planner')}
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
      </div>
    </header>
  );
}

export default Header;