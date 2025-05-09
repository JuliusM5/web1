// src/utils/premiumFeatures.js

/**
 * Utility for managing premium features and access
 */
const premiumFeatures = {
  // Feature definitions with access requirements
  features: {
    // Flight features - premium with limits
    flight_search: {
      id: 'flight_search',
      name: 'Flight Search',
      description: 'Search for flights across multiple airlines',
      freeTier: {
        enabled: true,
        limit: 3,
        limitType: 'signals_per_month'
      },
      category: 'flights'
    },
    flight_alerts: {
      id: 'flight_alerts',
      name: 'Flight Deal Alerts',
      description: 'Get notified when flight prices drop for your favorite destinations',
      freeTier: {
        enabled: false
      },
      category: 'flights'
    },
    price_prediction: {
      id: 'price_prediction',
      name: 'Price Prediction',
      description: 'Get AI-powered predictions on the best time to book',
      freeTier: {
        enabled: false
      },
      category: 'flights'
    },
    fare_comparison: {
      id: 'fare_comparison',
      name: 'Fare Comparison',
      description: 'Compare fares across different airlines and booking sites',
      freeTier: {
        enabled: false
      },
      category: 'flights'
    },
    trip_templates: {
      id: 'trip_templates',
      name: 'Trip Templates',
      description: 'Save and reuse your favorite trip plans',
      freeTier: {
        enabled: false
      },
      category: 'trip_planning'
    },
    enhanced_budget: {
      id: 'enhanced_budget',
      name: 'Enhanced Budget Tools',
      description: 'Advanced budget tracking and expense categorization',
      freeTier: {
        enabled: false
      },
      category: 'budget'
    },
  
    
    // Flight features
    flight_alerts: {
      id: 'flight_alerts',
      name: 'Flight Deal Alerts',
      description: 'Get notified when flight prices drop',
      freeTier: {
        enabled: false
      },
      category: 'flights'
    },
    flight_search: {
      id: 'flight_search',
      name: 'Flight Search',
      description: 'Search for flights across multiple airlines',
      freeTier: {
        enabled: true,
        limit: 3,
        limitType: 'uses_per_day'
      },
      category: 'flights'
    },
    
    // Budget features
    budget_tracking: {
      id: 'budget_tracking',
      name: 'Enhanced Budget Tracking',
      description: 'Track and analyze your travel expenses',
      freeTier: {
        enabled: false
      },
      category: 'budget'
    },
    expense_reports: {
      id: 'expense_reports',
      name: 'Expense Reports',
      description: 'Generate detailed reports of your travel expenses',
      freeTier: {
        enabled: false
      },
      category: 'budget'
    }
  },
  
  /**
   * Check if a user has access to a premium feature
   * @param {string} featureId - The ID of the feature to check
   * @param {Object} options - Access check options
   * @param {boolean} options.isSubscribed - Whether the user is subscribed
   * @param {number} options.usageCount - Current usage count for limited features
   * @returns {Object} Access result
   */
  checkAccess(featureId, options = {}) {
    const { isSubscribed = false, usageCount = 0 } = options;
    
    // If subscribed, always grant access
    if (isSubscribed) {
      return {
        hasAccess: true,
        reason: 'subscribed'
      };
    }
    
    // Get feature config
    const feature = this.features[featureId];
    if (!feature) {
      return {
        hasAccess: false,
        reason: 'feature_not_found'
      };
    }
    
    // Check if feature has free tier
    if (!feature.freeTier.enabled) {
      return {
        hasAccess: false,
        reason: 'premium_only'
      };
    }
    
    // Check usage limits for free tier
    if (feature.freeTier.limitType === 'count' && usageCount >= feature.freeTier.limit) {
      return {
        hasAccess: false,
        reason: 'limit_reached',
        limit: feature.freeTier.limit,
        current: usageCount
      };
    }
    
    // Access granted for free tier
    return {
      hasAccess: true,
      reason: 'free_tier',
      limit: feature.freeTier.limit,
      current: usageCount
    };
  },
  
  /**
   * Get all features in a specific category
   * @param {string} category - Category to filter by
   * @returns {Array} Features in the category
   */
  getFeaturesByCategory(category) {
    return Object.values(this.features)
      .filter(feature => feature.category === category);
  },
  
  /**
   * Get all available premium features
   * @returns {Array} All premium features
   */
  getAllFeatures() {
    return Object.values(this.features);
  }
};

export default premiumFeatures;