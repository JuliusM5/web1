// src/utils/platformImports.js

/**
 * This utility handles platform-specific imports
 */

import { deviceDetection } from './deviceDetection';

// Default to web implementations 
let MobileSubscriptionService;
let AndroidSubscriptionHandler;
let IOSSubscriptionHandler;
let appleReceiptVerifier;
let googleReceiptVerifier;

// Web-only imports
import WebMobileSubscriptionService from '../services/MobileSubscriptionService.web';
import WebAndroidHandler from '../services/platforms/AndroidSubscriptionHandler.web';
import WebIOSHandler from '../services/platforms/IOSSubscriptionHandler.web';
import WebAppleVerifier from '../services/platforms/appleReceiptVerifier.web';
import WebGoogleVerifier from '../services/platforms/googleReceiptVerifier.web';

// Use web versions
MobileSubscriptionService = WebMobileSubscriptionService;
AndroidSubscriptionHandler = WebAndroidHandler;
IOSSubscriptionHandler = WebIOSHandler;
appleReceiptVerifier = WebAppleVerifier;
googleReceiptVerifier = WebGoogleVerifier;

// Export everything
export {
  MobileSubscriptionService,
  AndroidSubscriptionHandler,
  IOSSubscriptionHandler,
  appleReceiptVerifier,
  googleReceiptVerifier
};