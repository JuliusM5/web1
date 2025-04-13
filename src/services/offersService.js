// src/services/offersService.js

// Available offer categories
export const offerCategories = {
  destinationType: [
    'Beach Getaway',
    'Mountain Retreat',
    'Urban Exploration',
    'Cultural Heritage',
    'Island Escape',
    'Desert Adventure',
    'Countryside Retreat'
  ],
  tripDuration: [
    'Weekend Break (2-3 days)',
    'Short Getaway (4-6 days)',
    'Extended Vacation (7-14 days)',
    'Long-term Journey (15+ days)'
  ],
  travelStyle: [
    'Luxury Vacation',
    'Budget-Friendly',
    'Family Package',
    'Romantic Getaway',
    'Solo Traveler',
    'Group Adventure',
    'Senior-Friendly'
  ],
  experienceType: [
    'Adventure Travel',
    'Culinary Experience',
    'Wellness Retreat',
    'Educational Tour',
    'Wildlife & Nature',
    'Photography Tour',
    'Festival & Event'
  ],
  seasonalSpecial: [
    'Summer Escape',
    'Winter Wonderland',
    'Spring Bloom',
    'Fall/Autumn Getaway',
    'Holiday Season'
  ],
  transportFeature: [
    'All-Inclusive',
    'Cruise Package',
    'Road Trip',
    'Train Journey',
    'Sailing Adventure'
  ],
  specialInterest: [
    'Sports Tourism',
    'Eco-Tourism',
    'Historical Expedition',
    'Art & Architecture',
    'Music & Festival',
    'Wine & Brewery Tour',
    'Wildlife Safari'
  ]
};

// Default offers if none exist in localStorage
const defaultOffers = [
  {
    id: 1,
    title: 'Summer in Paris',
    destination: 'Paris, France',
    description: 'Experience the beauty of Paris in summer with this special package including Eiffel Tower visit, Seine cruise, and more.',
    price: 1200,
    discountPercent: 15,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    imageUrl: '/api/placeholder/800/400',
    featured: true,
    categories: ['Urban Exploration', 'Cultural Heritage', 'Summer Escape'],
  },
  {
    id: 2,
    title: 'New York Weekend',
    destination: 'New York, USA',
    description: 'A quick weekend getaway to the Big Apple. Includes Broadway show tickets and Empire State Building entry.',
    price: 850,
    discountPercent: 0,
    startDate: '2025-05-15',
    endDate: '2025-12-15',
    imageUrl: '/api/placeholder/800/400',
    featured: false,
    categories: ['Urban Exploration', 'Weekend Break (2-3 days)', 'Cultural Heritage'],
  },
  {
    id: 3,
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    description: 'Explore the fascinating culture of Tokyo with this comprehensive package including guided tours and authentic experiences.',
    price: 1800,
    discountPercent: 10,
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    imageUrl: '/api/placeholder/800/400',
    featured: true,
    categories: ['Urban Exploration', 'Culinary Experience', 'Fall/Autumn Getaway'],
  }
];

// Keep a cached version of offers to avoid excessive localStorage access
let cachedOffers = null;

// Initialize offers - only called once to set up default data
export const initializeOffers = () => {
  if (cachedOffers !== null) {
    return cachedOffers;
  }
  
  try {
    const storedOffers = localStorage.getItem('offers');
    
    if (!storedOffers) {
      localStorage.setItem('offers', JSON.stringify(defaultOffers));
      cachedOffers = [...defaultOffers];
      return cachedOffers;
    }
    
    cachedOffers = JSON.parse(storedOffers);
    return cachedOffers;
  } catch (error) {
    console.error('Error initializing offers:', error);
    cachedOffers = [...defaultOffers];
    return cachedOffers;
  }
};

// Get all offers - uses cached version when available
export const getOffers = () => {
  // Return cached offers if available
  if (cachedOffers !== null) {
    return cachedOffers;
  }
  
  // Initialize if not yet done
  return initializeOffers();
};

// Get featured offers - derived from the main offers
export const getFeaturedOffers = () => {
  const offers = getOffers();
  return offers.filter(offer => offer.featured);
};

// Get offers by category
export const getOffersByCategory = (category) => {
  const offers = getOffers();
  return offers.filter(offer => 
    offer.categories && offer.categories.includes(category)
  );
};

// Create new offer - updates both localStorage and cache
export const createOffer = (offerData) => {
  try {
    const offers = getOffers();
    
    // Generate a new ID
    const maxId = offers.reduce((max, offer) => (offer.id > max ? offer.id : max), 0);
    const newOffer = { 
      ...offerData, 
      id: maxId + 1,
      // Ensure categories exists
      categories: offerData.categories || []
    };
    
    // Update cache and localStorage
    cachedOffers = [...offers, newOffer];
    localStorage.setItem('offers', JSON.stringify(cachedOffers));
    
    return newOffer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

// Update existing offer - updates both localStorage and cache
export const updateOffer = (id, offerData) => {
  try {
    const offers = getOffers();
    const updatedOffers = offers.map(offer => 
      offer.id === id ? { 
        ...offer, 
        ...offerData, 
        id,
        // Ensure categories exists
        categories: offerData.categories || offer.categories || []
      } : offer
    );
    
    // Update cache and localStorage
    cachedOffers = updatedOffers;
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    return updatedOffers.find(offer => offer.id === id);
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

// Delete offer - updates both localStorage and cache
export const deleteOffer = (id) => {
  try {
    const offers = getOffers();
    const updatedOffers = offers.filter(offer => offer.id !== id);
    
    // Update cache and localStorage
    cachedOffers = updatedOffers;
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    return true;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

// Search offers - doesn't modify any state
export const searchOffers = (query) => {
  if (!query || query.trim() === '') return [];
  
  const offers = getOffers();
  const lowerQuery = query.toLowerCase();
  
  return offers.filter(offer => 
    offer.title.toLowerCase().includes(lowerQuery) ||
    offer.destination.toLowerCase().includes(lowerQuery) ||
    offer.description.toLowerCase().includes(lowerQuery) ||
    (offer.categories && offer.categories.some(cat => 
      cat.toLowerCase().includes(lowerQuery)
    ))
  );
};

// Reset offers to defaults (for testing)
export const resetOffers = () => {
  cachedOffers = [...defaultOffers];
  localStorage.setItem('offers', JSON.stringify(defaultOffers));
  return [...defaultOffers];
};