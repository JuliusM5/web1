// src/config/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  useDatabase: process.env.USE_DATABASE || 'memory', // 'memory' or 'mongodb'
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/auth-api',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  refreshSecret: process.env.REFRESH_SECRET || 'your_refresh_secret_key',
  jwtExpiration: '1h',
  refreshExpiration: '7d'
};