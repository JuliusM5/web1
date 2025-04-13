/**
 * Service for managing travel offers data
 */

// Initialize offers with sample data if none exist
const initializeOffers = () => {
    const offers = getOffers();
    
    if (offers.length === 0) {
      const sampleOffers = [
        {
          id: 1,
          title: 'Summer in Paris',
          destination: 'Paris, France',
          description: 'Enjoy a romantic week in Paris with 30% off on luxury hotels.',
          price: 1200,
          discountPercent: 30,
          startDate: '2025-06-01',
          endDate: '2025-09-30',
          imageUrl: '/api/placeholder/800/400',
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Tokyo Adventure',
          destination: 'Tokyo, Japan',
          description: 'Explore Tokyo with a special cultural package including traditional accommodations.',
          price: 1800,
          discountPercent: 15,
          startDate: '2025-05-01',
          endDate: '2025-08-31',
          imageUrl: '/api/placeholder/800/400',
          featured: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem('travelEaseOffers', JSON.stringify(sampleOffers));
      return sampleOffers;
    }
    
    return offers;
  };
  
  /**
   * Get all travel offers
   * @returns {Array} List of travel offers
   */
  export const getOffers = () => {
    const offers = localStorage.getItem('travelEaseOffers');
    return offers ? JSON.parse(offers) : [];
  };
  
  /**
   * Get a specific offer by ID
   * @param {number} id Offer ID
   * @returns {Object|null} The offer or null if not found
   */
  export const getOfferById = (id) => {
    const offers = initializeOffers();
    return offers.find(offer => offer.id === parseInt(id)) || null;
  };
  
  /**
   * Create a new offer
   * @param {Object} offerData Offer data
   * @returns {Object} The created offer
   */
  export const createOffer = (offerData) => {
    const offers = initializeOffers();
    
    // Generate a new ID
    const id = offers.length > 0 
      ? Math.max(...offers.map(offer => offer.id)) + 1 
      : 1;
    
    const newOffer = {
      id,
      ...offerData,
      createdAt: new Date().toISOString()
    };
    
    offers.push(newOffer);
    localStorage.setItem('travelEaseOffers', JSON.stringify(offers));
    
    return newOffer;
  };
  
  /**
   * Update an existing offer
   * @param {number} id Offer ID
   * @param {Object} offerData Updated offer data
   * @returns {Object|null} The updated offer or null if not found
   */
  export const updateOffer = (id, offerData) => {
    const offers = initializeOffers();
    const index = offers.findIndex(offer => offer.id === parseInt(id));
    
    if (index === -1) return null;
    
    // Update the offer
    const updatedOffer = {
      ...offers[index],
      ...offerData,
      id: parseInt(id) // Ensure ID doesn't change
    };
    
    offers[index] = updatedOffer;
    localStorage.setItem('travelEaseOffers', JSON.stringify(offers));
    
    return updatedOffer;
  };
  
  /**
   * Delete an offer
   * @param {number} id Offer ID
   * @returns {boolean} True if deleted, false if not found
   */
  export const deleteOffer = (id) => {
    const offers = initializeOffers();
    const newOffers = offers.filter(offer => offer.id !== parseInt(id));
    
    if (newOffers.length === offers.length) return false;
    
    localStorage.setItem('travelEaseOffers', JSON.stringify(newOffers));
    return true;
  };
  
  /**
   * Get all featured offers
   * @returns {Array} List of featured offers
   */
  export const getFeaturedOffers = () => {
    const offers = initializeOffers();
    return offers.filter(offer => offer.featured);
  };
  
  /**
   * Search offers by destination or title
   * @param {string} query Search query
   * @returns {Array} Matching offers
   */
  export const searchOffers = (query) => {
    if (!query) return [];
    
    const offers = initializeOffers();
    const lowerQuery = query.toLowerCase();
    
    return offers.filter(offer => 
      offer.title.toLowerCase().includes(lowerQuery) ||
      offer.destination.toLowerCase().includes(lowerQuery)
    );
  };