// src/data/mongoProvider.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const UserModel = require('../models/User');
const SubscriptionModel = require('../models/Subscription');

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (config.useDatabase === 'mongodb') {
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected...');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Connect when this module is loaded
if (config.useDatabase === 'mongodb') {
  connectDB();
}

// User methods
const userMethods = {
  async findById(id) {
    try {
      const user = await UserModel.findById(id).select('-__v');
      return user ? user.toObject() : null;
    } catch (err) {
      console.error('Error finding user by ID:', err);
      return null;
    }
  },
  
  async findByEmail(email) {
    try {
      const user = await UserModel.findOne({ email }).select('-__v');
      return user ? user.toObject() : null;
    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  },
  
  async create(userData) {
    try {
      // Check if user exists
      let user = await UserModel.findOne({ email: userData.email });
      
      if (user) {
        throw new Error('User already exists');
      }
      
      // Create new user
      user = new UserModel({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      
      await user.save();
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  },
  
  async update(id, updates) {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update fields
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email;
      
      await user.save();
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  },
  
  async changePassword(id, newPassword) {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      throw err;
    }
  },
  
  async comparePassword(userId, candidatePassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) return false;
      
      return bcrypt.compare(candidatePassword, user.password);
    } catch (err) {
      console.error('Error comparing password:', err);
      return false;
    }
  }
};

// Subscription methods
const subscriptionMethods = {
  async findByUserId(userId) {
    try {
      const subscription = await SubscriptionModel.findOne({ userId }).select('-__v');
      return subscription ? subscription.toObject() : null;
    } catch (err) {
      console.error('Error finding subscription:', err);
      return null;
    }
  },
  
  async create(subscriptionData) {
    try {
      // Check if subscription already exists
      let subscription = await SubscriptionModel.findOne({ userId: subscriptionData.userId });
      
      if (subscription) {
        // Update existing subscription
        subscription.plan = subscriptionData.plan;
        subscription.startDate = subscriptionData.startDate || new Date();
        subscription.endDate = subscriptionData.endDate;
        subscription.status = 'active';
        subscription.features = this.getFeaturesForPlan(subscriptionData.plan);
      } else {
        // Create new subscription
        subscription = new SubscriptionModel({
          userId: subscriptionData.userId,
          plan: subscriptionData.plan,
          startDate: subscriptionData.startDate || new Date(),
          endDate: subscriptionData.endDate,
          status: 'active',
          features: this.getFeaturesForPlan(subscriptionData.plan)
        });
      }
      
      await subscription.save();
      return subscription.toObject();
    } catch (err) {
      console.error('Error creating subscription:', err);
      throw err;
    }
  },
  
  async update(id, updates) {
    try {
      const subscription = await SubscriptionModel.findById(id);
      
      if (!subscription) {
        return null;
      }
      
      // Update fields
      Object.keys(updates).forEach(key => {
        subscription[key] = updates[key];
      });
      
      await subscription.save();
      return subscription.toObject();
    } catch (err) {
      console.error('Error updating subscription:', err);
      throw err;
    }
  },
  
  async cancel(id) {
    try {
      const subscription = await SubscriptionModel.findById(id);
      
      if (!subscription) {
        return false;
      }
      
      subscription.status = 'cancelled';
      await subscription.save();
      
      return true;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      throw err;
    }
  },
  
  getFeaturesForPlan(plan) {
    switch (plan) {
      case 'free':
        return {
          dealAlerts: 3,
          destinations: 2,
          customAlerts: false,
          adFree: false
        };
      case 'monthly':
      case 'yearly':
      case 'premium':
        return {
          dealAlerts: -1, // unlimited
          destinations: -1, // unlimited
          customAlerts: true,
          adFree: true
        };
      default:
        return {
          dealAlerts: 0,
          destinations: 0,
          customAlerts: false,
          adFree: false
        };
    }
  }
};

module.exports = {
  user: userMethods,
  subscription: subscriptionMethods
};