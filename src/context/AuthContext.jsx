import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('travelEaseCurrentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Get users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('travelEaseUsers');
    return users ? JSON.parse(users) : [];
  };

  // Initialize default users if none exist
  const initializeUsers = () => {
    const users = getUsers();
    
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123', // In a real app, this would be hashed
          role: 'admin'
        },
        {
          id: 2,
          username: 'user',
          password: 'user123',
          role: 'user'
        }
      ];
      
      localStorage.setItem('travelEaseUsers', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    
    return users;
  };

  // Login function
  const login = (username, password) => {
    const users = initializeUsers();
    
    const user = users.find(
      user => user.username === username && user.password === password
    );
    
    if (user) {
      // Never store the password in the current user state
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('travelEaseCurrentUser', JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('travelEaseCurrentUser');
    setCurrentUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;