// server/services/stripeService.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config');

/**
 * Service for Stripe payment processing
 */
class StripeService {
  /**
   * Create a Stripe checkout session for subscription purchase
   */
  async createCheckoutSession({ email, priceId, successUrl, cancelUrl }) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          product_type: 'subscription',
        },
      });
      
      return session;
    } catch (error) {
      console.error('Failed to create Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Retrieve a checkout session
   */
  async retrieveCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'customer'],
      });
      
      return session;
    } catch (error) {
      console.error('Failed to retrieve Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const canceledSubscription = await stripe.subscriptions.del(subscriptionId);
      return { success: true, subscription: canceledSubscription };
    } catch (error) {
      console.error('Failed to cancel Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event) {
    const eventType = event.type;
    
    switch (eventType) {
      case 'checkout.session.completed':
        // Handle successful checkout
        const session = event.data.object;
        console.log('Checkout completed:', session.id);
        return { handled: true, type: 'checkout.completed' };
        
      case 'customer.subscription.updated':
        // Handle subscription update (renewal, plan change)
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        return { handled: true, type: 'subscription.updated' };
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const deletedSubscription = event.data.object;
        console.log('Subscription canceled:', deletedSubscription.id);
        return { handled: true, type: 'subscription.canceled' };
        
      case 'invoice.payment_failed':
        // Handle failed payment
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        return { handled: true, type: 'payment.failed' };
        
      default:
        // Unhandled event type
        console.log('Unhandled event type:', eventType);
        return { handled: false, type: eventType };
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      return { valid: true, event };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new StripeService();