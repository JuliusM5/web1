// src/services/ApiClient.js

import { API_CONFIG, API_ENDPOINTS } from '../constants/apiEndpoints';

class ApiClient {
  constructor() {
    this.rapidApiKey = API_CONFIG.RAPIDAPI_KEY;
    this.rapidApiHost = API_CONFIG.RAPIDAPI_HOST;
    this.baseUrl = API_ENDPOINTS.SKYSCANNER.BASE_URL;
    
    // Track API usage for monitoring
    this.apiUsage = {
      totalCalls: 0,
      callsByEndpoint: {},
      lastReset: new Date().getTime(),
    };
  }
  
  async get(endpoint, params = {}, useRapidApi = true) {
    return this.request('GET', endpoint, params, null, useRapidApi);
  }
  
  async post(endpoint, data = {}, useRapidApi = true) {
    return this.request('POST', endpoint, {}, data, useRapidApi);
  }
  
  async request(method, endpoint, params = {}, data = null, useRapidApi = true) {
    // Track API usage
    this.apiUsage.totalCalls++;
    this.apiUsage.callsByEndpoint[endpoint] = (this.apiUsage.callsByEndpoint[endpoint] || 0) + 1;
    
    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
    }
    
    // Set up request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Add RapidAPI headers if needed
    if (useRapidApi) {
      options.headers['x-rapidapi-key'] = this.rapidApiKey;
      options.headers['x-rapidapi-host'] = this.rapidApiHost;
    }
    
    // Add body for POST requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    try {
      const response = await fetch(url, options);
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API request failed with status ${response.status}`
        );
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  // Get API usage statistics
  getApiUsage() {
    const now = new Date().getTime();
    const daysSinceReset = Math.floor((now - this.apiUsage.lastReset) / (1000 * 60 * 60 * 24));
    
    return {
      ...this.apiUsage,
      daysSinceReset,
      dailyAverage: this.apiUsage.totalCalls / Math.max(1, daysSinceReset)
    };
  }
  
  // Reset API usage tracking (e.g., at the start of a new billing period)
  resetApiUsage() {
    this.apiUsage = {
      totalCalls: 0,
      callsByEndpoint: {},
      lastReset: new Date().getTime(),
    };
  }
}

export default new ApiClient();