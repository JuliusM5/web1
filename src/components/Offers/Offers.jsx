import React, { useState, useEffect } from 'react';
import { initializeOffers, getOffers, getFeaturedOffers, searchOffers, getOffersByCategory, offerCategories } from '../../services/offersService';
import { AccessibleInput } from '../Accessibility/AccessibleInput';
import OfferDetailsModal from './OfferDetailsModal';

const Offers = () => {
  const [loading, setLoading] = useState(true);
  const [allOffers, setAllOffers] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [displayedOffers, setDisplayedOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeCategoryGroup, setActiveCategoryGroup] = useState('');
  
  // Load offers once on component mount
  useEffect(() => {
    // Initialize the offers data
    initializeOffers();
    
    // Get the offers
    const offers = getOffers();
    setAllOffers(offers);
    setDisplayedOffers(offers);
    setFeaturedOffers(getFeaturedOffers());
    setLoading(false);
  }, []);
  
  // Update displayed offers when filter changes
  useEffect(() => {
    if (!activeCategory) {
      setDisplayedOffers(allOffers);
      return;
    }
    
    setDisplayedOffers(getOffersByCategory(activeCategory));
  }, [activeCategory, allOffers]);
  
  // Handle view details
  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };
  
  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
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
  
  // Handle category filter
  const handleCategoryFilter = (category, group) => {
    if (activeCategory === category) {
      // If clicking the active category, clear the filter
      setActiveCategory('');
      setActiveCategoryGroup('');
    } else {
      setActiveCategory(category);
      setActiveCategoryGroup(group);
    }
  };
  
  // Calculate discounted price
  const calculateDiscountedPrice = (price, discountPercent) => {
    return price - (price * (discountPercent / 100));
  };
  
  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Render an offer card
  const OfferCard = ({ offer }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover-card transform transition-transform hover:-translate-y-1">
        <div className="relative">
          {/* Using a placeholder image directly instead of trying to load potentially broken URLs */}
          <img 
            src="/api/placeholder/800/400" 
            alt={offer.title} 
            className="w-full h-48 object-cover"
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
          
          {/* Categories */}
          {offer.categories && offer.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {offer.categories.slice(0, 3).map((category, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full cursor-pointer hover:bg-blue-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Find which group this category belongs to
                    let foundGroup = '';
                    Object.entries(offerCategories).forEach(([group, categories]) => {
                      if (categories.includes(category)) {
                        foundGroup = group;
                      }
                    });
                    handleCategoryFilter(category, foundGroup);
                  }}
                >
                  {category}
                </span>
              ))}
              {offer.categories.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                  +{offer.categories.length - 3} more
                </span>
              )}
            </div>
          )}
          
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
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => handleViewDetails(offer)}
            >
              View Details
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Valid: {formatDateRange(offer.startDate, offer.endDate)}
          </div>
        </div>
      </div>
    );
  };
  
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
      
      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Categories
          </h3>
          {activeCategory && (
            <button 
              onClick={() => {
                setActiveCategory('');
                setActiveCategoryGroup('');
              }}
              className="text-blue-600 text-sm"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(offerCategories).map(([categoryGroup, categories]) => (
            <div key={categoryGroup} className={`p-4 rounded-lg border ${
              activeCategoryGroup === categoryGroup ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {categoryGroup.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCategoryFilter(category, categoryGroup)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ))}
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
      
      {/* Active Category Filter */}
      {activeCategory && !showSearch && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {activeCategory} ({displayedOffers.length})
            </h3>
          </div>
          
          {displayedOffers.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No offers available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Featured Offers */}
      {featuredOffers.length > 0 && !showSearch && !activeCategory && (
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
      {!showSearch && !activeCategory && (
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
      
      {/* Offer Details Modal */}
      <OfferDetailsModal 
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        offer={selectedOffer}
      />
    </div>
  );
};

export default Offers;