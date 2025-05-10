// src/utils/deviceDetection.js

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// Check if the current device is a mobile device
export const isMobileDevice = () => {
  if (!isBrowser) return false;
  
  return (
    // Check for mobile-specific properties
    (typeof window.orientation !== 'undefined') ||
    // Check for mobile-specific user agent patterns
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

// Check if the current device is a tablet
export const isTabletDevice = () => {
  if (!isBrowser) return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  return (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|tablet)/.test(
      userAgent
    )
  );
};

// Check if the current device is iOS
export const isIOS = () => {
  if (!isBrowser) return false;
  
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream // Rule out Windows Phone
  );
};

// Check if the current device is Android
export const isAndroid = () => {
  if (!isBrowser) return false;
  
  return /Android/i.test(navigator.userAgent);
};

// Get device type
export const getDeviceType = () => {
  if (isTabletDevice()) return 'tablet';
  if (isMobileDevice()) return 'mobile';
  return 'desktop';
};

// Get OS name
export const getOSName = () => {
  if (!isBrowser) return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (isIOS()) return 'iOS';
  if (isAndroid()) return 'Android';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  
  return 'unknown';
};

// Get browser name
export const getBrowserName = () => {
  if (!isBrowser) return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (/Edge/.test(userAgent)) return 'Edge';
  if (/Chrome/.test(userAgent) && !/Chromium|Edge/.test(userAgent)) return 'Chrome';
  if (/Firefox/.test(userAgent)) return 'Firefox';
  if (/Safari/.test(userAgent) && !/Chrome|Chromium|Edge/.test(userAgent)) return 'Safari';
  if (/MSIE|Trident/.test(userAgent)) return 'Internet Explorer';
  
  return 'unknown';
};

// Hook for using device detection in components
export const useDeviceDetection = () => {
  return {
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isDesktop: !isMobileDevice() && !isTabletDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    deviceType: getDeviceType(),
    osName: getOSName(),
    browserName: getBrowserName()
  };
};

// Get full device info
export const getDeviceInfo = () => {
  return {
    type: getDeviceType(),
    os: getOSName(),
    browser: getBrowserName(),
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    userAgent: isBrowser ? navigator.userAgent : 'not available'
  };
};