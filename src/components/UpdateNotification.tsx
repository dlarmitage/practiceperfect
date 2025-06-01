import React, { useState, useEffect } from 'react';

// Keys for storing update-related information
const LAST_SKIPPED_UPDATE_KEY = 'last_skipped_update_timestamp';
const CURRENT_APP_VERSION_KEY = 'current_app_version';
const LAST_NOTIFIED_VERSION_KEY = 'last_notified_version';

// App version - this should be updated when you make significant changes
// This could also be pulled from your package.json version in a real app
const APP_VERSION = '1.0.0';

/**
 * Component that shows a notification when a new version of the app is available
 * and provides a button to refresh the page to apply the update
 */
const UpdateNotification: React.FC = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
  // Check if we should show the notification based on last skipped time
  const shouldShowNotification = () => {
    const lastSkippedTimestamp = localStorage.getItem(LAST_SKIPPED_UPDATE_KEY);
    if (!lastSkippedTimestamp) return true;
    
    const lastSkipped = parseInt(lastSkippedTimestamp, 10);
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Show notification if it's been more than 24 hours since last skip
    return (now - lastSkipped) > oneDayInMs;
  };

  useEffect(() => {
    // Store current app version in localStorage when component mounts
    // This helps track which version the user is currently running
    localStorage.setItem(CURRENT_APP_VERSION_KEY, APP_VERSION);
    
    // Listen for messages from the service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        // Get the last version we notified about
        const lastNotifiedVersion = localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
        
        // If we've already notified about this version, don't show again
        if (lastNotifiedVersion === APP_VERSION) {
          console.log('Already notified about this version');
          return;
        }
        
        // Only show notification if we haven't recently skipped
        if (shouldShowNotification()) {
          // Store the version we're notifying about
          localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, APP_VERSION);
          setShowUpdateNotification(true);
        }
      } else if (event.data && event.data.type === 'RELOAD_PAGE') {
        // Service worker has activated, reload the page
        console.log('Received reload message from service worker');
        window.location.reload();
      }
    };

    // Add event listener for service worker messages
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Listen for the need refresh event
    // We'll handle this through the service worker message event instead
    // since the updateSW function doesn't have an onNeedRefresh method

    // Check if there's a waiting service worker
    const checkForWaitingServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.waiting) {
            // Get the last version we notified about
            const lastNotifiedVersion = localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
            
            // If we've already notified about this version, don't show again
            if (lastNotifiedVersion === APP_VERSION) {
              console.log('Already notified about this version');
              return;
            }
            
            // There's a waiting service worker, show the notification if we haven't recently skipped
            if (shouldShowNotification()) {
              // Store the version we're notifying about
              localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, APP_VERSION);
              setShowUpdateNotification(true);
            }
          }
        } catch (error) {
          console.error('Error checking for service worker updates:', error);
        }
      }
    };

    // Run the check
    checkForWaitingServiceWorker();

    // Cleanup
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Handle the update now button click
  const handleUpdate = async () => {
    try {
      localStorage.setItem(CURRENT_APP_VERSION_KEY, APP_VERSION);
      let triedReload = false;
      // Wait for the service worker to activate before reloading
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          // Wait for activation
          registration.waiting.addEventListener('statechange', (e: any) => {
            if (e.target.state === 'activated' && !triedReload) {
              triedReload = true;
              window.location.reload();
            }
          });
          // Fallback: reload after 2s if not already reloaded
          setTimeout(() => {
            if (!triedReload) {
              triedReload = true;
              window.location.reload();
            }
          }, 2000);
        } else {
          // No waiting SW, just reload
          window.location.reload();
        }
      } else {
        // No SW support, just reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      window.location.reload();
    }
  };

  // Fallback: If reload lands on a 404, show a friendly retry message
  useEffect(() => {
    if (window.location.pathname !== '/' && document.title.includes('404')) {
      // Replace body with fallback UI
      document.body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h2>Update Failed</h2><p>Something went wrong while updating. Please <a href='/' style='color:blue;text-decoration:underline;'>tap here to reload the app</a>.</p></div>`;
    }
  }, []);
  
  // Handle the skip for now button click
  const handleSkip = () => {
    // Save the current timestamp to localStorage
    localStorage.setItem(LAST_SKIPPED_UPDATE_KEY, Date.now().toString());
    
    // Also store the version we're skipping, so we don't show it again after refresh
    // This ensures if they kill the app and it refreshes automatically, they won't see
    // the update notification for the same version again
    localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, APP_VERSION);
    
    // Hide the notification
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex flex-col">
        <div className="font-medium mb-2 text-center">App Update Available</div>
        <div className="text-sm mb-3 text-center">A new version is available. Update now for the latest features and improvements.</div>
        <div className="flex space-x-3 justify-center">
          <button 
            onClick={handleUpdate}
            className="bg-white text-blue-600 hover:bg-blue-100 font-medium py-2 px-4 rounded text-sm"
          >
            Update Now
          </button>
          <button 
            onClick={handleSkip}
            className="bg-transparent border border-white text-white hover:bg-blue-700 font-medium py-2 px-4 rounded text-sm"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
