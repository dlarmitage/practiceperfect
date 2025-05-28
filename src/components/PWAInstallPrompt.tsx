import React, { useState, useEffect } from 'react';
import { detectDevice } from '../utils/deviceDetection';
import type { DeviceType } from '../utils/deviceDetection';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

/**
 * Component that displays device-specific PWA installation instructions
 */
const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('Unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    setDeviceType(detectDevice());

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt regardless of outcome
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      if (onClose) onClose();
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    if (onClose) onClose();
  };

  if (!showPrompt) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">Install Practice Perfect</h3>
          <div className="mt-2 text-sm text-blue-700">
            {deviceType === 'iOS' && (
              <div>
                <p>To install on your iPhone or iPad:</p>
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>Tap the Share button in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top-right corner</li>
                </ol>
              </div>
            )}
            
            {deviceType === 'Android' && (
              <div>
                {deferredPrompt ? (
                  <button 
                    onClick={handleInstallClick}
                    className="mt-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                  >
                    Install App
                  </button>
                ) : (
                  <div>
                    <p>To install on your Android device:</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Tap the menu icon (⋮) in Chrome</li>
                      <li>Tap "Install app" or "Add to Home screen"</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
            
            {(deviceType === 'Windows' || deviceType === 'macOS' || deviceType === 'Linux') && (
              <div>
                {deferredPrompt ? (
                  <button 
                    onClick={handleInstallClick}
                    className="mt-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                  >
                    Install App
                  </button>
                ) : (
                  <div>
                    <p>To install on your computer:</p>
                    <div className="flex items-center mt-2 mb-2">
                      <span className="mr-2">Click the install icon</span>
                      <img 
                        src="/media/chrome_install.svg" 
                        alt="Chrome install icon" 
                        className="h-6 w-6" 
                        title="Chrome install icon"
                      />
                      <span className="ml-2">in the address bar</span>
                    </div>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Look for this icon in Chrome's address bar</li>
                      <li>Click "Install" in the prompt that appears</li>
                    </ol>
                    <p className="text-xs text-gray-600 mt-1">Note: Other browsers may use different icons</p>
                  </div>
                )}
              </div>
            )}
            
            {deviceType === 'Unknown' && (
              <p>Install our app for a better experience! Look for installation options in your browser's menu.</p>
            )}
          </div>
          <div className="mt-2">
            <button 
              type="button" 
              onClick={handleClose}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
