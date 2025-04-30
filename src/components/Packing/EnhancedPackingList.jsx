// src/components/Packing/EnhancedPackingList.jsx

import React, { useState, useEffect } from 'react';
import { getPackingRecommendations } from '../../utils/packingUtils';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

/**
 * Enhanced Packing List component that builds on existing task system
 * but provides specialized UI and functionality for packing
 */
function EnhancedPackingList({ tripTasks, setTripTasks, destination, startDate, endDate, tripType = "leisure" }) {
  // Get i18n functionality
  const { t } = useI18n();
  
  const [packingTasks, setPackingTasks] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('clothing');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [weatherData, setWeatherData] = useState(null);
  
  // Categories for packing items
  const packingCategories = [
    { id: 'clothing', name: t('packing.categories.clothing'), icon: '👕' },
    { id: 'toiletries', name: t('packing.categories.toiletries'), icon: '🧴' },
    { id: 'electronics', name: t('packing.categories.electronics'), icon: '📱' },
    { id: 'documents', name: t('packing.categories.documents'), icon: '📄' },
    { id: 'accessories', name: t('packing.categories.accessories'), icon: '👓' },
    { id: 'medications', name: t('packing.categories.medications'), icon: '💊' },
    { id: 'misc', name: t('packing.categories.miscellaneous'), icon: '🔮' }
  ];
  
  // Extract packing tasks from all trip tasks
  useEffect(() => {
    const packingItems = tripTasks.filter(task => task.category === 'packing');
    setPackingTasks(packingItems);
  }, [tripTasks]);
  
  // Simulate fetching weather data for the destination
  // In a real app, you would connect to a weather API
  useEffect(() => {
    if (destination && startDate) {
      // Simulated weather data based on destination
      const simulatedWeather = {
        destination,
        avgTemp: destination.toLowerCase().includes('beach') ? 30 : 
                destination.toLowerCase().includes('mountain') ? 15 : 
                destination.toLowerCase().includes('ski') ? 0 : 22,
        conditions: destination.toLowerCase().includes('beach') ? 'sunny' :
                    destination.toLowerCase().includes('mountain') ? 'variable' :
                    destination.toLowerCase().includes('tropical') ? 'humid' : 'mild',
        rainfall: destination.toLowerCase().includes('tropical') ? 'high' :
                  destination.toLowerCase().includes('desert') ? 'low' : 'medium'
      };
      
      setWeatherData(simulatedWeather);
    }
  }, [destination, startDate]);
  
  // Add a new packing item
  const addPackingItem = () => {
    if (!newItemText.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: newItemText,
      category: 'packing',
      subcategory: newItemCategory, // Adding subcategory for more detailed organization
      completed: false,
      priority: 'medium',
      date: startDate, // Default to trip start date
      createdAt: new Date().toISOString()
    };
    
    setTripTasks([...tripTasks, newTask]);
    setNewItemText('');
  };
  
  // Add recommended items to packing list
  const addRecommendedItems = (items) => {
    const newTasks = items.map((item, index) => ({
      id: Date.now() + index, // Use the index to ensure uniqueness
      text: item.name,
      category: 'packing',
      subcategory: item.category,
      completed: false,
      priority: item.essential ? 'high' : 'medium',
      date: startDate,
      createdAt: new Date().toISOString()
    }));
    
    setTripTasks([...tripTasks, ...newTasks]);
    setShowRecommendations(false);
  };
  
  // Toggle task completion
  const toggleItemPacked = (id) => {
    setTripTasks(tripTasks.map(task => 
      task.id === id ? {...task, completed: !task.completed} : task
    ));
  };
  
  // Delete a packing item
  const deletePackingItem = (id) => {
    setTripTasks(tripTasks.filter(task => task.id !== id));
  };
  
  // Get filtered tasks based on category
  const getFilteredPackingTasks = () => {
    if (filterCategory === 'all') return packingTasks;
    return packingTasks.filter(task => task.subcategory === filterCategory);
  };
  
  // Get packing recommendations based on destination, trip duration, and weather
  const getRecommendations = () => {
    if (!destination || !startDate || !endDate) {
      alert(t('packing.noDestinationWarning'));
      return [];
    }
    
    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return getPackingRecommendations(destination, duration, weatherData, tripType, t);
  };
  
  // Calculate packing stats
  const totalItems = packingTasks.length;
  const packedItems = packingTasks.filter(item => item.completed).length;
  const packingProgress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{t('packing.title')}</h2>
        <div className="text-sm text-gray-600">
          {t('packing.progress', { packed: packedItems, total: totalItems, percentage: packingProgress })}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${packingProgress}%` }}
        ></div>
      </div>
      
      {/* Add new item */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
          placeholder={t('tasks.whatNeedsToBeDone')}
          className="flex-1 p-2 border border-gray-300 rounded-l"
        />
        <select
          value={newItemCategory}
          onChange={e => setNewItemCategory(e.target.value)}
          className="w-36 p-2 border-t border-b border-gray-300"
        >
          {packingCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={addPackingItem}
          disabled={!newItemText.trim()}
          className={`px-4 py-2 rounded-r ${
            !newItemText.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {t('packing.add')}
        </button>
      </div>
      
      {/* Recommendations button */}
      <div className="mb-4">
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
        >
          <span className="mr-2">
            {showRecommendations ? t('packing.hideRecommendations') : t('packing.showRecommendations')}
          </span>
          {showRecommendations ? '↑' : '↓'}
        </button>
      </div>
      
      {/* Recommendations panel */}
      {showRecommendations && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">
            {t('tasks.categories.packing')} - {destination}
          </h3>
          
          {weatherData && (
            <div className="mb-3 p-2 bg-blue-50 rounded flex items-center text-sm">
              <span className="text-lg mr-2">
                {weatherData.conditions === 'sunny' ? '☀️' :
                 weatherData.conditions === 'variable' ? '⛅' :
                 weatherData.conditions === 'humid' ? '💧' : '🌤️'}
              </span>
              <div>
                <p><strong>{t('weather.expected')}:</strong> {t(`weather.conditions.${weatherData.conditions}`, weatherData.conditions)}, avg. {weatherData.avgTemp}°C</p>
                <p><strong>{t('weather.rainfall')}:</strong> {t(`weather.rainfall.${weatherData.rainfall}`, weatherData.rainfall)}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2 max-h-60 overflow-y-auto p-1">
            {getRecommendations().map((category, index) => (
              <div key={index} className="border border-green-200 rounded p-2 bg-white">
                <h4 className="font-medium text-green-700 flex items-center">
                  <span className="mr-2">{category.icon}</span> {category.name}
                </h4>
                <ul className="mt-1 space-y-1">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={packingTasks.some(task => 
                          task.text.toLowerCase() === item.name.toLowerCase() &&
                          task.subcategory === category.id
                        )}
                        onChange={() => {
                          // If already in list, do nothing
                          if (packingTasks.some(task => 
                            task.text.toLowerCase() === item.name.toLowerCase() &&
                            task.subcategory === category.id
                          )) return;
                          
                          // Otherwise add it
                          addRecommendedItems([{...item, category: category.id}]);
                        }}
                      />
                      <span className={item.essential ? 'font-medium' : ''}>
                        {item.name}
                        {item.essential && <span className="ml-1 text-red-500">*</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-right">
            <button
              onClick={() => {
                const allItems = getRecommendations().flatMap(category => 
                  category.items.map(item => ({...item, category: category.id}))
                );
                
                // Filter out items already in the list
                const newItems = allItems.filter(item => 
                  !packingTasks.some(task => 
                    task.text.toLowerCase() === item.name.toLowerCase() &&
                    task.subcategory === item.category
                  )
                );
                
                addRecommendedItems(newItems);
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              {t('form.add')}
            </button>
          </div>
        </div>
      )}
      
      {/* Category filter */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t('packing.allItems')}
          </button>
          
          {packingCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap flex items-center ${
                filterCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <span className="mr-1">{category.icon}</span> {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Packing items list */}
      <div className="space-y-2 mt-4">
        {getFilteredPackingTasks().length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">{t('packing.noItems')}</p>
            <p className="text-sm text-gray-400">{t('packing.addItemsPrompt')}</p>
          </div>
        ) : (
          getFilteredPackingTasks().map(item => (
            <div
              key={item.id}
              className={`p-3 border rounded-lg flex items-center ${
                item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItemPacked(item.id)}
                className="mr-3 h-5 w-5"
              />
              
              <div className="flex-1">
                <p className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {item.text}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  {packingCategories.find(cat => cat.id === item.subcategory)?.icon || '📦'}&nbsp;
                  <span className="capitalize">
                    {packingCategories.find(cat => cat.id === item.subcategory)?.name || t('tasks.categories.other')}
                  </span>
                  
                  {item.priority === 'high' && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                      {t('tasks.priorities.high')}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => deletePackingItem(item.id)}
                className="ml-2 text-gray-400 hover:text-red-500"
                title={t('form.delete')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm">
        <h3 className="font-medium text-blue-800 mb-1">{t('packing.tips.title')}</h3>
        <ul className="space-y-1 text-blue-700">
          <li>• {t('packing.tips.weather')}</li>
          <li>• {t('packing.tips.rolling')}</li>
          <li>• {t('packing.tips.essentials')}</li>
          <li>• {t('packing.tips.organization')}</li>
        </ul>
      </div>
    </div>
  );
}

export default EnhancedPackingList;