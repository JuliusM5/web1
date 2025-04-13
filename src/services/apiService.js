/**
 * API Service
 * Provides generic HTTP request functionality with error handling, retries, and caching
 */

// Default options for fetch requests
const defaultOptions = {
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json'
  },
  // Cache responses for GET requests
  cache: true,
  // Cache lifetime in milliseconds (15 minutes)
  cacheLifetime: 15 * 60 * 1000,
  // Number of retries for failed requests
  retries: 1,
  // Delay between retries in milliseconds
  retryDelay: 1000,
  // Timeout for requests in milliseconds (10 seconds)
  timeout: 10000
};

/**
 * Make an HTTP request with error handling, retries, and caching
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @returns {Promise<any>} Promise that resolves to response data
 */
export const request = async (url, options = {}) => {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  const { cache, cacheLifetime, retries, retryDelay, timeout, ...fetchOptions } = mergedOptions;
  
  // Check if request should be cached (only for GET requests)
  const shouldCache = cache && (!fetchOptions.method || fetchOptions.method === 'GET');
  
  // Check cache for existing response
  if (shouldCache) {
    const cachedResponse = getCachedResponse(url, fetchOptions);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Add timeout to request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  fetchOptions.signal = controller.signal;
  
  // Try making the request with retries
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      // Make the request
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Cache the response if needed
      if (shouldCache) {
        cacheResponse(url, fetchOptions, data, cacheLifetime);
      }
      
      // Record the request for offline sync if needed
      if (!navigator.onLine && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'DELETE')) {
        recordOfflineRequest(url, fetchOptions);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Don't retry if request was aborted or if it's the last attempt
      if (error.name === 'AbortError' || attempt === retries) {
        clearTimeout(timeoutId);
        
        // If offline, record the request for later sync
        if (!navigator.onLine && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'DELETE')) {
          recordOfflineRequest(url, fetchOptions);
          throw new Error(`Network request failed (offline). The request will be synchronized when you're back online.`);
        }
        
        throw error;
      }
      
      // Continue to next retry attempt
    }
  }
  
  // This should not happen, but just in case
  throw lastError;
};

/**
 * Make a GET request
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @returns {Promise<any>} Promise that resolves to response data
 */
export const get = (url, options = {}) => {
  return request(url, {
    ...options,
    method: 'GET'
  });
};

/**
 * Make a POST request
 * 
 * @param {string} url Request URL
 * @param {Object} data Request body data
 * @param {Object} options Request options
 * @returns {Promise<any>} Promise that resolves to response data
 */
export const post = (url, data, options = {}) => {
  return request(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * Make a PUT request
 * 
 * @param {string} url Request URL
 * @param {Object} data Request body data
 * @param {Object} options Request options
 * @returns {Promise<any>} Promise that resolves to response data
 */
export const put = (url, data, options = {}) => {
  return request(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * Make a DELETE request
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @returns {Promise<any>} Promise that resolves to response data
 */
export const del = (url, options = {}) => {
  return request(url, {
    ...options,
    method: 'DELETE'
  });
};

// Cache functions

/**
 * Generate a cache key for a request
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @returns {string} Cache key
 */
const generateCacheKey = (url, options) => {
  const paramsString = JSON.stringify(options);
  return `${url}:${paramsString}`;
};

/**
 * Get a cached response if available and not expired
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @returns {Object|null} Cached response or null if not available
 */
const getCachedResponse = (url, options) => {
  const cacheKey = generateCacheKey(url, options);
  const cachedItem = localStorage.getItem(`api_cache:${cacheKey}`);
  
  if (cachedItem) {
    try {
      const { data, expiry } = JSON.parse(cachedItem);
      
      // Check if cache is still valid
      if (expiry > Date.now()) {
        return data;
      } else {
        // Remove expired cache
        localStorage.removeItem(`api_cache:${cacheKey}`);
      }
    } catch (error) {
      console.error('Error parsing cached response:', error);
      localStorage.removeItem(`api_cache:${cacheKey}`);
    }
  }
  
  return null;
};

/**
 * Cache a response for future use
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 * @param {Object} data Response data
 * @param {number} lifetime Cache lifetime in milliseconds
 */
const cacheResponse = (url, options, data, lifetime) => {
  const cacheKey = generateCacheKey(url, options);
  const expiry = Date.now() + lifetime;
  
  try {
    localStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify({ data, expiry }));
  } catch (error) {
    console.error('Error caching response:', error);
    // If storage is full, clear old cache items
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheItems();
    }
  }
};

/**
 * Clear old cache items when storage is full
 */
const clearOldCacheItems = () => {
  // Get all cache keys
  const cacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('api_cache:')) {
      cacheKeys.push(key);
    }
  }
  
  // Sort keys by age (oldest first)
  const sortedKeys = cacheKeys.map(key => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      return { key, expiry: item.expiry };
    } catch (error) {
      return { key, expiry: 0 }; // If can't parse, treat as oldest
    }
  }).sort((a, b) => a.expiry - b.expiry);
  
  // Remove oldest 20% of cache
  const removeCount = Math.max(1, Math.ceil(sortedKeys.length * 0.2));
  sortedKeys.slice(0, removeCount).forEach(({ key }) => {
    localStorage.removeItem(key);
  });
};

/**
 * Record an offline request for later synchronization
 * 
 * @param {string} url Request URL
 * @param {Object} options Request options
 */
const recordOfflineRequest = (url, options) => {
  // Get existing unsynced changes
  const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
  
  // Add this request
  unsynced.push({
    timestamp: Date.now(),
    url,
    options,
    id: Date.now() + Math.floor(Math.random() * 1000)
  });
  
  // Save updated unsynced changes
  localStorage.setItem('unsyncedChanges', JSON.stringify(unsynced));
  
  // Update unsynced count for UI
  window.dispatchEvent(new CustomEvent('unsyncedChangesUpdated', {
    detail: { count: unsynced.length }
  }));
};