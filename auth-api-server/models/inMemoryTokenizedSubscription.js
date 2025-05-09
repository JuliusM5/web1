// src/models/inMemoryTokenizedSubscription.js
const crypto = require('crypto');

// In-memory subscription storage
const subscriptions = [];

class TokenizedSubscription {
  static async create(subscriptionData) {
    // Generate tokens
    const accessToken = this.generateToken();
    const mobileAccessCode = this.generateMobileAccessCode();
    
    // Create subscription
    const newSubscription = {
      id: Date.now().toString(),
      email: subscriptionData.email,
      accessToken,
      mobileAccessCode,
      plan: subscriptionData.plan,
      startDate: new Date(),
      expiresAt: subscriptionData.expiresAt || this.calculateExpiryDate(subscriptionData.plan),
      paymentId: subscriptionData.paymentId,
      active: true,
      createdAt: new Date()
    };
    
    subscriptions.push(newSubscription);
    
    // Return the created subscription
    return {
      ...newSubscription,
      success: true
    };
  }
  
  static async findByToken(token) {
    return subscriptions.find(sub => sub.accessToken === token);
  }
  
  static async findByMobileCode(code) {
    return subscriptions.find(sub => sub.mobileAccessCode === code);
  }
  
  static async findByEmail(email) {
    return subscriptions.filter(sub => sub.email === email);
  }
  
  static async verifyToken(token) {
    const subscription = await this.findByToken(token);
    
    if (!subscription) {
      return { valid: false };
    }
    
    // Check if subscription is active and not expired
    const isValid = subscription.active && new Date(subscription.expiresAt) > new Date();
    
    return {
      valid: isValid,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt
    };
  }
  
  static async verifyMobileCode(code) {
    const subscription = await this.findByMobileCode(code);
    
    if (!subscription) {
      return { valid: false };
    }
    
    // Check if subscription is active and not expired
    const isValid = subscription.active && new Date(subscription.expiresAt) > new Date();
    
    return {
      valid: isValid,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      accessToken: subscription.accessToken
    };
  }
  
  static async cancelSubscription(token) {
    const index = subscriptions.findIndex(sub => sub.accessToken === token);
    
    if (index === -1) {
      return { success: false, error: 'Subscription not found' };
    }
    
    // Mark as canceled but don't remove
    subscriptions[index].active = false;
    
    return { success: true };
  }
  
  // Helper methods
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  static generateMobileAccessCode() {
    // Create a code that's easy to type and read
    // Format: XXXX-XXXX-XXXX
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
    let code = '';
    
    // Generate 12 characters
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
      
      // Add dashes after every 4 characters (except at the end)
      if ((i + 1) % 4 === 0 && i < 11) {
        code += '-';
      }
    }
    
    return code;
  }
  
  static calculateExpiryDate(plan) {
    const now = new Date();
    
    switch (plan) {
      case 'monthly_premium':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'yearly_premium':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        // Default to 1 month if plan is unknown
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }
  
  // For testing/development, method to get all subscriptions
  static getAll() {
    return subscriptions;
  }
}

module.exports = TokenizedSubscription;