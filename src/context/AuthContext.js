// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a user in localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    // This would normally call your API
    // For now, we'll simulate a successful login
    
    const userData = {
      id: '123',
      username,
      name: 'Demo User',
      email: `${username}@example.com`
    };

    // Store user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // Register function
  const register = async (userData) => {
    // This would normally call your API
    // For now, we'll simulate a successful registration
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      name: userData.username
    };

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // The value that will be given to the context
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;