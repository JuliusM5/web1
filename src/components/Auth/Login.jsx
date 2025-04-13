import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AccessibleButton from '../Accessibility/AccessibleButton';
import { AccessibleInput } from '../Accessibility/AccessibleInput';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }
    
    const loginSuccess = login(username, password);
    
    if (loginSuccess) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Admin Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <AccessibleInput
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mb-3"
        />
        
        <AccessibleInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-5"
        />
        
        <div className="flex justify-center">
          <AccessibleButton
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </AccessibleButton>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>For demo: Admin login - username: admin, password: admin123</p>
          <p>Regular user - username: user, password: user123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;