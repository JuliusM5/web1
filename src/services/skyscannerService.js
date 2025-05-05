// src/services/skyscannerService.js

// This is a service to handle interactions with the Skyscanner API
// You'll need to replace these with your actual Skyscanner API credentials
const SKYSCANNER_API_KEY = 'YOUR_SKYSCANNER_API_KEY';
const SKYSCANNER_API_URL = 'https://skyscanner-api.p.rapidapi.com/v3';

class SkyscannerService {
  constructor() {
    this.headers = {
      'X-RapidAPI-Key': SKYSCANNER_API_KEY,
      'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  // Get cheap flights from a specific location
  async getCheapFlights(originCode, options = {}) {
    try {
      // Default parameters
      const params = {
        market: options.market || 'LT',
        locale: options.locale || 'en-US',
        currency: options.currency || 'EUR',
        queryLegs: [
          {
            originPlaceId: { iata: originCode },
            destinationPlaceId: { anywhere: true },
            date: {
              year: options.year || new Date().getFullYear(),
              month: options.month || new Date().getMonth() + 1,
              day: options.day || new Date().getDate() + 7
            }
          }
        ],
        cabinClass: options.cabinClass || 'CABIN_CLASS_ECONOMY',
        adults: options.adults || 1,
        childrenAges: options.childrenAges || []
      };

      const response = await fetch(`${SKYSCANNER_API_URL}/flights/live/search/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processFlightData(data);
    } catch (error) {
      console.error('Error fetching cheap flights:', error);
      throw error;
    }
  }

  // Get airport information by city name
  async getAirportByCity(cityName) {
    try {
      const response = await fetch(`${SKYSCANNER_API_URL}/autosuggest/flights`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: cityName,
          market: 'LT',
          locale: 'en-US'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.places || [];
    } catch (error) {
      console.error('Error fetching airport information:', error);
      throw error;
    }
  }

  // Process and filter flight data to find deals
  processFlightData(data) {
    // Here you would implement your logic to determine what constitutes a "deal"
    // For example, flights that are X% below average price for that route
    
    // This is a placeholder implementation
    const deals = [];
    
    if (data.itineraries && data.legs) {
      // Extract price information
      data.itineraries.forEach(itinerary => {
        const priceOptions = itinerary.pricingOptions || [];
        
        if (priceOptions.length > 0) {
          // Get the cheapest price option
          const cheapestOption = priceOptions.reduce((min, option) => 
            option.price.amount < min.price.amount ? option : min, priceOptions[0]);
          
          // Find the associated legs
          const outboundLeg = data.legs.find(leg => leg.id === itinerary.legIds[0]);
          const inboundLeg = itinerary.legIds[1] ? data.legs.find(leg => leg.id === itinerary.legIds[1]) : null;
          
          if (outboundLeg) {
            // Calculate if this is a deal (e.g., below average price)
            // This would require historical data or market averages in a real implementation
            const isDeal = Math.random() > 0.5; // Placeholder - replace with real logic
            
            if (isDeal) {
              deals.push({
                id: itinerary.id,
                from: outboundLeg.origin.name,
                to: outboundLeg.destination.name,
                departure: outboundLeg.departure,
                return: inboundLeg ? inboundLeg.departure : null,
                price: cheapestOption.price.amount,
                currency: cheapestOption.price.unit,
                airline: outboundLeg.carriers && outboundLeg.carriers.marketing && outboundLeg.carriers.marketing[0] ? 
                         outboundLeg.carriers.marketing[0].name : 'Unknown',
                discount: `${Math.floor(Math.random() * 30 + 20)}% off`, // Placeholder
                lastMinute: new Date(outboundLeg.departure) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              });
            }
          }
        }
      });
    }
    
    return deals;
  }

  // Monitor for deals and notify users
  async setupDealMonitor(userLocation, userPreferences, callback) {
    // This would typically be implemented as a background job/cron task
    // For this example, we'll simulate with a setInterval
    
    const airportInfo = await this.getAirportByCity(userLocation);
    
    if (!airportInfo || airportInfo.length === 0) {
      throw new Error(`Could not find airport information for ${userLocation}`);
    }
    
    const originCode = airportInfo[0].iata;
    
    // Monitor for deals daily
    const intervalId = setInterval(async () => {
      try {
        const deals = await this.getCheapFlights(originCode, userPreferences);
        
        if (deals && deals.length > 0) {
          callback(deals);
        }
      } catch (error) {
        console.error('Error in deal monitoring:', error);
      }
    }, 24 * 60 * 60 * 1000); // Check once per day
    
    return {
      stop: () => clearInterval(intervalId)
    };
  }
}

export default new SkyscannerService();