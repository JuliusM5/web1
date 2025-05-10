// src/data/inMemoryProvider.js
// Simple in-memory storage without any external dependencies

// In-memory storage using localStorage for persistence
const STORAGE_KEY = 'subscription_data';

// Initialize or load existing data
const loadData = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : { subscriptions: [] };
  } catch (e) {
    console.error('Error loading data from localStorage:', e);
    return { subscriptions: [] };
  }
};

// Save data to localStorage
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data to localStorage:', e);
  }
};

// Generate a simple random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Generate an access code
const generateAccessCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) {
      code += '-';
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

const inMemoryProvider = {
  // Subscription methods
  async createSubscription(subscriptionData) {
    try {
      const data = loadData();
      
      // Generate an ID and access code if not provided
      const id = subscriptionData.id || generateId();
      const accessCode = subscriptionData.accessCode || generateAccessCode();
      
      const newSubscription = {
        ...subscriptionData,
        id,
        accessCode,
        createdAt: subscriptionData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.subscriptions.push(newSubscription);
      saveData(data);
      
      return { ...newSubscription };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async getSubscriptionByAccessCode(accessCode) {
    try {
      const data = loadData();
      const subscription = data.subscriptions.find(sub => sub.accessCode === accessCode);
      return subscription ? { ...subscription } : null;
    } catch (error) {
      console.error('Error finding subscription by access code:', error);
      throw error;
    }
  },

  async getSubscriptionByTransactionId(transactionId) {
    try {
      const data = loadData();
      const subscription = data.subscriptions.find(sub => 
        sub.originalTransactionId === transactionId
      );
      return subscription ? { ...subscription } : null;
    } catch (error) {
      console.error('Error finding subscription by transaction ID:', error);
      throw error;
    }
  },

  async updateSubscription(accessCode, updates) {
    try {
      const data = loadData();
      const index = data.subscriptions.findIndex(sub => sub.accessCode === accessCode);
      
      if (index === -1) {
        throw new Error('Subscription not found');
      }
      
      // Update the subscription
      const updatedSubscription = {
        ...data.subscriptions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      data.subscriptions[index] = updatedSubscription;
      saveData(data);
      
      return { ...updatedSubscription };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async activateSubscriptionOnDevice(accessCode, deviceId, platform) {
    try {
      const subscription = await this.getSubscriptionByAccessCode(accessCode);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Initialize activations array if it doesn't exist
      if (!subscription.activations) {
        subscription.activations = [];
      }
      
      // Check if maximum activations reached
      if (subscription.activations.length >= (subscription.maxActivations || 3)) {
        throw new Error('Maximum device activations reached');
      }
      
      // Check if device is already activated
      const isDeviceActivated = subscription.activations.some(a => a.deviceId === deviceId);
      
      if (!isDeviceActivated) {
        subscription.activations.push({
          deviceId,
          platform,
          activatedAt: new Date().toISOString()
        });
      }
      
      // Update the subscription
      return await this.updateSubscription(accessCode, {
        activations: subscription.activations
      });
    } catch (error) {
      console.error('Error activating subscription on device:', error);
      throw error;
    }
  },

  async deactivateSubscriptionOnDevice(accessCode, deviceId) {
    try {
      const subscription = await this.getSubscriptionByAccessCode(accessCode);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Filter out the device
      const activations = (subscription.activations || []).filter(a => a.deviceId !== deviceId);
      
      // Update the subscription
      return await this.updateSubscription(accessCode, {
        activations
      });
    } catch (error) {
      console.error('Error deactivating subscription on device:', error);
      throw error;
    }
  },

  async getAllSubscriptions() {
    try {
      const data = loadData();
      return [...data.subscriptions];
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      throw error;
    }
  },

  async getActiveSubscriptions() {
    try {
      const data = loadData();
      return data.subscriptions.filter(sub => sub.status === 'active');
    } catch (error) {
      console.error('Error getting active subscriptions:', error);
      throw error;
    }
  },

  // For development/testing only
  _clearSubscriptions() {
    saveData({ subscriptions: [] });
  }
};

export default inMemoryProvider;