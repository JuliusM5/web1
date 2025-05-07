/**
 * Device Detection Utilities
 * 
 * Provides functions to detect device type, screen size, capabilities,
 * and orientation for responsive design and feature detection.
 */

import { useState, useEffect } from 'react';
export const deviceDetection = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  return {
    isMobile: /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isAndroid: /Android/i.test(userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream,
    isTablet: (/iPad/i.test(userAgent) || 
              (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))),
    isDesktop: !(/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent))
  };
}; 
/**
 * Device type constants
 */
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

/**
 * Screen size breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  SMALL: 640,   // Mobile
  MEDIUM: 768,  // Small tablet
  LARGE: 1024,  // Large tablet/small desktop
  XL: 1280,     // Desktop
  XXL: 1536     // Large desktop
};

/**
 * Check if the app is running in a browser environment
 * 
 * @returns {boolean} True if in browser environment
 */
export const isBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Detect device type based on user agent
 * 
 * @returns {string} Device type (mobile, tablet, or desktop)
 */
export const detectDeviceType = () => {
  if (!isBrowser()) return DEVICE_TYPES.DESKTOP;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for tablets first (some tablets identify as both mobile and tablet)
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
  if (isTablet) return DEVICE_TYPES.TABLET;
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  if (isMobile) return DEVICE_TYPES.MOBILE;
  
  // Default to desktop
  return DEVICE_TYPES.DESKTOP;
};

/**
 * Get current screen size category
 * 
 * @returns {string} Screen size category (sm, md, lg, xl, xxl)
 */
export const getScreenSizeCategory = () => {
  if (!isBrowser()) return 'lg';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.SMALL) return 'sm';
  if (width < BREAKPOINTS.MEDIUM) return 'md';
  if (width < BREAKPOINTS.LARGE) return 'lg';
  if (width < BREAKPOINTS.XL) return 'xl';
  return 'xxl';
};

/**
 * Check if the device is using a touch interface
 * 
 * @returns {boolean} True if touch is supported
 */
export const isTouchDevice = () => {
  if (!isBrowser()) return false;
  
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
};

/**
 * Get current device orientation
 * 
 * @returns {string} Device orientation (portrait or landscape)
 */
export const getDeviceOrientation = () => {
  if (!isBrowser()) return 'landscape';
  
  return window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape';
};

/**
 * Check device network information
 * 
 * @returns {Object} Network information
 */
export const getNetworkInfo = () => {
  if (!isBrowser()) {
    return {
      online: true,
      effectiveType: '4g',
      saveData: false
    };
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || '4g',
    saveData: connection?.saveData || false
  };
};

/**
 * Device capability detection
 * 
 * @returns {Object} Device capabilities
 */
export const detectCapabilities = () => {
  if (!isBrowser()) {
    return {
      pwa: false,
      notifications: false,
      geolocation: false,
      camera: false,
      bluetooth: false,
      webShare: false
    };
  }
  
  return {
    // PWA installation capability
    pwa: 'serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches,
    // Notification support
    notifications: 'Notification' in window,
    // Geolocation support
    geolocation: 'geolocation' in navigator,
    // Camera access
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    // Bluetooth support
    bluetooth: 'bluetooth' in navigator,
    // Web share API
    webShare: 'share' in navigator
  };
};

/**
 * React hook for device detection
 * 
 * @returns {Object} Device information that updates on window resize
 */
export const useDeviceDetection = () => {
  // Default state for SSR
  const defaultState = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    orientation: 'landscape',
    isTouch: false,
    online: true,
    capabilities: {
      pwa: false,
      notifications: false,
      geolocation: false,
      camera: false,
      bluetooth: false,
      webShare: false
    }
  };
  
  // Initialize state
  const [deviceInfo, setDeviceInfo] = useState(defaultState);
  
  useEffect(() => {
    // Function to update device information
    const updateDeviceInfo = () => {
      const deviceType = detectDeviceType();
      const screenSize = getScreenSizeCategory();
      const orientation = getDeviceOrientation();
      const isTouch = isTouchDevice();
      const { online } = getNetworkInfo();
      const capabilities = detectCapabilities();
      
      setDeviceInfo({
        isMobile: deviceType === DEVICE_TYPES.MOBILE,
        isTablet: deviceType === DEVICE_TYPES.TABLET,
        isDesktop: deviceType === DEVICE_TYPES.DESKTOP,
        screenSize,
        orientation,
        isTouch,
        online,
        capabilities
      });
    };
    
    // Initial update
    updateDeviceInfo();
    
    // Add event listeners
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    window.addEventListener('online', updateDeviceInfo);
    window.addEventListener('offline', updateDeviceInfo);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      window.removeEventListener('online', updateDeviceInfo);
      window.removeEventListener('offline', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
};

/**
 * Check if the current device is a mobile device
 * 
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  return detectDeviceType() === DEVICE_TYPES.MOBILE;
};

/**
 * Check if the current device is a tablet
 * 
 * @returns {boolean} True if tablet device
 */
export const isTabletDevice = () => {
  return detectDeviceType() === DEVICE_TYPES.TABLET;
};

/**
 * Check if the current device is a desktop
 * 
 * @returns {boolean} True if desktop device
 */
export const isDesktopDevice = () => {
  return detectDeviceType() === DEVICE_TYPES.DESKTOP;
};