import React, { useState } from 'react';
import { detectDevice } from '../utils/deviceDetection';
import type { DeviceType } from '../utils/deviceDetection';

interface PWAInstallModalProps {
  onClose: () => void;
  onDontShowAgain: () => void;
}

/**
 * A modal component that encourages users to install the PWA
 * with device-specific instructions and a "Don't show again" option
 */
const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ 
  onClose, 
  onDontShowAgain 
}) => {
  const [deviceType] = useState<DeviceType>(detectDevice());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(window.deferredPrompt || null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Handle the install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    
    // Clear the saved prompt
    window.deferredPrompt = null;
    setDeferredPrompt(null);
    
    // Close the modal
    onClose();
  };

  // Handle the close button click
  const handleClose = () => {
    if (dontShowAgain) {
      onDontShowAgain();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg">Install Practice Perfect</h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-blue-100"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium mb-2">
                A local install offers some compelling benefits:
              </p>
              <ul className="text-gray-600 text-sm mb-4 list-disc pl-5 space-y-1">
                <li>Runs like a native app on your desktop or mobile</li>
                <li>Faster loading times and performace</li>
                <li>Full screen experience. Fewer distractions.</li>
                <li>Automatic updates happen in the background</li>
              </ul>
              
              {/* Device-specific instructions */}
              {deviceType === 'iOS' && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p className="font-medium text-gray-700 mb-1">Quick Install Steps:</p>
                  <div className="flex items-center">
                    <span>Tap</span>
                    <svg className="h-5 w-5 mx-1 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>then "Add to Home Screen"</span>
                  </div>
                </div>
              )}
              
              {deviceType === 'Android' && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {deferredPrompt ? (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
                    >
                      Install Now
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <span>Tap menu</span>
                      <svg className="h-5 w-5 mx-1 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                      <span>then "Install app"</span>
                    </div>
                  )}
                </div>
              )}
              
              {(deviceType === 'Windows' || deviceType === 'macOS' || deviceType === 'Linux') && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {deferredPrompt ? (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
                    >
                      Install Now
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <span>Click</span>
                      <img 
                        src="/icons/chrome_install.svg" 
                        alt="Install icon" 
                        className="h-5 w-5 mx-1" 
                      />
                      <span>in the address bar</span>
                    </div>
                  )}
                </div>
              )}
              
              {deviceType === 'Unknown' && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>Look for installation options in your browser's menu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
          <label className="flex items-center text-sm text-gray-600">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={() => {
                // Set state and close immediately if checked
                const newValue = !dontShowAgain;
                setDontShowAgain(newValue);
                if (newValue) {
                  onDontShowAgain();
                  onClose();
                }
              }}
              className="mr-2 h-4 w-4 text-blue-600 rounded bg-white border border-gray-300 focus:ring-0 focus:outline-none appearance-none checked:border-blue-600"
            />
            Don't show again
          </label>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

// Add the deferredPrompt property to the Window interface
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default PWAInstallModal;
