import React, { useState, useEffect } from 'react';
import { updateSW } from '../main';

/**
 * Component that shows a notification when a new version of the app is available
 * and provides a button to refresh the page to apply the update
 */
const UpdateNotification: React.FC = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Listen for messages from the service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setShowUpdateNotification(true);
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
            // There's a waiting service worker, show the notification
            setShowUpdateNotification(true);
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

  const handleUpdate = () => {
    // Use the updateSW function from the registration if available
    if (updateSW && typeof updateSW === 'function') {
      updateSW(true);
    } else {
      // Fallback: Send message to the service worker to skip waiting
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Reload the page to apply the update
      window.location.reload();
    }
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex flex-col">
        <div className="font-medium mb-2">App Update Available</div>
        <div className="text-sm mb-3">A new version is available. Update now for the latest features and improvements.</div>
        <button 
          onClick={handleUpdate}
          className="bg-white text-blue-600 hover:bg-blue-100 font-medium py-1 px-3 rounded text-sm"
        >
          Update Now
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
