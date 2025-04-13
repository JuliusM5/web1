// src/utils/deviceDetection.js

import { useState, useEffect } from 'react';

// Breakpoints that match Tailwind CSS default breakpoints
const breakpoints = {
  sm: 640,  // Small devices (phones)
  md: 768,  // Medium devices (tablets)
  lg: 1024, // Large devices (laptops/desktops)
  xl: 1280, // Extra large devices (large desktops)
  '2xl': 1536 // 2X Extra large devices
};

/**
 * Custom hook to detect the current device type based on screen width
 * @returns {Object} Object containing device type and boolean flags for each device type
 */
export function useDeviceDetection() {
  // Initialize with defaults based on a conservative estimate
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  
  const [deviceInfo, setDeviceInfo] = useState({
    width: initialWidth,
    isMobile: initialWidth < breakpoints.md,
    isTablet: initialWidth >= breakpoints.md && initialWidth < breakpoints.lg,
    isDesktop: initialWidth >= breakpoints.lg,
    isLargeDesktop: initialWidth >= breakpoints.xl,
    isTouch: false,
    orientation: typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  });
  
  useEffect(() => {
    // Function to update device info based on current window dimensions
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        width,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isLargeDesktop: width >= breakpoints.xl,
        isTouch: checkTouchDevice(),
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };
    
    // Function to check if the device supports touch events
    const checkTouchDevice = () => {
      return (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
      );
    };
    
    // Run the check on initial mount
    updateDeviceInfo();
    
    // Set up event listeners for resize and orientation change
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

/**
 * Helper function to check if the current viewport matches a specific breakpoint
 * @param {string} breakpoint - Breakpoint to check ('sm', 'md', 'lg', 'xl', '2xl')
 * @returns {boolean} True if the current viewport width is greater than or equal to the breakpoint
 */
export function matchesBreakpoint(breakpoint) {
  if (typeof window === 'undefined') return false;
  
  const minWidth = breakpoints[breakpoint];
  if (!minWidth) return false;
  
  return window.innerWidth >= minWidth;
}

/**
 * Helper function to get a CSS value based on the current device type
 * @param {Object} values - Object with keys for different device types and corresponding values
 * @returns {any} The value for the current device type
 */
export function getResponsiveValue(values) {
  const deviceInfo = useDeviceDetection();
  
  if (deviceInfo.isMobile && values.mobile !== undefined) {
    return values.mobile;
  }
  
  if (deviceInfo.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  
  if (deviceInfo.isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  
  if (deviceInfo.isLargeDesktop && values.largeDesktop !== undefined) {
    return values.largeDesktop;
  }
  
  // Return the default value or null if not defined
  return values.default || null;
}

/**
 * Helper component to conditionally render content based on device type
 * Usage: <Responsive mobile={<MobileContent />} desktop={<DesktopContent />} />
 */
export function Responsive({ mobile, tablet, desktop, largeDesktop }) {
  const deviceInfo = useDeviceDetection();
  
  if (deviceInfo.isMobile && mobile) {
    return mobile;
  }
  
  if (deviceInfo.isTablet && tablet) {
    return tablet;
  }
  
  if (deviceInfo.isDesktop && !deviceInfo.isLargeDesktop && desktop) {
    return desktop;
  }
  
  if (deviceInfo.isLargeDesktop && largeDesktop) {
    return largeDesktop;
  }
  
  // Fallback rendering logic - pick the best available option
  if (deviceInfo.isMobile) {
    return mobile || tablet || desktop || largeDesktop || null;
  }
  
  if (deviceInfo.isTablet) {
    return tablet || desktop || mobile || largeDesktop || null;
  }
  
  if (deviceInfo.isDesktop && !deviceInfo.isLargeDesktop) {
    return desktop || tablet || largeDesktop || mobile || null;
  }
  
  if (deviceInfo.isLargeDesktop) {
    return largeDesktop || desktop || tablet || mobile || null;
  }
  
  return null;
}

export default {
  useDeviceDetection,
  matchesBreakpoint,
  getResponsiveValue,
  Responsive,
  breakpoints
};