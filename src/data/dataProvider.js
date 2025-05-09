// src/data/dataProvider.js
const config = require('../config/config');
const inMemoryProvider = require('./inMemoryProvider');
const mongoProvider = require('./mongoProvider');

// Determine which provider to use based on config
const getProvider = () => {
  if (config.useDatabase === 'mongodb') {
    return mongoProvider;
  }
  return inMemoryProvider;
};

// Export the selected provider's methods
const provider = getProvider();

module.exports = provider;