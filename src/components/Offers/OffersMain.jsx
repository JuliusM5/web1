import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Offers from './Offers';
import AdminOffers from '../Admin/AdminOffers';
import Login from '../Auth/Login';
import AccessibleButton from '../Accessibility/AccessibleButton';

const OffersMain = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [showAdminView, setShowAdminView] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  
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
                <AccessibleButton
                  variant={showAdminView ? "secondary" : "primary"}
                  onClick={() => setShowAdminView(!showAdminView)}
                  size="small"
                >
                  {showAdminView ? "View Customer View" : "Manage Offers"}
                </AccessibleButton>
              )}
              
              <AccessibleButton
                variant="outline"
                onClick={logout}
                size="small"
              >
                Logout
              </AccessibleButton>
            </>
          ) : (
            <AccessibleButton
              variant="primary"
              onClick={() => setShowLoginForm(true)}
              size="small"
            >
              Admin Login
            </AccessibleButton>
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
    </div>
  );
};

export default OffersMain;