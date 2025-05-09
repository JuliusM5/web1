// src/components/CheapFlights/DealAlerts.jsx
import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import useNotification from '../../hooks/useNotification'; // Import the hook properly

function DealAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({
    origin: '',
    destination: '',
    maxPrice: '',
    dateRange: 'anytime'
  });
  
  const { isSubscribed, isPremiumFeatureAvailable } = useSubscription();
  const notification = useNotification(); // Use the hook at the component level ONLY ONCE
  
  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  // Fetch alerts from API or local storage
  const fetchAlerts = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        const savedAlerts = localStorage.getItem('dealAlerts');
        
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts));
        } else {
          setAlerts([]);
        }
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
      setLoading(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlert(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle adding new alert
  const handleAddAlert = () => {
    // Basic validation
    if (!newAlert.origin || !newAlert.destination) {
      // Show error
      return;
    }
    
    // Check if premium feature
    if (!isPremiumFeatureAvailable('unlimited_alerts')) {
      // Show subscription modal or message
      return;
    }
    
    const alert = {
      id: Date.now(),
      ...newAlert,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    
    // Save to localStorage
    localStorage.setItem('dealAlerts', JSON.stringify(updatedAlerts));
    
    // Reset form
    setNewAlert({
      origin: '',
      destination: '',
      maxPrice: '',
      dateRange: 'anytime'
    });
    
    // Show success notification
    notification.show({
      type: 'success',
      message: 'Deal alert created successfully!'
    });
  };
  
  // Handle deleting an alert
  const handleDeleteAlert = (alertId) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    
    // Save to localStorage
    localStorage.setItem('dealAlerts', JSON.stringify(updatedAlerts));
    
    // Show notification
    notification.show({
      type: 'info',
      message: 'Deal alert removed.'
    });
  };
  
  // Handle toggling alert active state
  const handleToggleAlert = (alertId) => {
    const updatedAlerts = alerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, active: !alert.active };
      }
      return alert;
    });
    
    setAlerts(updatedAlerts);
    
    // Save to localStorage
    localStorage.setItem('dealAlerts', JSON.stringify(updatedAlerts));
  };
  
  // Function to handle notification about new deals
  const handleNotifyMe = (deal) => {
    // Use the notification object from component level
    notification.show({
      type: 'success',
      message: `We'll notify you when flights to ${deal ? deal.destination : 'your destination'} drop below ${deal ? '$' + deal.price : 'your target price'}`
    });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading alerts...</p>
      </div>
    );
  }
  
  // Check if premium feature
  if (!isSubscribed) {
    return (
      <div className="p-4">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Premium Feature</h2>
          <p className="text-gray-700 mb-3">
            Deal alerts are available to premium subscribers only.
          </p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/subscription/plans'}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Deal Alerts</h2>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Create New Alert</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Origin</label>
            <input
              type="text"
              name="origin"
              value={newAlert.origin}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="City or airport code"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              name="destination"
              value={newAlert.destination}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="City or airport code (optional)"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              value={newAlert.maxPrice}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Maximum price"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Date Range</label>
            <select
              name="dateRange"
              value={newAlert.dateRange}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="anytime">Anytime</option>
              <option value="1month">Next Month</option>
              <option value="3months">Next 3 Months</option>
              <option value="6months">Next 6 Months</option>
              <option value="custom">Custom Dates</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleAddAlert}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Alert
        </button>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-3">Your Alerts</h3>
        
        {alerts.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-600">You don't have any alerts yet.</p>
            <button
              onClick={handleNotifyMe}
              className="mt-2 text-blue-600 hover:underline"
            >
              Create your first alert above!
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  alert.active ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">
                      {alert.origin} → {alert.destination || 'Anywhere'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {alert.maxPrice ? `Max $${alert.maxPrice}` : 'Any price'} • 
                      {alert.dateRange === 'anytime' ? ' Anytime' : ` ${alert.dateRange}`}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`px-3 py-1 rounded text-sm ${
                        alert.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {alert.active ? 'Active' : 'Paused'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DealAlerts;