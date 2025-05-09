// src/middleware/subscriptionAuth.js

/**
 * Middleware to verify subscription token for access to premium features
 * This replaces the traditional authentication middleware
 */
const TokenizedSubscription = require('../../src/models/TokenizedSubscription');
// Or use the in-memory version for development
// const TokenizedSubscription = require('../models/inMemoryTokenizedSubscription');

module.exports = async function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      message: 'No subscription token, premium access denied',
      requiresSubscription: true 
    });
  }
  
  try {
    // Verify token with subscription service
    const verification = await TokenizedSubscription.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(401).json({ 
        message: 'Subscription token is expired or invalid',
        requiresSubscription: true 
      });
    }
    
    // Add subscription info to request object
    req.subscription = {
      plan: verification.plan,
      expiresAt: verification.expiresAt
    };
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ message: 'Subscription verification failed' });
  }
};