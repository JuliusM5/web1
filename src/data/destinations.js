// Destination information database
export const destinations = {
  'Paris, France': {
    emergency: '112 (General), 15 (Medical), 17 (Police)',
    currency: 'Euro (€)',
    language: 'French',
    phrases: 'Hello: Bonjour, Thank you: Merci, Please: S\'il vous plaît',
    tips: [
      'Greeting with "Bonjour" is expected',
      'Tipping is included in service',
      'Metro is the best way to get around'
    ],
    mapLink: 'https://www.google.com/maps/place/Paris,+France',
    advisoryLink: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/France.html'
  },
  'Tokyo, Japan': {
    emergency: '110 (Police), 119 (Fire/Ambulance)',
    currency: 'Japanese Yen (¥)',
    language: 'Japanese',
    phrases: 'Hello: Konnichiwa, Thank you: Arigatou, Please: Onegaishimasu',
    tips: [
      'Bow when greeting people',
      'Remove shoes before entering homes',
      'No tipping is expected'
    ],
    mapLink: 'https://www.google.com/maps/place/Tokyo,+Japan',
    advisoryLink: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Japan.html'
  },
  'New York City, USA': {
    emergency: '911 (All Emergencies)',
    currency: 'US Dollar ($)',
    language: 'English',
    phrases: 'Excuse me: Excuse me, Thank you: Thank you',
    tips: [
      'Tipping 15-20% is expected',
      'Stand on right side of escalators',
      'Subway is best for getting around'
    ],
    mapLink: 'https://www.google.com/maps/place/New+York,+NY',
    advisoryLink: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/UnitedStates.html'
  }
};

export default destinations;
