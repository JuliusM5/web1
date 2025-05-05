import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DealCardSkeleton from './DealCardSkeleton';
import DealCard from './DealCard'; // Keep this import since we'll use it
import ErrorMessage from '../UI/ErrorMessage';

function FlightDealsView() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useCallback to memoize the function so it can be added to dependency array
  const loadMockDeals = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - in a real app this would come from an API
      const mockDeals = [
        {
          id: 1,
          destination: 'Paris, France',
          origin: 'New York',
          price: 349,
          currency: 'USD',
          airline: 'Air France',
          departureDate: '2025-06-15',
          returnDate: '2025-06-22',
          discount: '30%',
          image: '/images/paris.jpg'
        },
        {
          id: 2,
          destination: 'Tokyo, Japan',
          origin: 'Los Angeles',
          price: 699,
          currency: 'USD',
          airline: 'ANA',
          departureDate: '2025-07-10',
          returnDate: '2025-07-24',
          discount: '25%',
          image: '/images/tokyo.jpg'
        },
        {
          id: 3,
          destination: 'Rome, Italy',
          origin: 'Chicago',
          price: 499,
          currency: 'USD',
          airline: 'Alitalia',
          departureDate: '2025-08-05',
          returnDate: '2025-08-15',
          discount: '20%',
          image: '/images/rome.jpg'
        }
      ];
      
      setDeals(mockDeals);
      setError(null);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load flight deals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as this doesn't rely on any external variables

  useEffect(() => {
    loadMockDeals();
  }, [loadMockDeals]); // Add loadMockDeals as a dependency

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Hot Deals This Week
      </h2>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Show skeleton loaders while loading
          <>
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
          </>
        ) : (
          // Show actual deals when loaded
          deals.map(deal => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DealCard deal={deal} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default FlightDealsView;