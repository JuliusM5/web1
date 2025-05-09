// src/utils/CrossPlatformHelper.js

/**
 * Helper utility for cross-platform subscription activation
 */
class CrossPlatformHelper {
    /**
     * Format mobile access code with proper dashes and uppercase
     * @param {string} code - The raw access code 
     * @returns {string} - Formatted code (XXXX-XXXX-XXXX)
     */
    static formatAccessCode(code) {
      if (!code) return '';
      
      // Remove any non-alphanumeric characters
      const cleanCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      // Format into groups of 4 characters
      if (cleanCode.length <= 4) {
        return cleanCode;
      } else if (cleanCode.length <= 8) {
        return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4)}`;
      } else {
        return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}-${cleanCode.substring(8, 12)}`;
      }
    }
    
    /**
     * Validates access code format
     * @param {string} code - The access code to validate
     * @returns {boolean} - Whether the code is valid format
     */
    static isValidAccessCodeFormat(code) {
      if (!code) return false;
      
      // Remove dashes for validation
      const cleanCode = code.replace(/-/g, '');
      
      // Check if it's 12 alphanumeric characters
      return /^[A-Za-z0-9]{12}$/.test(cleanCode);
    }
    
    /**
     * Generate QR code data for mobile activation
     * @param {string} accessCode - The access code
     * @returns {string} - QR code data URL
     */
    static generateQRCodeData(accessCode) {
      // This would typically use a QR code library
      // For this example, we'll just return the data that would be encoded
      return `yourapp://activate?code=${accessCode}`;
    }
    
    /**
     * Generate deep link for activation
     * @param {string} accessCode - The access code
     * @returns {string} - Deep link URL
     */
    static generateDeepLink(accessCode) {
      // Format: yourapp://activate?code=XXXX-XXXX-XXXX
      return `yourapp://activate?code=${encodeURIComponent(accessCode)}`;
    }
    
    /**
     * Extract access code from deep link or QR code
     * @param {string} url - The deep link URL 
     * @returns {string|null} - Extracted access code or null
     */
    static extractAccessCodeFromURL(url) {
      try {
        const urlObj = new URL(url);
        
        if (urlObj.protocol === 'yourapp:' && urlObj.pathname === '/activate') {
          const params = new URLSearchParams(urlObj.search);
          const code = params.get('code');
          
          if (code && this.isValidAccessCodeFormat(code)) {
            return this.formatAccessCode(code);
          }
        }
        
        return null;
      } catch (error) {
        console.error('Failed to extract access code from URL:', error);
        return null;
      }
    }
    
    /**
     * Handle universal/deep links for subscription activation
     * @param {string} url - The incoming URL to handle
     * @param {Function} activationCallback - Function to call with extracted code
     * @returns {boolean} - Whether the URL was handled
     */
    static handleDeepLink(url, activationCallback) {
      const code = this.extractAccessCodeFromURL(url);
      
      if (code) {
        activationCallback(code);
        return true;
      }
      
      return false;
    }
  }