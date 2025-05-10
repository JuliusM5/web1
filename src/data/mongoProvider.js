// src/data/mongoProvider.js
// This is a browser-compatible version that communicates with a MongoDB backend via API

import ApiClient from '../services/ApiClient';

const mongoProvider = {
  // Subscription methods
  async createSubscription(subscriptionData) {
    try {
      const response = await ApiClient.post('/api/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async getSubscriptionByAccessCode(accessCode) {
    try {
      const response = await ApiClient.get(`/api/subscriptions/code/${accessCode}`);
      return response.data;
    } catch (error) {
      console.error('Error finding subscription by access code:', error);
      throw error;
    }
  },

  async getSubscriptionByTransactionId(transactionId) {
    try {
      const response = await ApiClient.get(`/api/subscriptions/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error finding subscription by transaction ID:', error);
      throw error;
    }
  },

  async updateSubscription(accessCode, updates) {
    try {
      const response = await ApiClient.put(`/api/subscriptions/code/${accessCode}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async activateSubscriptionOnDevice(accessCode, deviceId, platform) {
    try {
      const response = await ApiClient.post(`/api/subscriptions/code/${accessCode}/activate`, {
        deviceId,
        platform
      });
      return response.data;
    } catch (error) {
      console.error('Error activating subscription on device:', error);
      throw error;
    }
  },

  async deactivateSubscriptionOnDevice(accessCode, deviceId) {
    try {
      const response = await ApiClient.post(`/api/subscriptions/code/${accessCode}/deactivate`, {
        deviceId
      });
      return response.data;
    } catch (error) {
      console.error('Error deactivating subscription on device:', error);
      throw error;
    }
  },

  async getAllSubscriptions() {
    try {
      const response = await ApiClient.get('/api/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      throw error;
    }
  },

  async getActiveSubscriptions() {
    try {
      const response = await ApiClient.get('/api/subscriptions?status=active');
      return response.data;
    } catch (error) {
      console.error('Error getting active subscriptions:', error);
      throw error;
    }
  }
};

export default mongoProvider;