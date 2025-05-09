// src/models/TokenizedSubscription.js

/**
 * Client-side utility for handling subscription tokens
 */
class TokenizedSubscription {
  /**
   * Generate a secure random token
   * @returns {string} Generated token
   */
  static generateToken() {
    // Create a more secure token
    const randomBytes = new Uint8Array(24);
    window.crypto.getRandomValues(randomBytes);
    
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + Date.now().toString(36);
  }

  /**
   * Generate a mobile access code
   * @returns {string} Formatted mobile code (XXXX-XXXX-XXXX)
   */
  static generateMobileAccessCode() {
    // Create readable code in XXXX-XXXX-XXXX format
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit similar-looking characters
    let code = '';
    
    // Generate random values
    const randomBytes = new Uint8Array(12);
    window.crypto.getRandomValues(randomBytes);
    
    // Generate 12 characters
    for (let i = 0; i < 12; i++) {
      const randomIndex = randomBytes[i] % chars.length;
      code += chars[randomIndex];
      
      // Add dashes after every 4 characters (except at the end)
      if ((i + 1) % 4 === 0 && i < 11) {
        code += '-';
      }
    }
    
    return code;
  }

  /**
   * Store subscription details securely
   * @param {string} token - Access token
   * @param {string} plan - Subscription plan
   * @param {Date} expiryDate - Expiration date
   * @returns {Object} Stored subscription info
   */
  static storeSubscription(token, plan, expiryDate) {
    localStorage.setItem('subscription_token', token);
    localStorage.setItem('subscription_expiry', expiryDate.toISOString());
    localStorage.setItem('subscription_plan', plan);
    
    return {
      token,
      plan,
      expiresAt: expiryDate.toISOString()
    };
  }

  /**
   * Verify a subscription token
   * @param {string} token - Token to verify
   * @returns {Object} Verification result
   */
  static async verifyToken(token) {
    if (!token) return { valid: false };
    
    try {
      // In a production app, this would call an API endpoint
      // For development, we'll check localStorage directly
      
      const storedToken = localStorage.getItem('subscription_token');
      const expiryDate = localStorage.getItem('subscription_expiry');
      const plan = localStorage.getItem('subscription_plan');
      
      if (token !== storedToken) return { valid: false };
      
      // Check if token is expired
      const isExpired = expiryDate && new Date(expiryDate) <= new Date();
      if (isExpired) return { valid: false, reason: 'expired' };
      
      return {
        valid: true,
        plan,
        expiresAt: expiryDate
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Verify a mobile access code
   * @param {string} code - Mobile access code to verify
   * @returns {Object} Verification result
   */
  static async verifyMobileCode(code) {
    try {
      // Validate code format first
      if (!code || !/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
        return { valid: false, error: 'Invalid code format' };
      }
      
      // In a production app, this would call an API endpoint
      // For development, we'll simulate a successful verification
      
      // Generate a fake token that would be returned by the server
      const accessToken = TokenizedSubscription.generateToken();
      
      // Set an expiry date (30 days from now for this example)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      return {
        valid: true,
        accessToken,
        plan: 'monthly_premium', // Assume monthly plan
        expiresAt: expiryDate.toISOString()
      };
    } catch (error) {
      console.error('Code verification failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Clear subscription data from storage
   */
  static clearSubscription() {
    localStorage.removeItem('subscription_token');
    localStorage.removeItem('subscription_expiry');
    localStorage.removeItem('subscription_plan');
  }
}

export default TokenizedSubscription;