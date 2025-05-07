// src/services/authService.js

class AuthService {
    constructor() {
      this.apiUrl = '/api/auth';
      this.tokenKey = 'auth_token';
      this.refreshTokenKey = 'refresh_token';
      this.userKey = 'user_data';
    }
    
    // Register a new user
    async register(userData) {
      try {
        const response = await fetch(`${this.apiUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Store tokens and user data
        this.setTokens(data.token, data.refreshToken);
        this.setUser(data.user);
        
        return { success: true, user: data.user };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Login an existing user
    async login(credentials) {
      try {
        const response = await fetch(`${this.apiUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store tokens and user data
        this.setTokens(data.token, data.refreshToken);
        this.setUser(data.user);
        
        return { success: true, user: data.user };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Logout the current user
    logout() {
      // Clear all auth data from storage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      
      // Optionally notify the server
      fetch(`${this.apiUrl}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      }).catch(error => {
        console.error('Logout notification error:', error);
      });
      
      return { success: true };
    }
    
    // Check if the user is authenticated
    isAuthenticated() {
      const token = this.getToken();
      return !!token;
    }
    
    // Get the current user
    getUser() {
      const userJson = localStorage.getItem(this.userKey);
      if (!userJson) return null;
      
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    
    // Store user data
    setUser(user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    
    // Get the auth token
    getToken() {
      return localStorage.getItem(this.tokenKey);
    }
    
    // Get auth headers for API requests
    getAuthHeaders() {
      const token = this.getToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    
    // Store tokens
    setTokens(token, refreshToken) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    
    // Refresh the auth token
    async refreshToken() {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }
      
      try {
        const response = await fetch(`${this.apiUrl}/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!response.ok) {
          // If refresh fails, logout
          this.logout();
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        
        // Update stored token
        localStorage.setItem(this.tokenKey, data.token);
        
        return { success: true, token: data.token };
      } catch (error) {
        console.error('Token refresh error:', error);
        this.logout();
        return { success: false, error: error.message };
      }
    }
    
    // Update user profile
    async updateProfile(userData) {
      try {
        const response = await fetch(`${this.apiUrl}/profile`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Profile update failed');
        }
        
        const data = await response.json();
        
        // Update stored user data
        this.setUser(data.user);
        
        return { success: true, user: data.user };
      } catch (error) {
        console.error('Profile update error:', error);
        
        // Handle unauthorized errors
        if (error.message.includes('unauthorized') || error.message.includes('token')) {
          const refreshResult = await this.refreshToken();
          
          if (refreshResult.success) {
            // Retry the update with new token
            return this.updateProfile(userData);
          }
        }
        
        return { success: false, error: error.message };
      }
    }
    
    // Change password
    async changePassword(passwordData) {
      try {
        const response = await fetch(`${this.apiUrl}/change-password`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(passwordData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Password change failed');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Request password reset
    async requestPasswordReset(email) {
      try {
        const response = await fetch(`${this.apiUrl}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Password reset request failed');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Password reset request error:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Complete password reset
    async resetPassword(token, newPassword) {
      try {
        const response = await fetch(`${this.apiUrl}/reset-password/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: newPassword })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Password reset failed');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Create an API client that automatically handles token refresh
    createApiClient() {
      return {
        get: async (url) => this.makeRequest('GET', url),
        post: async (url, data) => this.makeRequest('POST', url, data),
        put: async (url, data) => this.makeRequest('PUT', url, data),
        delete: async (url) => this.makeRequest('DELETE', url)
      };
    }
    
    // Make authenticated API requests with token refresh
    async makeRequest(method, url, data = null) {
      try {
        const options = {
          method,
          headers: this.getAuthHeaders()
        };
        
        if (data) {
          options.body = JSON.stringify(data);
        }
        
        let response = await fetch(url, options);
        
        // Handle unauthorized error (expired token)
        if (response.status === 401) {
          const refreshResult = await this.refreshToken();
          
          if (refreshResult.success) {
            // Retry with new token
            options.headers = this.getAuthHeaders();
            response = await fetch(url, options);
          } else {
            throw new Error('Session expired. Please login again.');
          }
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Request failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    }
  }
  
  export default new AuthService();