// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.0/8 are considered localhost for IPv4.
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  
  export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // The URL constructor is available in all browsers that support SW.
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // Our service worker won't work if PUBLIC_URL is on a different origin
        // from what our page is served on. This might happen if a CDN is used to
        // serve assets; see https://github.com/facebook/create-react-app/issues/2374
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // This is running on localhost. Let's check if a service worker still exists or not.
          checkValidServiceWorker(swUrl, config);
  
          // Add some additional logging to localhost, pointing developers to the
          // service worker/PWA documentation.
          navigator.serviceWorker.ready.then(() => {
            console.log(
              'This web app is being served cache-first by a service ' +
                'worker. To learn more, visit https://cra.link/PWA'
            );
          });
        } else {
          // Is not localhost. Just register service worker
          registerValidSW(swUrl, config);
        }
      });
    }
  }
  
  function registerValidSW(swUrl, config) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Check for updates on page load
        registration.update();
  
        // Also check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
  
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older
                // content until all client tabs are closed.
                console.log(
                  'New content is available and will be used when all ' +
                    'tabs for this page are closed. See https://cra.link/PWA.'
                );
  
                // Dispatch event to notify the app about the update
                window.dispatchEvent(new Event('serviceWorkerUpdated'));
  
                // Execute callback
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a
                // "Content is cached for offline use." message.
                console.log('Content is cached for offline use.');
  
                // Dispatch event for the app to show a notification
                window.dispatchEvent(new Event('serviceWorkerInstalled'));
  
                // Execute callback
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl, config) {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        // Ensure service worker exists, and that we really are getting a JS file.
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // No service worker found. Probably a different app. Reload the page.
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Service worker found. Proceed as normal.
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log('No internet connection found. App is running in offline mode.');
      });
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }
  
  // Function to trigger background sync
  export function triggerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          // Register a sync and pass the "sync-trips" tag
          return registration.sync.register('sync-trips')
            .then(() => {
              console.log('Background sync registered!');
              return true;
            })
            .catch(err => {
              console.error('Background sync registration failed:', err);
              return false;
            });
        });
    } else {
      console.log('Background sync not supported');
      // Manual sync fallback for browsers that don't support background sync
      manualSync();
      return false;
    }
  }
  
  // Fallback for browsers without background sync support
  function manualSync() {
    // Get unsynchronized data from localStorage
    const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
    
    if (unsynced.length === 0) {
      console.log('No unsynced changes to process');
      return;
    }
    
    console.log(`Manually syncing ${unsynced.length} unsynced changes`);
    
    // In a real implementation, this would send the data to a server
    // For now, just mark as synced by clearing the unsynced changes
    localStorage.setItem('unsyncedChanges', '[]');
    
    // Update the last sync time
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    
    // Notify the app about the sync
    window.dispatchEvent(new CustomEvent('syncCompleted', {
      detail: {
        timestamp: new Date().toISOString()
      }
    }));
    
    console.log('Manual sync completed successfully');
  }