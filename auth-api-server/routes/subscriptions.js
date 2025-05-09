// server/routes/subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const subscriptionService = require('../services/subscriptionService');

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { email, priceId, successUrl, cancelUrl } = req.body;
    
    const session = await stripeService.createCheckoutSession({
      email,
      priceId,
      successUrl,
      cancelUrl
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify a completed session
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve the session from Stripe
    const session = await stripeService.retrieveCheckoutSession(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Payment not completed' });
    }
    
    // Get the plan from the session
    const planId = session.metadata.plan_id || 'monthly_premium';
    
    // Create a subscription in your system
    const subscription = await subscriptionService.createSubscription(
      session.customer_email,
      planId,
      session.id
    );
    
    if (!subscription.success) {
      throw new Error(subscription.error || 'Failed to create subscription');
    }
    
    res.json({
      success: true,
      accessToken: subscription.accessToken,
      mobileAccessCode: subscription.mobileAccessCode,
      expiresAt: subscription.expiresAt,
      plan: planId
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ success: false, error: 'Failed to verify subscription' });
  }
});

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const verification = stripeService.verifyWebhookSignature(
      req.body,
      signature
    );
    
    if (!verification.valid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const result = await stripeService.handleWebhookEvent(verification.event);
    
    res.json({ received: true, handled: result.handled });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;