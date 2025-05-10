// src/services/ApiClient.js
// Simple API client using native fetch instead of axios

import { captureError } from '../utils/errorMonitoring';

class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Helper to get full URL
  getUrl(endpoint) {
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  // Helper to prepare request options
  getRequestOptions(method, data, customHeaders = {}) {
    // Get device ID for request
    const deviceId = localStorage.getItem('deviceId');
    
    // Prepare headers
    const headers = {
      ...this.defaultHeaders,
      ...customHeaders
    };
    
    // Add device ID to headers if available
    if (deviceId) {
      headers['X-Device-ID'] = deviceId;
    }
    
    // Prepare options
    const options = {
      method,
      headers,
      credentials: 'include' // Include cookies in requests
    };
    
    // Add body for non-GET requests
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    return options;
  }

  // Helper to handle responses
  async handleResponse(response) {
    // Check if the request was successful
    if (!response.ok) {
      const error = new Error(`HTTP error ${response.status}`);
      error.status = response.status;
      
      try {
        // Try to parse error response
        error.responseData = await response.json();
      } catch (e) {
        // If parsing fails, use text response
        error.responseText = await response.text();
      }
      
      throw error;
    }
    
    // Check content type to determine how to parse the response
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      // For other types (like blobs), return the response
      return response;
    }
  }

  // Main request method
  async request(endpoint, method, data, customHeaders) {
    try {
      const url = this.getUrl(endpoint);
      const options = this.getRequestOptions(method, data, customHeaders);
      
      const response = await fetch(url, options);
      return await this.handleResponse(response);
    } catch (error) {
      // Log the error
      console.error(`API ${method} request to ${endpoint} failed:`, error);
      
      // Capture for monitoring
      captureError(error, {
        context: 'API request',
        endpoint,
        method
      });
      
      // Rethrow for handling by caller
      throw error;
    }
  }

  // Convenience methods for common HTTP methods
  async get(endpoint, customHeaders) {
    return this.request(endpoint, 'GET', null, customHeaders);
  }

  async post(endpoint, data, customHeaders) {
    return this.request(endpoint, 'POST', data, customHeaders);
  }

  async put(endpoint, data, customHeaders) {
    return this.request(endpoint, 'PUT', data, customHeaders);
  }

  async patch(endpoint, data, customHeaders) {
    return this.request(endpoint, 'PATCH', data, customHeaders);
  }

  async delete(endpoint, customHeaders) {
    return this.request(endpoint, 'DELETE', null, customHeaders);
  }
}

export default new ApiClient();