// Cache Names
const STATIC_CACHE_NAME = 'travelease-static-v1';
const DYNAMIC_CACHE_NAME = 'travelease-dynamic-v1';
const DATA_CACHE_NAME = 'travelease-data-v1';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event: Pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, DATA_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to check if a request is for an API
const isApiRequest = (url) => {
  return url.includes('/api/') || 
         url.includes('openmeteo') || 
         url.includes('nominatim') || 
         url.includes('restcountries');
};

// Helper function to check if a request is for a static asset
const isStaticAsset = (url) => {
  return url.includes('/static/') || 
         url.includes('.png') || 
         url.includes('.ico') || 
         url.includes('.js') || 
         url.includes('.css') || 
         url.includes('.html');
};

// Fetch event: Network first for API, cache first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle API requests (network first with cache fallback)
  if (isApiRequest(url.href)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before storing it in the cache
          const responseToCache = response.clone();
          
          caches.open(DATA_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle static assets (cache first with network fallback)
  if (isStaticAsset(url.href)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              // Add the new response to the dynamic cache
              return caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }
  
  // Default strategy: Cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Add the new response to the dynamic cache
            return caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          });
      })
  );
});

// Sync event for background synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  }
});

// Function to sync trip data with server (mock implementation)
async function syncTrips() {
  try {
    // Get unsynchronized data from IndexedDB or localStorage
    const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
    
    if (unsynced.length === 0) {
      console.log('No unsynced changes to process');
      return;
    }
    
    console.log(`Syncing ${unsynced.length} unsynced changes`);
    
    // In a real implementation, this would send the data to a server
    // For now, just mark as synced by clearing the unsynced changes
    localStorage.setItem('unsyncedChanges', '[]');
    
    // Update the last sync time
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    
    // Notify clients if needed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: new Date().toISOString()
        });
      });
    });
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error; // This will cause the sync to retry later
  }
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});