// src/services/platforms/IOSSubscriptionHandler.web.js

/**
 * Web mock of iOS subscription handler
 */
class IOSSubscriptionHandler {
  /**
   * Initialize the handler
   */
  async initialize() {
    return { success: true };
  }

  /**
   * Get available products
   */
  async getProducts() {
    return {
      success: true,
      products: [
        {
          productId: 'com.yourapp.premium.monthly',
          title: 'Premium Monthly',
          description: 'Premium features subscription, billed monthly',
          price: '$4.99',
          currency: 'USD',
          localizedPrice: '$4.99',
        },
        {
          productId: 'com.yourapp.premium.yearly',
          title: 'Premium Yearly',
          description: 'Premium features subscription, billed yearly',
          price: '$49.99',
          currency: 'USD',
          localizedPrice: '$49.99',
        }
      ]
    };
  }

  /**
   * Purchase a product
   */
  async purchaseProduct() {
    return {
      success: false,
      message: 'In-app purchases are not available in the web version'
    };
  }

  /**
   * Restore purchases
   */
  async restorePurchases() {
    return {
      success: false,
      message: 'In-app purchases are not available in the web version'
    };
  }
}

export default new IOSSubscriptionHandler();