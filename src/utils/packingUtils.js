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
 * @param {Function} t - Translation function from i18n
 * @returns {Array} Array of packing categories with recommended items
 */
export function getPackingRecommendations(destination, duration, weatherData, tripType = 'leisure', t = key => key) {
  // Base items everyone needs regardless of destination
  const baseRecommendations = [
    {
      id: 'essentials',
      name: t('packing.categories.essentials', 'Essentials'),
      icon: '⭐',
      items: [
        { name: t('packing.items.passport', 'Passport/ID'), essential: true },
        { name: t('packing.items.wallet', 'Wallet'), essential: true },
        { name: t('packing.items.phone', 'Phone'), essential: true },
        { name: t('packing.items.phoneCharger', 'Phone charger'), essential: true },
        { name: t('packing.items.travelInsurance', 'Travel insurance documents'), essential: true },
        { name: t('packing.items.cashCards', 'Cash/credit cards'), essential: true },
        { name: t('packing.items.houseKeys', 'House keys'), essential: true },
      ]
    },
    {
      id: 'clothing',
      name: t('packing.categories.clothing', 'Clothing'),
      icon: '👕',
      items: [
        { name: t('packing.items.underwear', 'Underwear'), essential: true, quantity: duration },
        { name: t('packing.items.socks', 'Socks'), essential: true, quantity: duration },
        { name: t('packing.items.tshirts', 'T-shirts'), essential: true, quantity: Math.ceil(duration / 2) },
        { name: t('packing.items.pants', 'Pants/shorts'), essential: true, quantity: Math.ceil(duration / 3) },
        { name: t('packing.items.sleepwear', 'Sleepwear'), essential: false },
        { name: t('packing.items.belt', 'Belt'), essential: false },
      ]
    },
    {
      id: 'toiletries',
      name: t('packing.categories.toiletries', 'Toiletries'),
      icon: '🧴',
      items: [
        { name: t('packing.items.toothbrush', 'Toothbrush'), essential: true },
        { name: t('packing.items.toothpaste', 'Toothpaste'), essential: true },
        { name: t('packing.items.deodorant', 'Deodorant'), essential: true },
        { name: t('packing.items.shampoo', 'Shampoo'), essential: false },
        { name: t('packing.items.soap', 'Soap/shower gel'), essential: false },
        { name: t('packing.items.razor', 'Razor'), essential: false },
        { name: t('packing.items.hairbrush', 'Hairbrush/comb'), essential: false },
      ]
    },
    {
      id: 'electronics',
      name: t('packing.categories.electronics', 'Electronics'),
      icon: '📱',
      items: [
        { name: t('packing.items.camera', 'Camera'), essential: false },
        { name: t('packing.items.headphones', 'Headphones'), essential: false },
        { name: t('packing.items.travelAdapter', 'Travel adapter'), essential: false },
        { name: t('packing.items.powerBank', 'Power bank'), essential: false },
      ]
    },
    {
      id: 'medications',
      name: t('packing.categories.medications', 'Medications'),
      icon: '💊',
      items: [
        { name: t('packing.items.personalMeds', 'Personal medications'), essential: true },
        { name: t('packing.items.painRelievers', 'Pain relievers'), essential: false },
        { name: t('packing.items.bandaids', 'Band-aids'), essential: false },
        { name: t('packing.items.antidiarrheals', 'Antidiarrheals'), essential: false },
        { name: t('packing.items.motionSickness', 'Motion sickness pills'), essential: false },
      ]
    }
  ];
  
  // Climate-specific items
  let climateItems = [];
  
  if (weatherData) {
    // Hot weather items
    if (weatherData.avgTemp > 25) {
      climateItems.push(
        { category: 'clothing', name: t('packing.items.sunglasses', 'Sunglasses'), essential: true },
        { category: 'clothing', name: t('packing.items.hatCap', 'Hat or cap'), essential: true },
        { category: 'clothing', name: t('packing.items.sandals', 'Sandals'), essential: false },
        { category: 'clothing', name: t('packing.items.swimwear', 'Swimwear'), essential: false },
        { category: 'toiletries', name: t('packing.items.sunscreen', 'Sunscreen'), essential: true },
        { category: 'toiletries', name: t('packing.items.afterSun', 'After-sun lotion'), essential: false },
        { category: 'accessories', name: t('packing.items.portableFan', 'Portable fan'), essential: false }
      );
    }
    
    // Cold weather items
    if (weatherData.avgTemp < 15) {
      climateItems.push(
        { category: 'clothing', name: t('packing.items.winterCoat', 'Winter coat'), essential: true },
        { category: 'clothing', name: t('packing.items.sweaters', 'Sweaters/jumpers'), essential: true },
        { category: 'clothing', name: t('packing.items.thermalUnderwear', 'Thermal underwear'), essential: false },
        { category: 'clothing', name: t('packing.items.gloves', 'Gloves'), essential: true },
        { category: 'clothing', name: t('packing.items.scarf', 'Scarf'), essential: false },
        { category: 'clothing', name: t('packing.items.winterHat', 'Winter hat'), essential: true },
        { category: 'clothing', name: t('packing.items.warmSocks', 'Warm socks'), essential: true }
      );
    }
    
    // Rainy weather items
    if (weatherData.rainfall === 'high' || weatherData.conditions.includes('rain')) {
      climateItems.push(
        { category: 'clothing', name: t('packing.items.rainJacket', 'Rain jacket'), essential: true },
        { category: 'clothing', name: t('packing.items.waterproofShoes', 'Waterproof shoes'), essential: true },
        { category: 'accessories', name: t('packing.items.umbrella', 'Umbrella'), essential: true },
        { category: 'accessories', name: t('packing.items.waterproofBagCover', 'Waterproof bag cover'), essential: false }
      );
    }
    
    // Humid weather
    if (weatherData.conditions === 'humid') {
      climateItems.push(
        { category: 'clothing', name: t('packing.items.lightweightClothes', 'Lightweight clothes'), essential: true },
        { category: 'toiletries', name: t('packing.items.antiHumidityHair', 'Anti-humidity hair product'), essential: false },
        { category: 'toiletries', name: t('packing.items.mosquitoRepellent', 'Mosquito repellent'), essential: true }
      );
    }
  }
  
  // Trip type specific items
  let tripTypeItems = [];
  
  switch (tripType.toLowerCase()) {
    case 'business':
      tripTypeItems.push(
        { category: 'clothing', name: t('packing.items.businessSuits', 'Business suits'), essential: true },
        { category: 'clothing', name: t('packing.items.formalShoes', 'Formal shoes'), essential: true },
        { category: 'clothing', name: t('packing.items.tiesScarves', 'Ties/Scarves'), essential: false },
        { category: 'electronics', name: t('packing.items.laptop', 'Laptop'), essential: true },
        { category: 'electronics', name: t('packing.items.laptopCharger', 'Laptop charger'), essential: true },
        { category: 'documents', name: t('packing.items.businessCards', 'Business cards'), essential: false },
        { category: 'documents', name: t('packing.items.notebook', 'Notebook'), essential: false },
        { category: 'documents', name: t('packing.items.presentationMaterials', 'Presentation materials'), essential: false }
      );
      break;
      
    case 'beach':
      tripTypeItems.push(
        { category: 'clothing', name: t('packing.items.swimwear', 'Swimwear'), essential: true },
        { category: 'clothing', name: t('packing.items.beachCoverUp', 'Beach cover-up'), essential: false },
        { category: 'clothing', name: t('packing.items.flipFlops', 'Flip-flops'), essential: true },
        { category: 'accessories', name: t('packing.items.beachTowel', 'Beach towel'), essential: false },
        { category: 'accessories', name: t('packing.items.beachBag', 'Beach bag'), essential: false },
        { category: 'toiletries', name: t('packing.items.sunscreen', 'Sunscreen'), essential: true },
        { category: 'toiletries', name: t('packing.items.afterSun', 'After-sun lotion'), essential: false }
      );
      break;
      
    case 'adventure':
    case 'hiking':
      tripTypeItems.push(
        { category: 'clothing', name: t('packing.items.hikingBoots', 'Hiking boots'), essential: true },
        { category: 'clothing', name: t('packing.items.moistureWickingShirts', 'Moisture-wicking shirts'), essential: true },
        { category: 'clothing', name: t('packing.items.hikingPants', 'Hiking pants/shorts'), essential: true },
        { category: 'accessories', name: t('packing.items.backpack', 'Backpack'), essential: true },
        { category: 'accessories', name: t('packing.items.waterBottle', 'Water bottle'), essential: true },
        { category: 'accessories', name: t('packing.items.flashlight', 'Flashlight/headlamp'), essential: true },
        { category: 'accessories', name: t('packing.items.multiTool', 'Multi-tool'), essential: false },
        { category: 'toiletries', name: t('packing.items.insectRepellent', 'Insect repellent'), essential: true },
        { category: 'toiletries', name: t('packing.items.sunscreen', 'Sunscreen'), essential: true }
      );
      break;
      
    case 'winter':
    case 'ski':
      tripTypeItems.push(
        { category: 'clothing', name: t('packing.items.skiJacket', 'Ski jacket'), essential: true },
        { category: 'clothing', name: t('packing.items.skiPants', 'Ski pants'), essential: true },
        { category: 'clothing', name: t('packing.items.thermalBaseLayers', 'Thermal base layers'), essential: true },
        { category: 'clothing', name: t('packing.items.thickSocks', 'Thick socks'), essential: true },
        { category: 'clothing', name: t('packing.items.gloves', 'Gloves'), essential: true },
        { category: 'clothing', name: t('packing.items.winterHat', 'Winter hat'), essential: true },
        { category: 'accessories', name: t('packing.items.skiGoggles', 'Ski goggles'), essential: true },
        { category: 'toiletries', name: t('packing.items.lipBalm', 'Lip balm'), essential: true },
        { category: 'toiletries', name: t('packing.items.moisturizer', 'Moisturizer'), essential: true }
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
      { category: 'clothing', name: t('packing.items.swimwear', 'Swimwear'), essential: true },
      { category: 'clothing', name: t('packing.items.sandals', 'Sandals'), essential: true },
      { category: 'toiletries', name: t('packing.items.sunscreen', 'Sunscreen'), essential: true },
      { category: 'accessories', name: t('packing.items.beachTowel', 'Beach towel'), essential: false }
    );
  }
  
  // Urban/city trip
  if (destinationLower.includes('city') ||
      destinationLower.includes('new york') ||
      destinationLower.includes('paris') ||
      destinationLower.includes('london') ||
      destinationLower.includes('tokyo')) {
    destinationItems.push(
      { category: 'clothing', name: t('packing.items.walkingShoes', 'Comfortable walking shoes'), essential: true },
      { category: 'accessories', name: t('packing.items.dayBag', 'Day bag/backpack'), essential: true },
      { category: 'electronics', name: t('packing.items.camera', 'Camera'), essential: false },
      { category: 'documents', name: t('packing.items.cityMap', 'City map/guide'), essential: false }
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
    { id: 'accessories', name: t('packing.categories.accessories', 'Accessories'), icon: '👓' },
    { id: 'documents', name: t('packing.categories.documents', 'Documents'), icon: '📄' },
    { id: 'misc', name: t('packing.categories.miscellaneous', 'Miscellaneous'), icon: '🔮' }
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
 * @param {Function} t - Translation function from i18n
 * @returns {Array} Recommended documents
 */
export function getDocumentRecommendations(destination, t = key => key) {
  const isInternational = isInternationalDestination(destination);
  
  const baseDocuments = [
    { name: t('packing.documents.id', 'ID/Driver\'s License'), essential: true },
    { name: t('packing.documents.cards', 'Credit/Debit Cards'), essential: true },
    { name: t('packing.documents.insurance', 'Travel Insurance Info'), essential: true },
    { name: t('packing.documents.emergency', 'Emergency Contact List'), essential: true },
    { name: t('packing.documents.hotel', 'Hotel Reservation'), essential: true },
    { name: t('packing.documents.transportation', 'Transportation Tickets'), essential: true },
  ];
  
  if (isInternational) {
    return [
      ...baseDocuments,
      { name: t('packing.documents.passport', 'Passport'), essential: true },
      { name: t('packing.documents.visa', 'Visa Documentation'), essential: true },
      { name: t('packing.documents.driverPermit', 'International Driver\'s Permit'), essential: false },
      { name: t('packing.documents.vaccination', 'Vaccination Records'), essential: false },
      { name: t('packing.documents.currency', 'Currency Exchange Info'), essential: false },
      { name: t('packing.documents.embassy', 'Embassy Contact Info'), essential: false },
      { name: t('packing.documents.adapter', 'Travel Adapter Info'), essential: false },
    ];
  }
  
  return baseDocuments;
}