// src/utils/errorMonitoring.js
// Browser-compatible error monitoring
// Error storage for debugging
const errorLog = [];
const MAX_ERRORS = 100;

const initErrorMonitoring = () => {
  // Set up global error handler
  window.addEventListener('error', (event) => {
    captureError(event.error || new Error(event.message));
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason || new Error('Unhandled promise rejection'));
  });
  
  console.log('Error monitoring initialized');
};

export const captureError = (error, extraInfo = {}) => {
  console.error('Error captured:', error, extraInfo);
  
  // Store error in the log
  errorLog.unshift({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    extra: extraInfo
  });
  
  // Keep the log size manageable
  if (errorLog.length > MAX_ERRORS) {
    errorLog.pop();
  }
  
  // In production, you would send this to your server
  if (process.env.NODE_ENV === 'production') {
    try {
      // Simple error reporting via fetch
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          extra: extraInfo,
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
        // Don't wait for response
        keepalive: true
      }).catch(() => {
        // Ignore errors in error reporting
      });
    } catch (e) {
      // Fail silently - we don't want error reporting to cause more errors
    }
  }
};

export const setErrorUser = (user) => {
  // Store user info in localStorage for error reporting
  if (user) {
    try {
      localStorage.setItem('error_user', JSON.stringify({
        id: user.id,
        subscription: user.hasSubscription ? 'active' : 'inactive'
      }));
    } catch (e) {
      // Ignore storage errors
    }
  }
};

export const clearErrorUser = () => {
  try {
    localStorage.removeItem('error_user');
  } catch (e) {
    // Ignore storage errors
  }
};

// For debugging - allows viewing recent errors
export const getErrorLog = () => [...errorLog];

export default initErrorMonitoring;