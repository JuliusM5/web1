import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext();

// Mock user data for demo purposes
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', isAdmin: true },
  { id: 2, username: 'user', password: 'user123', isAdmin: false }
];

// AuthProvider component
export const AuthProvider = ({ children }) => {
  // Get user from localStorage or set to null
  const [currentUser, setCurrentUser] = useState(null);
  
  // Read from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user', e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);
  
  // Login function
  const login = (username, password) => {
    // Find user with matching credentials
    const user = mockUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      // Create a user object without the password for security
      const userWithoutPassword = { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      };
      
      // Set the current user
      setCurrentUser(userWithoutPassword);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return true;
    }
    
    return false;
  };
  
  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.isAdmin === true;
  };
  
  // Create the context value
  const value = {
    currentUser,
    login,
    logout,
    isAdmin
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;