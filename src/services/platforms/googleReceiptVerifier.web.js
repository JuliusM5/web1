// src/services/platforms/googleReceiptVerifier.web.js

/**
 * Web mock of Google receipt verifier
 */
const googleReceiptVerifier = {
  /**
   * Verify a Google Play receipt
   */
  async verify() {
    return {
      valid: false,
      message: 'Google receipt verification is not available in web environment'
    };
  }
};

export default googleReceiptVerifier;