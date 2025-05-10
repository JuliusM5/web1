// src/services/analyticsService.js
// Simple analytics service without external dependencies

class AnalyticsService {
  constructor() {
    this.events = [];
    this.userId = null;
    this.userProperties = {};
    this.MAX_EVENTS = 100; // Limit local storage
    this.STORAGE_KEY = 'analytics_events';
    
    // Load stored events
    this.loadEvents();
  }

  // Load events from local storage
  loadEvents() {
    try {
      const storedEvents = localStorage.getItem(this.STORAGE_KEY);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
      this.events = [];
    }
  }

  // Save events to local storage
  saveEvents() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  // Set user identification
  identify(userId, userProperties = {}) {
    this.userId = userId;
    this.userProperties = { ...userProperties };
    
    // Track identification event
    this.trackEvent('user_identified', {
      user_id: userId,
      ...userProperties
    });
    
    console.log(`User identified: ${userId}`, userProperties);
  }

  // Track an event
  trackEvent(eventName, eventProperties = {}) {
    // Create event object
    const event = {
      event_name: eventName,
      event_id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      properties: { ...eventProperties },
      user_properties: { ...this.userProperties }
    };
    
    // Add to events array
    this.events.unshift(event);
    
    // Keep events array at manageable size
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(0, this.MAX_EVENTS);
    }
    
    // Save to local storage
    this.saveEvents();
    
    // In production, send to server
    if (process.env.NODE_ENV === 'production') {
      this.sendEvent(event);
    }
    
    console.log(`[Analytics] ${eventName}`, eventProperties);
  }

  // Send event to server
  sendEvent(event) {
    try {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        // Don't wait for response
        keepalive: true
      }).catch(() => {
        // Ignore failures in analytics
      });
    } catch (error) {
      // Fail silently, analytics should never break the app
    }
  }

  // Subscription-specific tracking methods
  trackSubscriptionStarted(planId, price, platform, isNewUser = true) {
    this.trackEvent('subscription_started', {
      plan_id: planId,
      price,
      platform,
      is_new_user: isNewUser
    });
  }

  trackSubscriptionCancelled(planId, reason, daysSinceSubscribed) {
    this.trackEvent('subscription_cancelled', {
      plan_id: planId,
      reason,
      days_since_subscribed: daysSinceSubscribed
    });
  }

  trackSubscriptionRenewed(planId, renewalCount) {
    this.trackEvent('subscription_renewed', {
      plan_id: planId,
      renewal_count: renewalCount
    });
  }

  trackCodeActivated(platform, daysRemaining) {
    this.trackEvent('code_activated', {
      platform,
      days_remaining: daysRemaining
    });
  }

  trackPremiumFeatureUsed(featureName) {
    this.trackEvent('premium_feature_used', {
      feature_name: featureName
    });
  }

  trackSubscriptionPageView(source) {
    this.trackEvent('subscription_page_viewed', {
      source
    });
  }

  // Reset user data
  clearUserData() {
    this.userId = null;
    this.userProperties = {};
    console.log('User data cleared');
  }

  // For debugging - get all tracked events
  getEvents() {
    return [...this.events];
  }
}

export default new AnalyticsService();