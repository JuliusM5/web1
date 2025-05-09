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
    // Create a more secure token with random bytes
    const randomBytes = new Uint8Array(24);
    window.crypto.getRandomValues(randomBytes);
    
    // Convert to hex string and add timestamp
    const tokenBase = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    
    return `tok_${tokenBase}_${timestamp}`;
  }

  /**
   * Generate a mobile access code
   * @returns {string} Formatted mobile code (XXXX-XXXX-XXXX)
   */
  static generateMobileAccessCode() {
    // Create readable code in XXXX-XXXX-XXXX format
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit similar-looking characters
    
    // Generate random values
    const randomBytes = new Uint8Array(12);
    window.crypto.getRandomValues(randomBytes);
    
    // Convert to code
    let code = '';
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
    // Store basic subscription info
    localStorage.setItem('subscription_token', token);
    localStorage.setItem('subscription_expiry', expiryDate.toISOString());
    localStorage.setItem('subscription_plan', plan);
    
    // Store creation timestamp for reference
    localStorage.setItem('subscription_created_at', new Date().toISOString());
    
    // Create a validation hash to detect tampering
    const validationHash = this.createValidationHash(token, plan, expiryDate);
    localStorage.setItem('subscription_validation', validationHash);
    
    return {
      token,
      plan,
      expiresAt: expiryDate.toISOString()
    };
  }

  /**
   * Create a validation hash to detect tampering
   * @private
   */
  static createValidationHash(token, plan, expiryDate) {
    // Simple validation hash based on token and expiry
    // In a real app, this would use proper cryptographic hashing
    const expiry = expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate;
    return btoa(`${token}:${plan}:${expiry}`);
  }

  /**
   * Verify a subscription token
   * @param {string} token - Token to verify
   * @returns {Object} Verification result
   */
  static async verifyToken(token) {
    if (!token) return { valid: false, reason: 'missing_token' };
    
    try {
      // Get stored subscription data
      const storedToken = localStorage.getItem('subscription_token');
      const expiryDate = localStorage.getItem('subscription_expiry');
      const plan = localStorage.getItem('subscription_plan');
      const validationHash = localStorage.getItem('subscription_validation');
      
      // Verify token matches
      if (token !== storedToken) {
        return { valid: false, reason: 'invalid_token' };
      }
      
      // Check if token is expired
      const isExpired = expiryDate && new Date(expiryDate) <= new Date();
      if (isExpired) {
        return { valid: false, reason: 'expired' };
      }
      
      // Verify hash to detect tampering
      const expectedHash = this.createValidationHash(token, plan, expiryDate);
      if (validationHash !== expectedHash) {
        return { valid: false, reason: 'tampered' };
      }
      
      // Token is valid
      return {
        valid: true,
        plan,
        expiresAt: expiryDate,
        daysRemaining: this.calculateDaysRemaining(expiryDate)
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false, error: error.message, reason: 'error' };
    }
  }

  /**
   * Calculate days remaining in subscription
   * @private
   */
  static calculateDaysRemaining(expiryDateStr) {
    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
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
      
      // In a real app, this would call a server endpoint to verify the code
      // For development, we'll create a mock successful response
      
      // Generate a new token for the mobile device
      const accessToken = this.generateToken();
      
      // Set expiry date (30 days from now for development)
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
    localStorage.removeItem('subscription_created_at');
    localStorage.removeItem('subscription_validation');
  }

  /**
   * Check if the subscription is about to expire
   * @returns {boolean} True if subscription expires in less than 7 days
   */
  static isAboutToExpire() {
    const expiryDate = localStorage.getItem('subscription_expiry');
    if (!expiryDate) return false;
    
    const daysRemaining = this.calculateDaysRemaining(expiryDate);
    return daysRemaining > 0 && daysRemaining <= 7;
  }
}

export default TokenizedSubscription;