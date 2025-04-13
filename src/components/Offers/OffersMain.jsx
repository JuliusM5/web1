import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Offers from './Offers';
import AdminOffers from '../Admin/AdminOffers';
import Login from '../Auth/Login';

const OffersMain = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [showAdminView, setShowAdminView] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  
  // Check if user is admin and update showAdminView if needed
  useEffect(() => {
    if (isAdmin() && currentUser) {
      setShowAdminView(true);
    } else {
      setShowAdminView(false);
    }
  }, [isAdmin, currentUser]);
  
  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    // If user is admin, show admin view
    if (isAdmin()) {
      setShowAdminView(true);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Travel Offers</h1>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <span className="text-gray-600">
                Welcome, <span className="font-medium">{currentUser.username}</span>
                {isAdmin() && <span className="ml-1 text-blue-600">(Admin)</span>}
              </span>
              
              {isAdmin() && (
                <button
                  className={`px-4 py-2 rounded ${
                    showAdminView 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => setShowAdminView(!showAdminView)}
                >
                  {showAdminView ? "View Customer View" : "Manage Offers"}
                </button>
              )}
              
              <button
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            // Admin login button is now visible
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowLoginForm(true)}
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
      
      {/* Login form */}
      {showLoginForm && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Admin Login</h2>
            <button 
              onClick={() => setShowLoginForm(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕ Close
            </button>
          </div>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
      
      {/* Main content */}
      {isAdmin() && showAdminView ? (
        <AdminOffers />
      ) : (
        <Offers />
      )}

      {/* Admin access info in footer */}
      <div className="text-center mt-16 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-400">© 2025 TravelEase. All rights reserved.</p>
      </div>
    </div>
  );
};

export default OffersMain;