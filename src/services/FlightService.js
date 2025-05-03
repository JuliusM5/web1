import { LOCAL_STORAGE_KEYS } from '../constants/storageKeys';

// Sample data for development/demo purposes
const SAMPLE_AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', type: 'airport' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', type: 'airport' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', type: 'airport' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', type: 'airport' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', type: 'airport' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', type: 'airport' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', type: 'airport' },
  { code: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', type: 'airport' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', type: 'airport' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', type: 'airport' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', type: 'airport' },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', type: 'airport' },
];

// Sample flight data generator (for development purposes)
const generateSampleFlights = (searchParams) => {
  const { origin, destination, departureDate, returnDate, nonStop } = searchParams;
  
  if (!origin || !destination || !departureDate) {
    return [];
  }
  
  const airlines = ['Delta Airlines', 'American Airlines', 'United Airlines', 'British Airways', 'Air France', 'Lufthansa', 'Emirates', 'Singapore Airlines'];
  const flights = [];
  
  // Generate a random number of flights
  const numFlights = Math.floor(Math.random() * 20) + 5; // 5-25 flights
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000) + 100}`;
    
    // Random departure and arrival times
    const departureTime = new Date(departureDate);
    departureTime.setHours(Math.floor(Math.random() * 24));
    departureTime.setMinutes(Math.floor(Math.random() * 12) * 5); // Round to nearest 5 minutes
    
    const durationMinutes = Math.floor(Math.random() * 600) + 120; // 2-12 hours
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
    
    // Random number of stops
    const stops = nonStop ? 0 : Math.min(Math.floor(Math.random() * 3), 2);
    
    // Random layover info if there are stops
    const layovers = [];
    const stopAirports = [];
    
    if (stops > 0) {
      // Get random airports for layovers
      const availableAirports = SAMPLE_AIRPORTS.filter(airport => 
        airport.code !== origin && airport.code !== destination
      );
      
      for (let j = 0; j < stops; j++) {
        const randomAirportIndex = Math.floor(Math.random() * availableAirports.length);
        const layoverAirport = availableAirports[randomAirportIndex];
        stopAirports.push(layoverAirport.code);
        
        layovers.push({
          airport: layoverAirport.code,
          duration: Math.floor(Math.random() * 180) + 45, // 45-225 minutes
          terminal: `T${Math.floor(Math.random() * 5) + 1}`
        });
        
        // Remove this airport from available airports to avoid duplicates
        availableAirports.splice(randomAirportIndex, 1);
      }
    }
    
    // Random price
    const basePrice = Math.floor(Math.random() * 800) + 200; // $200-$1000
    const taxes = Math.floor(basePrice * 0.2); // 20% taxes and fees
    const price = basePrice + taxes;
    
    // Baggage allowance
    const baggage = {
      carryOn: Math.random() > 0.2, // 80% chance of carry-on included
      checked: Math.random() > 0.5, // 50% chance of checked baggage included
      checkedAmount: Math.random() > 0.7 ? 2 : 1 // 30% chance of 2 bags, otherwise 1
    };
    
    // Generate a flight
    flights.push({
      id: `${origin}-${destination}-${i}`,
      flightNumber,
      airline,
      originCode: origin,
      destinationCode: destination,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      durationMinutes,
      stops,
      stopAirports,
      layovers,
      price,
      basePrice,
      baggage,
      cabinClass: searchParams.cabinClass || 'economy',
      aircraft: ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A380'][Math.floor(Math.random() * 4)],
      distance: Math.floor(Math.random() * 5000) + 500 // 500-5500 km
    });
  }
  
  return flights;
};

// In-memory storage for price alerts (for demo purposes)
let priceAlerts = [];

// Initialize price alerts from localStorage if available
try {
  const savedAlerts = localStorage.getItem(LOCAL_STORAGE_KEYS.PRICE_ALERTS);
  if (savedAlerts) {
    priceAlerts = JSON.parse(savedAlerts);
  }
} catch (error) {
  console.error('Failed to load price alerts from localStorage:', error);
}

/**
 * Service for handling flight-related API calls
 */
const FlightService = {
  /**
   * Search for airports based on a query
   * @param {string} query - The search query (city or airport name)
   * @returns {Promise<Array>} - Array of matching airports
   */
  searchAirports: async (query) => {
    // In a real app, this would be an API call to a flight search service
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.length < 2) {
          resolve([]);
          return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = SAMPLE_AIRPORTS.filter(airport => 
          airport.code.toLowerCase().includes(lowerQuery) ||
          airport.name.toLowerCase().includes(lowerQuery) ||
          airport.city.toLowerCase().includes(lowerQuery) ||
          airport.country.toLowerCase().includes(lowerQuery)
        );
        
        resolve(results);
      }, 300); // Simulate network delay
    });
  },
  
  /**
   * Get airport details by IATA code
   * @param {string} code - The airport IATA code
   * @returns {Promise<Object|null>} - Airport details or null if not found
   */
  getAirportByCode: async (code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const airport = SAMPLE_AIRPORTS.find(airport => airport.code === code);
        resolve(airport || null);
      }, 100);
    });
  },
  
  /**
   * Search for flights based on search parameters
   * @param {Object} searchParams - The search parameters
   * @returns {Promise<Array>} - Array of matching flights
   */
  searchFlights: async (searchParams) => {
    // In a real app, this would be an API call to a flight search service
    return new Promise((resolve) => {
      setTimeout(() => {
        const flights = generateSampleFlights(searchParams);
        resolve(flights);
      }, 1500); // Simulate network delay
    });
  },
  
  /**
   * Save a price alert for a flight
   * @param {Object} alertData - The alert configuration
   * @returns {Promise<Object>} - The saved alert with ID
   */
  savePriceAlert: async (alertData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAlert = {
          ...alertData,
          id: `alert-${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };
        
        priceAlerts.push(newAlert);
        
        // Save to localStorage for persistence
        try {
          localStorage.setItem(LOCAL_STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(priceAlerts));
        } catch (error) {
          console.error('Failed to save price alerts to localStorage:', error);
        }
        
        resolve(newAlert);
      }, 500);
    });
  },
  
  /**
   * Get all price alerts for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of price alerts
   */
  getPriceAlerts: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userAlerts = priceAlerts.filter(alert => alert.user === userId);
        resolve(userAlerts);
      }, 300);
    });
  },
  
  /**
   * Delete a price alert
   * @param {string} alertId - The alert ID
   * @returns {Promise<boolean>} - Success status
   */
  deletePriceAlert: async (alertId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = priceAlerts.length;
        priceAlerts = priceAlerts.filter(alert => alert.id !== alertId);
        
        // Save to localStorage for persistence
        try {
          localStorage.setItem(LOCAL_STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(priceAlerts));
        } catch (error) {
          console.error('Failed to save price alerts to localStorage:', error);
        }
        
        resolve(priceAlerts.length < initialLength);
      }, 300);
    });
  }
};

export default FlightService;