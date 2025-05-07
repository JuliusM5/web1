// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setLoading(false);
    
    // Create a mock user if none exists
    if (!savedUser) {
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email: 'test@example.com',
        name: 'Test User',
        created: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  }, []);
  
  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  // Get or create user helper function
  const getOrCreateUser = () => {
    if (user) return user;
    
    // Create mock user for testing
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      email: 'test@example.com',
      name: 'Test User',
      created: new Date().toISOString()
    };
    
    login(mockUser);
    return mockUser;
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      getOrCreateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;