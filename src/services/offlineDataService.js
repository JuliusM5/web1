// src/services/offlineDataService.js

class OfflineDataService {
    constructor() {
      this.dbName = 'travelPlannerDB';
      this.dbVersion = 1;
      this.db = null;
      this.initPromise = this.initDB();
    }
    
    async initDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('trips')) {
            const tripsStore = db.createObjectStore('trips', { keyPath: 'id' });
            tripsStore.createIndex('userId', 'userId', { unique: false });
          }
          
          if (!db.objectStoreNames.contains('flightBookmarks')) {
            const bookmarksStore = db.createObjectStore('flightBookmarks', { keyPath: 'id' });
            bookmarksStore.createIndex('userId', 'userId', { unique: false });
          }
          
          if (!db.objectStoreNames.contains('pendingChanges')) {
            db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
          }
        };
        
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log('IndexedDB initialized successfully');
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('IndexedDB initialization error:', event.target.error);
          reject(event.target.error);
        };
      });
    }
    
    // Ensure database is initialized before any operation
    async ensureDB() {
      if (!this.db) {
        await this.initPromise;
      }
      return this.db;
    }
    
    // Trips CRUD operations
    async getTrips(userId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('trips', 'readonly');
        const store = transaction.objectStore('trips');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    async getTrip(tripId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('trips', 'readonly');
        const store = transaction.objectStore('trips');
        const request = store.get(tripId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    async saveTrip(trip) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('trips', 'readwrite');
        const store = transaction.objectStore('trips');
        const request = store.put(trip);
        
        request.onsuccess = () => {
          // Add to pending changes if offline
          if (!navigator.onLine) {
            this.addPendingChange({
              type: 'SAVE_TRIP',
              data: trip,
              timestamp: Date.now()
            });
          }
          resolve(trip);
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    async deleteTrip(tripId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('trips', 'readwrite');
        const store = transaction.objectStore('trips');
        const request = store.delete(tripId);
        
        request.onsuccess = () => {
          // Add to pending changes if offline
          if (!navigator.onLine) {
            this.addPendingChange({
              type: 'DELETE_TRIP',
              data: { id: tripId },
              timestamp: Date.now()
            });
          }
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    // Flight bookmarks operations
    async getFlightBookmarks(userId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('flightBookmarks', 'readonly');
        const store = transaction.objectStore('flightBookmarks');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    async saveFlightBookmark(bookmark) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('flightBookmarks', 'readwrite');
        const store = transaction.objectStore('flightBookmarks');
        const request = store.put(bookmark);
        
        request.onsuccess = () => {
          // Add to pending changes if offline
          if (!navigator.onLine) {
            this.addPendingChange({
              type: 'SAVE_BOOKMARK',
              data: bookmark,
              timestamp: Date.now()
            });
          }
          resolve(bookmark);
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    async deleteFlightBookmark(bookmarkId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('flightBookmarks', 'readwrite');
        const store = transaction.objectStore('flightBookmarks');
        const request = store.delete(bookmarkId);
        
        request.onsuccess = () => {
          // Add to pending changes if offline
          if (!navigator.onLine) {
            this.addPendingChange({
              type: 'DELETE_BOOKMARK',
              data: { id: bookmarkId },
              timestamp: Date.now()
            });
          }
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    // Pending changes management
    async addPendingChange(change) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('pendingChanges', 'readwrite');
        const store = transaction.objectStore('pendingChanges');
        const request = store.add(change);
        
        request.onsuccess = () => {
          // Register for sync when back online
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
              registration.sync.register('sync-trips');
            });
          }
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    async getPendingChanges() {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('pendingChanges', 'readonly');
        const store = transaction.objectStore('pendingChanges');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    async clearPendingChange(changeId) {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('pendingChanges', 'readwrite');
        const store = transaction.objectStore('pendingChanges');
        const request = store.delete(changeId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    // Sync changes with server when online
    async syncChanges() {
      if (!navigator.onLine) {
        return { success: false, reason: 'offline' };
      }
      
      try {
        const changes = await this.getPendingChanges();
        
        if (changes.length === 0) {
          return { success: true, syncedCount: 0 };
        }
        
        let successCount = 0;
        
        for (const change of changes) {
          try {
            // Process based on change type
            switch (change.type) {
              case 'SAVE_TRIP':
                await fetch('/api/trips', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(change.data)
                });
                break;
                
              case 'DELETE_TRIP':
                await fetch(`/api/trips/${change.data.id}`, {
                  method: 'DELETE'
                });
                break;
                
              case 'SAVE_BOOKMARK':
                await fetch('/api/bookmarks', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(change.data)
                });
                break;
                
              case 'DELETE_BOOKMARK':
                await fetch(`/api/bookmarks/${change.data.id}`, {
                  method: 'DELETE'
                });
                break;
            }
            
            // If successful, remove from pending changes
            await this.clearPendingChange(change.id);
            successCount++;
          } catch (error) {
            console.error('Error syncing change:', error);
          }
        }
        
        return { 
          success: true, 
          syncedCount: successCount,
          totalCount: changes.length
        };
      } catch (error) {
        console.error('Error in syncChanges:', error);
        return { success: false, error };
      }
    }
  }
  
  export default new OfflineDataService();