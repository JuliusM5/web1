import React, { useState, useEffect } from 'react';
import { getOffers, getFeaturedOffers, searchOffers } from '../../services/offersService';
import { AccessibleInput } from '../Accessibility/AccessibleInput';
import AccessibleButton from '../Accessibility/AccessibleButton';

const Offers = () => {
  const [allOffers, setAllOffers] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Load offers on component mount
  useEffect(() => {
    loadOffers();
  }, []);
  
  // Load all offers and featured offers
  const loadOffers = () => {
    setLoading(true);
    // Initialize offers in localStorage if needed
    const offers = getOffers();
    const featured = getFeaturedOffers();
    
    setAllOffers(offers);
    setFeaturedOffers(featured);
    setLoading(false);
  };
  
  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      setSearchResults(searchOffers(query));
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };
  
  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Calculate discounted price
  const calculateDiscountedPrice = (price, discountPercent) => {
    return price - (price * (discountPercent / 100));
  };
  
  // Render an offer card
  const OfferCard = ({ offer }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover-card transform transition-transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={offer.imageUrl} 
          alt={offer.title} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/800/400";
          }} 
        />
        {offer.featured && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-lg">
            Featured
          </div>
        )}
        {offer.discountPercent > 0 && (
          <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 rounded-br-lg">
            {offer.discountPercent}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{offer.title}</h3>
        <p className="text-gray-600 mb-2">{offer.destination}</p>
        
        <p className="text-sm text-gray-700 mb-3">{offer.description}</p>
        
        <div className="flex justify-between items-center">
          <div>
            {offer.discountPercent > 0 ? (
              <>
                <span className="text-gray-500 line-through mr-2">${offer.price}</span>
                <span className="text-xl font-bold text-green-600">
                  ${calculateDiscountedPrice(offer.price, offer.discountPercent).toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-800">${offer.price}</span>
            )}
          </div>
          
          <AccessibleButton 
            variant="primary"
            size="small"
          >
            View Details
          </AccessibleButton>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Valid: {formatDateRange(offer.startDate, offer.endDate)}
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Special Travel Offers</h2>
        
        <div className="w-1/3">
          <AccessibleInput
            id="search-offers"
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Search Results */}
      {showSearch && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Search Results ({searchResults.length})
            </h3>
            <button 
              onClick={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
              className="text-blue-600 text-sm"
            >
              Clear Search
            </button>
          </div>
          
          {searchResults.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No offers found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Featured Offers */}
      {featuredOffers.length > 0 && !showSearch && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Featured Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOffers.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
      
      {/* All Offers */}
      {!showSearch && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">All Available Offers</h3>
          {allOffers.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No offers are currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Offers;