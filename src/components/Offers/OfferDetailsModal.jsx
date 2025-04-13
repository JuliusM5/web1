import React from 'react';
import AccessibleModal from '../Accessibility/AccessibleModal';
import { offerCategories } from '../../services/offersService';

function OfferDetailsModal({ isOpen, onClose, offer }) {
  if (!offer) return null;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (price, discountPercent) => {
    return price - (price * (discountPercent / 100));
  };

  // Group categories by type
  const groupCategories = () => {
    const grouped = {};
    
    if (!offer.categories || offer.categories.length === 0) {
      return {};
    }
    
    offer.categories.forEach(category => {
      // Find which group this category belongs to
      Object.entries(offerCategories).forEach(([group, categories]) => {
        if (categories.includes(category)) {
          if (!grouped[group]) {
            grouped[group] = [];
          }
          grouped[group].push(category);
        }
      });
    });
    
    return grouped;
  };
  
  const groupedCategories = groupCategories();

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={offer.title}
      size="large"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offer Image */}
        <div className="w-full">
          {/* Use a placeholder image instead of potentially broken URLs */}
          <img 
            src="/api/placeholder/800/400" 
            alt={offer.title} 
            className="w-full h-64 object-cover rounded-lg"
          />
          
          {/* Offer Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {offer.featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Featured Offer
              </span>
            )}
            {offer.discountPercent > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {offer.discountPercent}% Discount
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Limited Time
            </span>
          </div>
          
          {/* Categories */}
          {offer.categories && offer.categories.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {offer.categories.map((category, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Offer Details */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.destination}</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Valid from {formatDate(offer.startDate)} to {formatDate(offer.endDate)}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-1">Price</h4>
            {offer.discountPercent > 0 ? (
              <div>
                <span className="text-gray-500 line-through mr-2">${offer.price}</span>
                <span className="text-2xl font-bold text-green-600">
                  ${calculateDiscountedPrice(offer.price, offer.discountPercent).toFixed(0)}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  Save ${(offer.price * offer.discountPercent / 100).toFixed(0)}
                </span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">${offer.price}</div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-gray-600">{offer.description}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800 mb-1">What's included:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Round-trip transportation</li>
              <li>• Accommodation for the duration of stay</li>
              <li>• Daily breakfast</li>
              <li>• Guided tours and activities</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>
          
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => {
              alert('Booking functionality would be implemented here!');
              onClose();
            }}
          >
            Book Now
          </button>
        </div>
      </div>
      
      {/* Experience Details */}
      {Object.keys(groupedCategories).length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Experience Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedCategories).map(([group, categories]) => (
              <div key={group} className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2 capitalize">
                  {group.replace(/([A-Z])/g, ' $1').trim()}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Terms and Conditions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Terms and Conditions</h4>
        <p className="text-sm text-gray-600">
          Prices are per person based on double occupancy. Single supplements apply. 
          Offer subject to availability and may be changed or withdrawn without notice. 
          Cancellation policies apply. Please read all terms before booking.
        </p>
      </div>
    </AccessibleModal>
  );
}

export default OfferDetailsModal;