// src/services/platforms/appleReceiptVerifier.web.js

/**
 * Web mock of Apple receipt verifier
 */
const appleReceiptVerifier = {
  /**
   * Verify an Apple receipt
   */
  async verify() {
    return {
      valid: false,
      message: 'Apple receipt verification is not available in web environment'
    };
  }
};

export default appleReceiptVerifier;