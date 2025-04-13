import React, { useEffect, useState } from 'react';
import { useDeviceDetection } from '../../utils/deviceDetection';

/**
 * A wrapper component that renders different content based on screen size
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.mobile - Content to render on mobile devices
 * @param {React.ReactNode} props.tablet - Content to render on tablet devices
 * @param {React.ReactNode} props.desktop - Content to render on desktop devices
 * @param {React.ReactNode} props.fallback - Fallback content if no specific size matches
 * @returns {React.ReactNode} - The appropriate content for the current screen size
 */
function ResponsiveWrapper({ mobile, tablet, desktop, fallback }) {
  const deviceInfo = useDeviceDetection();
  const [mounted, setMounted] = useState(false);
  
  // Only perform client-side rendering after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return null during SSR or before hydration is complete
  if (!mounted) {
    return null;
  }
  
  if (deviceInfo.isMobile && mobile) {
    return mobile;
  }
  
  if (deviceInfo.isTablet && tablet) {
    return tablet;
  }
  
  if (deviceInfo.isDesktop && desktop) {
    return desktop;
  }
  
  // Fallback logic - use the most appropriate component for the device
  if (deviceInfo.isMobile) {
    return mobile || tablet || desktop || fallback;
  }
  
  if (deviceInfo.isTablet) {
    return tablet || desktop || mobile || fallback;
  }
  
  if (deviceInfo.isDesktop) {
    return desktop || tablet || mobile || fallback;
  }
  
  return fallback || null;
}

export default ResponsiveWrapper;