// Check if service workers are supported
export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
        
        registerValidSW(swUrl);
      });
    }
  }
  
  function registerValidSW(swUrl) {
    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        // Successfully registered
        console.log('Service Worker registered with scope:', registration.scope);
        
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated SW has been installed, but the previous
                // version is still controlling the page - reload to use the new version
                console.log('New service worker available. Refresh the page to use it.');
                
                // Dispatch event for the app to show an update notification
                const event = new CustomEvent('serviceWorkerUpdated');
                window.dispatchEvent(event);
              } else {
                // At this point, everything has been pre-cached
                console.log('Service Worker installed. Content is cached for offline use.');
                
                // Dispatch event for the app to show offline-ready notification
                const event = new CustomEvent('serviceWorkerInstalled');
                window.dispatchEvent(event);
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  // Function to check if we need to update the service worker
  export function checkForUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  }
  
  // Function to unregister the service worker
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          registration.unregister();
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  }
  
  // Function to trigger sync when online
  export function triggerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-trips')
          .then(() => {
            console.log('Sync registered');
          })
          .catch(err => {
            console.log('Sync registration failed:', err);
            
            // Fallback for browsers that don't support background sync
            // Immediately try to sync data
            syncDataImmediately();
          });
      });
    } else {
      // Fallback for browsers that don't support service workers or sync
      syncDataImmediately();
    }
  }
  
  // Fallback sync function for browsers without background sync support
  function syncDataImmediately() {
    // In a real app, this would call an API endpoint
    console.log('Performing immediate sync');
    
    // Get unsynchronized data from localStorage
    const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
    
    if (unsynced.length === 0) {
      console.log('No unsynced changes to process');
      return;
    }
    
    console.log(`Syncing ${unsynced.length} unsynced changes`);
    
    // Mark as synced
    localStorage.setItem('unsyncedChanges', '[]');
    
    // Update the last sync time
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    
    console.log('Immediate sync completed');
  }
  
  // Function to handle offline changes
  export function saveOfflineChange(changeType, data) {
    // Get existing unsynced changes
    const unsynced = JSON.parse(localStorage.getItem('unsyncedChanges') || '[]');
    
    // Add new change
    unsynced.push({
      type: changeType, // 'add', 'update', 'delete'
      data: data,
      timestamp: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('unsyncedChanges', JSON.stringify(unsynced));
    
    // If online, trigger sync
    if (navigator.onLine) {
      triggerSync();
    }
  }