// public/service-worker.js

const CACHE_NAME = 'travel-planner-cache-v1';
const DATA_CACHE_NAME = 'travel-planner-data-cache-v1';
const FLIGHT_CACHE_NAME = 'flight-deals-cache-v1';

// Assets to cache immediately when the service worker installs
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other static assets like icons, fonts, etc.
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== DATA_CACHE_NAME &&
              cacheName !== FLIGHT_CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Claim clients immediately
  return self.clients.claim();
});

// Strategic fetch event handling
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        try {
          // Try network first
          const response = await fetch(event.request);
          // Cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          // Network failed, try cache
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // For API requests that aren't in cache, return offline fallback
          if (event.request.headers.get('accept').includes('application/json')) {
            return new Response(
              JSON.stringify({ 
                offline: true, 
                message: 'No internet connection. Data unavailable offline.' 
              }),
              {
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
        }
      })
    );
    return;
  }

  // Handle flight deal API requests specially
  if (event.request.url.includes('skyscanner') || event.request.url.includes('/flights/')) {
    event.respondWith(
      caches.open(FLIGHT_CACHE_NAME).then(async (cache) => {
        try {
          // Check cache first for flight data to minimize API calls
          const cachedResponse = await cache.match(event.request);
          
          // Return cached response if available and not expired
          if (cachedResponse) {
            // Parse the cached response to check timestamp
            const data = await cachedResponse.clone().json();
            const cacheTime = data._timestamp || 0;
            
            // If cache is less than 3 hours old, use it
            if (Date.now() - cacheTime < 3 * 60 * 60 * 1000) {
              return cachedResponse;
            }
          }
          
          // Fetch from network
          const response = await fetch(event.request);
          if (response.ok) {
            // Add timestamp to cached data
            const data = await response.clone().json();
            data._timestamp = Date.now();
            
            // Create new response with timestamp
            const timestampedResponse = new Response(
              JSON.stringify(data),
              {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
              }
            );
            
            // Cache the timestamped response
            cache.put(event.request, timestampedResponse.clone());
            return timestampedResponse;
          }
          
          return response;
        } catch (err) {
          // Network failed, use cache regardless of age
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return a fallback for flight data
          return new Response(
            JSON.stringify({ 
              offline: true, 
              message: 'Flight data unavailable offline.' 
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Don't cache non-success responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response - one to return, one to cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // For navigation requests, return the offline HTML page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Background sync for saved changes while offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  } else if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_FLIGHT_CACHE') {
    caches.open(FLIGHT_CACHE_NAME).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          cache.delete(request);
        });
      });
    });
  } else if (event.data && event.data.type === 'CONFIGURE_CACHING') {
    // Store configuration
    self.cacheConfig = event.data.cacheConfig;
  }
});

// Sync trips that were modified offline
async function syncTrips() {
  const db = await openIndexedDB();
  const pendingChanges = await db.getAll('pendingChanges');
  
  for (const change of pendingChanges) {
    try {
      // Attempt to sync with server
      const response = await fetch('/api/trips/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(change)
      });
      
      if (response.ok) {
        // Remove from pending changes if successful
        await db.delete('pendingChanges', change.id);
      }
    } catch (error) {
      // Keep pending changes if sync fails
      console.error('Sync failed for change:', change);
    }
  }
}

// Helper function to access IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('travelPlannerDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('trips')) {
        db.createObjectStore('trips', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingChanges')) {
        db.createObjectStore('pendingChanges', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('flightBookmarks')) {
        db.createObjectStore('flightBookmarks', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Handle push notifications for flight deals
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/badge.png',
      data: data.url,
      actions: [
        {
          action: 'view-deal',
          title: 'View Deal'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view-deal') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        const url = event.notification.data;
        
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});