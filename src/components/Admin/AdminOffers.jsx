import React, { useState, useEffect } from 'react';
import { getOffers, createOffer, updateOffer, deleteOffer, offerCategories } from '../../services/offersService';
import { useAuth } from '../../context/AuthContext';
import AccessibleButton from '../Accessibility/AccessibleButton';
import { AccessibleInput, AccessibleTextarea, AccessibleSelect, AccessibleCheckbox } from '../Accessibility/AccessibleInput';
import AccessibleModal from '../Accessibility/AccessibleModal';

const AdminOffers = () => {
  const { isAdmin, currentUser } = useAuth();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formError, setFormError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    price: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    featured: false,
    categories: []
  });
  
  // Initialize offer data on component mount
  useEffect(() => {
    loadOffers();
  }, []);
  
  // Load offers from service
  const loadOffers = () => {
    setLoading(true);
    const offersData = getOffers();
    setOffers([...offersData]); // Create a new array to ensure React detects the change
    setLoading(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      destination: '',
      description: '',
      price: '',
      discountPercent: '',
      startDate: '',
      endDate: '',
      imageUrl: '',
      featured: false,
      categories: []
    });
    setSelectedCategories([]);
    setEditingOffer(null);
    setFormError('');
  };
  
  // Open edit modal
  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      destination: offer.destination,
      description: offer.description,
      price: offer.price,
      discountPercent: offer.discountPercent,
      startDate: offer.startDate,
      endDate: offer.endDate,
      imageUrl: offer.imageUrl,
      featured: offer.featured,
      categories: offer.categories || []
    });
    setSelectedCategories(offer.categories || []);
    setShowAddModal(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!formData.title || !formData.destination || !formData.price || !formData.startDate || !formData.endDate) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    try {
      // Prepare data
      const offerData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPercent: parseFloat(formData.discountPercent) || 0,
        categories: selectedCategories
      };
      
      // Create or update offer
      if (editingOffer) {
        const updated = updateOffer(editingOffer.id, offerData);
        if (updated) {
          // Update was successful
          loadOffers(); // Reload offers to get the latest state
          setShowAddModal(false);
          resetForm();
        }
      } else {
        const created = createOffer(offerData);
        if (created) {
          // Creation was successful
          loadOffers(); // Reload offers to get the latest state
          setShowAddModal(false);
          resetForm();
        }
      }
    } catch (error) {
      setFormError('An error occurred while saving the offer.');
      console.error('Error saving offer:', error);
    }
  };
  
  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      const deleted = deleteOffer(id);
      if (deleted) {
        loadOffers(); // Reload offers to get the latest state
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Open category selection modal
  const openCategoryModal = () => {
    setShowCategoryModal(true);
  };
  
  // Save selected categories
  const saveCategories = () => {
    setFormData({
      ...formData,
      categories: selectedCategories
    });
    setShowCategoryModal(false);
  };
  
  if (!isAdmin()) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>Access denied. You need administrator privileges to access this page.</p>
      </div>
    );
  }
  
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
        <h2 className="text-2xl font-bold text-gray-800">Manage Travel Offers</h2>
        <div>
          <AccessibleButton 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add New Offer
          </AccessibleButton>
        </div>
      </div>
      
      {/* Offers table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No offers available. Click "Add New Offer" to create one.
                </td>
              </tr>
            ) : (
              offers.map(offer => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src="/api/placeholder/100/100" 
                          alt={offer.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                        <div className="text-sm text-gray-500">
                          {offer.discountPercent > 0 ? `${offer.discountPercent}% discount` : 'No discount'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{offer.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.discountPercent > 0 ? (
                      <div>
                        <span className="text-sm line-through text-gray-500">${offer.price}</span>
                        <span className="ml-2 text-sm font-medium text-green-600">
                          ${(offer.price - (offer.price * offer.discountPercent / 100)).toFixed(0)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">${offer.price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {offer.categories && offer.categories.length > 0 ? (
                        offer.categories.slice(0, 2).map((category, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {category}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No categories</span>
                      )}
                      {offer.categories && offer.categories.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          +{offer.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(offer)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add/Edit Offer Modal */}
      <AccessibleModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingOffer ? `Edit Offer: ${editingOffer.title}` : 'Add New Travel Offer'}
      >
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span>{formError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <AccessibleInput
                id="offer-title"
                label="Offer Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Summer in Paris"
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-destination"
                label="Destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                placeholder="e.g., Paris, France"
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-image"
                label="Image URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                helpText="Leave empty to use a placeholder image"
              />
            </div>
            
            <div className="md:col-span-2">
              <AccessibleTextarea
                id="offer-description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe the offer in detail..."
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-price"
                label="Price ($)"
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="e.g., 1200"
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-discount"
                label="Discount Percentage (%)"
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.discountPercent}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                helpText="Leave empty for no discount"
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-start-date"
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <AccessibleInput
                id="offer-end-date"
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Categories</label>
                <button
                  type="button"
                  onClick={openCategoryModal}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Select Categories
                </button>
              </div>
              {selectedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-16">
                  {selectedCategories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-3 border border-gray-200 rounded-lg min-h-16 text-gray-500">
                  No categories selected. Click "Select Categories" to add some.
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <AccessibleCheckbox
                id="offer-featured"
                label="Feature this offer"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                helpText="Featured offers will appear in the highlighted section"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <AccessibleButton
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton type="submit">
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </AccessibleButton>
          </div>
        </form>
      </AccessibleModal>
      
      {/* Category Selection Modal */}
      <AccessibleModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Select Categories"
        size="large"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Select categories that best describe this offer. Choose from multiple categories to make your offer more discoverable.
          </p>
          
          {Object.entries(offerCategories).map(([categoryGroup, categories]) => (
            <div key={categoryGroup} className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {categoryGroup.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            {selectedCategories.length} categories selected
          </div>
          <div className="space-x-3">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveCategories}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Categories
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
};

export default AdminOffers;