// src/services/TripService.js

import offlineDataService from './offlineDataService';

class TripService {
  constructor() {
    this.apiUrl = '/api/trips';
  }
  
  // Get all trips for a user
  async getTrips(userId) {
    try {
      // Try to fetch from API first
      if (navigator.onLine) {
        const response = await fetch(`${this.apiUrl}?userId=${userId}`);
        
        if (response.ok) {
          const trips = await response.json();
          
          // Update local database with fresh data
          for (const trip of trips) {
            await offlineDataService.saveTrip(trip);
          }
          
          return trips;
        }
      }
      
      // If offline or API failed, get from local database
      return await offlineDataService.getTrips(userId);
    } catch (error) {
      console.error('Error fetching trips:', error);
      
      // Fallback to local data
      return await offlineDataService.getTrips(userId);
    }
  }
  
  // Get a single trip
  async getTrip(tripId) {
    try {
      // Try to fetch from API first
      if (navigator.onLine) {
        const response = await fetch(`${this.apiUrl}/${tripId}`);
        
        if (response.ok) {
          const trip = await response.json();
          
          // Update local database
          await offlineDataService.saveTrip(trip);
          
          return trip;
        }
      }
      
      // If offline or API failed, get from local database
      return await offlineDataService.getTrip(tripId);
    } catch (error) {
      console.error('Error fetching trip:', error);
      
      // Fallback to local data
      return await offlineDataService.getTrip(tripId);
    }
  }
  
  // Create or update a trip
  async saveTrip(trip) {
    // Always save to local database first
    await offlineDataService.saveTrip(trip);
    
    try {
      // Then try to save to API if online
      if (navigator.onLine) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(trip)
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Return the local version if offline or API failed
      return trip;
    } catch (error) {
      console.error('Error saving trip:', error);
      
      // Return the local version
      return trip;
    }
  }
  
  // Delete a trip
  async deleteTrip(tripId) {
    // Delete from local database first
    await offlineDataService.deleteTrip(tripId);
    
    try {
      // Then try to delete from API if online
      if (navigator.onLine) {
        const response = await fetch(`${this.apiUrl}/${tripId}`, {
          method: 'DELETE'
        });
        
        return response.ok;
      }
      
      return true; // Consider it successful if offline
    } catch (error) {
      console.error('Error deleting trip:', error);
      return true; // Consider it successful if we at least deleted locally
    }
  }
}

export default new TripService();