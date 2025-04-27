// src/utils/packingUtils.js

/**
 * Utility functions for packing list recommendations and management
 */

/**
 * Generate packing recommendations based on destination, trip duration, and weather
 * 
 * @param {string} destination - The trip destination
 * @param {number} duration - Trip duration in days
 * @param {Object} weatherData - Weather forecast data
 * @param {string} tripType - Type of trip (leisure, business, adventure, etc.)
 * @returns {Array} Array of packing categories with recommended items
 */
export function getPackingRecommendations(destination, duration, weatherData, tripType = 'leisure') {
    // Base items everyone needs regardless of destination
    const baseRecommendations = [
      {
        id: 'essentials',
        name: 'Essentials',
        icon: '⭐',
        items: [
          { name: 'Passport/ID', essential: true },
          { name: 'Wallet', essential: true },
          { name: 'Phone', essential: true },
          { name: 'Phone charger', essential: true },
          { name: 'Travel insurance documents', essential: true },
          { name: 'Cash/credit cards', essential: true },
          { name: 'House keys', essential: true },
        ]
      },
      {
        id: 'clothing',
        name: 'Clothing',
        icon: '👕',
        items: [
          { name: 'Underwear', essential: true, quantity: duration },
          { name: 'Socks', essential: true, quantity: duration },
          { name: 'T-shirts', essential: true, quantity: Math.ceil(duration / 2) },
          { name: 'Pants/shorts', essential: true, quantity: Math.ceil(duration / 3) },
          { name: 'Sleepwear', essential: false },
          { name: 'Belt', essential: false },
        ]
      },
      {
        id: 'toiletries',
        name: 'Toiletries',
        icon: '🧴',
        items: [
          { name: 'Toothbrush', essential: true },
          { name: 'Toothpaste', essential: true },
          { name: 'Deodorant', essential: true },
          { name: 'Shampoo', essential: false },
          { name: 'Soap/shower gel', essential: false },
          { name: 'Razor', essential: false },
          { name: 'Hairbrush/comb', essential: false },
        ]
      },
      {
        id: 'electronics',
        name: 'Electronics',
        icon: '📱',
        items: [
          { name: 'Camera', essential: false },
          { name: 'Headphones', essential: false },
          { name: 'Travel adapter', essential: false },
          { name: 'Power bank', essential: false },
        ]
      },
      {
        id: 'medications',
        name: 'Medications',
        icon: '💊',
        items: [
          { name: 'Personal medications', essential: true },
          { name: 'Pain relievers', essential: false },
          { name: 'Band-aids', essential: false },
          { name: 'Antidiarrheals', essential: false },
          { name: 'Motion sickness pills', essential: false },
        ]
      }
    ];
    
    // Climate-specific items
    let climateItems = [];
    
    if (weatherData) {
      // Hot weather items
      if (weatherData.avgTemp > 25) {
        climateItems.push(
          { category: 'clothing', name: 'Sunglasses', essential: true },
          { category: 'clothing', name: 'Hat or cap', essential: true },
          { category: 'clothing', name: 'Sandals', essential: false },
          { category: 'clothing', name: 'Swimwear', essential: false },
          { category: 'toiletries', name: 'Sunscreen', essential: true },
          { category: 'toiletries', name: 'After-sun lotion', essential: false },
          { category: 'accessories', name: 'Portable fan', essential: false }
        );
      }
      
      // Cold weather items
      if (weatherData.avgTemp < 15) {
        climateItems.push(
          { category: 'clothing', name: 'Winter coat', essential: true },
          { category: 'clothing', name: 'Sweaters/jumpers', essential: true },
          { category: 'clothing', name: 'Thermal underwear', essential: false },
          { category: 'clothing', name: 'Gloves', essential: true },
          { category: 'clothing', name: 'Scarf', essential: false },
          { category: 'clothing', name: 'Winter hat', essential: true },
          { category: 'clothing', name: 'Warm socks', essential: true }
        );
      }
      
      // Rainy weather items
      if (weatherData.rainfall === 'high' || weatherData.conditions.includes('rain')) {
        climateItems.push(
          { category: 'clothing', name: 'Rain jacket', essential: true },
          { category: 'clothing', name: 'Waterproof shoes', essential: true },
          { category: 'accessories', name: 'Umbrella', essential: true },
          { category: 'accessories', name: 'Waterproof bag cover', essential: false }
        );
      }
      
      // Humid weather
      if (weatherData.conditions === 'humid') {
        climateItems.push(
          { category: 'clothing', name: 'Lightweight clothes', essential: true },
          { category: 'toiletries', name: 'Anti-humidity hair product', essential: false },
          { category: 'toiletries', name: 'Mosquito repellent', essential: true }
        );
      }
    }
    
    // Trip type specific items
    let tripTypeItems = [];
    
    switch (tripType.toLowerCase()) {
      case 'business':
        tripTypeItems.push(
          { category: 'clothing', name: 'Business suits', essential: true },
          { category: 'clothing', name: 'Formal shoes', essential: true },
          { category: 'clothing', name: 'Ties/Scarves', essential: false },
          { category: 'electronics', name: 'Laptop', essential: true },
          { category: 'electronics', name: 'Laptop charger', essential: true },
          { category: 'documents', name: 'Business cards', essential: false },
          { category: 'documents', name: 'Notebook', essential: false },
          { category: 'documents', name: 'Presentation materials', essential: false }
        );
        break;
        
      case 'beach':
        tripTypeItems.push(
          { category: 'clothing', name: 'Swimwear', essential: true },
          { category: 'clothing', name: 'Beach cover-up', essential: false },
          { category: 'clothing', name: 'Flip-flops', essential: true },
          { category: 'accessories', name: 'Beach towel', essential: false },
          { category: 'accessories', name: 'Beach bag', essential: false },
          { category: 'toiletries', name: 'Sunscreen', essential: true },
          { category: 'toiletries', name: 'After-sun lotion', essential: false }
        );
        break;
        
      case 'adventure':
      case 'hiking':
        tripTypeItems.push(
          { category: 'clothing', name: 'Hiking boots', essential: true },
          { category: 'clothing', name: 'Moisture-wicking shirts', essential: true },
          { category: 'clothing', name: 'Hiking pants/shorts', essential: true },
          { category: 'accessories', name: 'Backpack', essential: true },
          { category: 'accessories', name: 'Water bottle', essential: true },
          { category: 'accessories', name: 'Flashlight/headlamp', essential: true },
          { category: 'accessories', name: 'Multi-tool', essential: false },
          { category: 'toiletries', name: 'Insect repellent', essential: true },
          { category: 'toiletries', name: 'Sunscreen', essential: true }
        );
        break;
        
      case 'winter':
      case 'ski':
        tripTypeItems.push(
          { category: 'clothing', name: 'Ski jacket', essential: true },
          { category: 'clothing', name: 'Ski pants', essential: true },
          { category: 'clothing', name: 'Thermal base layers', essential: true },
          { category: 'clothing', name: 'Thick socks', essential: true },
          { category: 'clothing', name: 'Gloves', essential: true },
          { category: 'clothing', name: 'Winter hat', essential: true },
          { category: 'accessories', name: 'Ski goggles', essential: true },
          { category: 'toiletries', name: 'Lip balm', essential: true },
          { category: 'toiletries', name: 'Moisturizer', essential: true }
        );
        break;
    }
    
    // Destination-specific items
    let destinationItems = [];
    
    // Parse destination to extract potential country/region
    const destinationLower = destination.toLowerCase();
    
    // Beach or tropical destination
    if (destinationLower.includes('beach') || 
        destinationLower.includes('hawaii') ||
        destinationLower.includes('bali') ||
        destinationLower.includes('caribbean')) {
      destinationItems.push(
        { category: 'clothing', name: 'Swimwear', essential: true },
        { category: 'clothing', name: 'Sandals', essential: true },
        { category: 'toiletries', name: 'Sunscreen', essential: true },
        { category: 'accessories', name: 'Beach towel', essential: false }
      );
    }
    
    // Urban/city trip
    if (destinationLower.includes('city') ||
        destinationLower.includes('new york') ||
        destinationLower.includes('paris') ||
        destinationLower.includes('london') ||
        destinationLower.includes('tokyo')) {
      destinationItems.push(
        { category: 'clothing', name: 'Comfortable walking shoes', essential: true },
        { category: 'accessories', name: 'Day bag/backpack', essential: true },
        { category: 'electronics', name: 'Camera', essential: false },
        { category: 'documents', name: 'City map/guide', essential: false }
      );
    }
    
    // Merge all item recommendations and group by category
    const allItems = [
      ...climateItems,
      ...tripTypeItems,
      ...destinationItems
    ];
    
    // Create a deep copy of baseRecommendations
    const recommendations = JSON.parse(JSON.stringify(baseRecommendations));
    
    // Additional categories that might not be in base recommendations
    const additionalCategories = [
      { id: 'accessories', name: 'Accessories', icon: '👓' },
      { id: 'documents', name: 'Documents', icon: '📄' },
      { id: 'misc', name: 'Miscellaneous', icon: '🔮' }
    ];
    
    // Add any missing categories to recommendations
    additionalCategories.forEach(category => {
      if (!recommendations.some(rec => rec.id === category.id)) {
        recommendations.push({
          id: category.id,
          name: category.name,
          icon: category.icon,
          items: []
        });
      }
    });
    
    // Add all specific items to appropriate categories
    allItems.forEach(item => {
      const category = recommendations.find(cat => cat.id === item.category);
      if (category) {
        // Check if item already exists in the category
        if (!category.items.some(existingItem => existingItem.name === item.name)) {
          category.items.push({
            name: item.name,
            essential: item.essential
          });
        }
      }
    });
    
    // Sort by essential first within each category
    recommendations.forEach(category => {
      category.items.sort((a, b) => {
        if (a.essential && !b.essential) return -1;
        if (!a.essential && b.essential) return 1;
        return a.name.localeCompare(b.name);
      });
    });
    
    return recommendations;
  }
  
  /**
   * Calculate the optimal number of clothing items based on trip duration
   * 
   * @param {number} duration - Trip duration in days
   * @returns {Object} Recommended quantities for different clothing items
   */
  export function calculateClothingQuantities(duration) {
    return {
      underwear: duration,
      socks: duration,
      shirts: Math.ceil(duration / 2),
      pants: Math.ceil(duration / 3),
      dressShirts: Math.ceil(duration / 2), // For business trips
      formalOutfits: Math.ceil(duration / 3)  // For business trips
    };
  }
  
  /**
   * Check if a destination is likely to be international
   * (simplified implementation - would be more comprehensive in a real app)
   *
   * @param {string} destination - The trip destination
   * @returns {boolean} Whether the destination is likely international
   */
  export function isInternationalDestination(destination) {
    // List of countries (partial)
    const countries = [
      'france', 'italy', 'spain', 'germany', 'japan', 'china', 'australia',
      'canada', 'mexico', 'brazil', 'argentina', 'thailand', 'vietnam',
      'indonesia', 'india', 'russia', 'south africa', 'egypt', 'morocco',
      'united kingdom', 'ireland', 'greece', 'portugal', 'netherlands'
    ];
    
    // Check if any country name appears in the destination
    const destinationLower = destination.toLowerCase();
    return countries.some(country => destinationLower.includes(country));
  }
  
  /**
   * Generate document recommendations based on destination
   * 
   * @param {string} destination - The trip destination
   * @returns {Array} Recommended documents
   */
  export function getDocumentRecommendations(destination) {
    const isInternational = isInternationalDestination(destination);
    
    const baseDocuments = [
      { name: 'ID/Driver\'s License', essential: true },
      { name: 'Credit/Debit Cards', essential: true },
      { name: 'Travel Insurance Info', essential: true },
      { name: 'Emergency Contact List', essential: true },
      { name: 'Hotel Reservation', essential: true },
      { name: 'Transportation Tickets', essential: true },
    ];
    
    if (isInternational) {
      return [
        ...baseDocuments,
        { name: 'Passport', essential: true },
        { name: 'Visa Documentation', essential: true },
        { name: 'International Driver\'s Permit', essential: false },
        { name: 'Vaccination Records', essential: false },
        { name: 'Currency Exchange Info', essential: false },
        { name: 'Embassy Contact Info', essential: false },
        { name: 'Travel Adapter Info', essential: false },
      ];
    }
    
    return baseDocuments;
  }