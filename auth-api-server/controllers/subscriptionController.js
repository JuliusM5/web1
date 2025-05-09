// src/controllers/subscriptionController.js
const dataProvider = require('../data/dataProvider');

// Get subscription status for a user
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await dataProvider.subscription.findByUserId(req.user.id);
    
    // If no subscription exists, return a free plan
    if (!subscription) {
      return res.json({
        isActive: false,
        plan: 'free',
        expiresAt: null,
        freeAlertsUsed: 0,
        freeAlertsLimit: 3
      });
    }
    
    // Format the response to match what the frontend expects
    res.json({
      isActive: subscription.status === 'active',
      plan: subscription.plan,
      expiresAt: subscription.endDate,
      freeAlertsUsed: subscription.plan === 'free' ? 0 : 0,
      freeAlertsLimit: subscription.plan === 'free' ? 3 : Infinity
    });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update a subscription
exports.createSubscription = async (req, res) => {
  const { planId, paymentMethod } = req.body;
  
  try {
    // Calculate end date based on plan
    const startDate = new Date();
    const endDate = new Date();
    
    if (planId === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planId === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Create or update subscription
    const subscription = await dataProvider.subscription.create({
      userId: req.user.id,
      plan: planId,
      startDate,
      endDate,
      paymentMethod
    });
    
    // Format response for frontend
    res.json({
      isActive: true,
      plan: subscription.plan,
      expiresAt: subscription.endDate,
      paymentMethod
    });
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await dataProvider.subscription.findByUserId(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    await dataProvider.subscription.cancel(subscription.id);
    
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Use a free alert
exports.useFreeAlert = async (req, res) => {
  try {
    // Get current subscription
    const subscription = await dataProvider.subscription.findByUserId(req.user.id);
    
    // If paid plan, unlimited alerts
    if (subscription && subscription.status === 'active' && subscription.plan !== 'free') {
      return res.json({
        success: true,
        freeAlertsUsed: 0,
        freeAlertsLimit: Infinity
      });
    }
    
    // For free plan or no subscription
    // In a real app, you would track alert usage
    // Here we'll just return a mock response
    res.json({
      success: true,
      freeAlertsUsed: 1,
      freeAlertsLimit: 3
    });
  } catch (err) {
    console.error('Use free alert error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    // In a real app, you would fetch payment methods from a payment processor
    // Here we'll just return an empty array
    res.json({
      paymentMethods: []
    });
  } catch (err) {
    console.error('Get payment methods error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    // In a real app, you would add a payment method to a payment processor
    // Here we'll just return a mock response
    res.json({
      success: true,
      paymentMethod: {
        id: 'pm_mock_' + Date.now(),
        type: 'card',
        last4: '4242'
      }
    });
  } catch (err) {
    console.error('Add payment method error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscription history
exports.getSubscriptionHistory = async (req, res) => {
  try {
    // In a real app, you would fetch subscription history from a database
    // Here we'll just return an empty array
    res.json({
      history: []
    });
  } catch (err) {
    console.error('Get subscription history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply promo code
exports.applyPromoCode = async (req, res) => {
  const { code } = req.body;
  
  try {
    // In a real app, you would validate the promo code against a database
    // Here we'll just check for a hardcoded value
    if (code === 'DISCOUNT20') {
      res.json({
        valid: true,
        discount: 20,
        message: '20% discount applied!'
      });
    } else {
      res.status(400).json({
        valid: false,
        message: 'Invalid promo code'
      });
    }
  } catch (err) {
    console.error('Apply promo code error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};