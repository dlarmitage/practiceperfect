import React, { useEffect } from 'react';

interface HelpTooltipProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * A tooltip component that displays helpful information about using goal cards
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({ isVisible, onClose }) => {
  // Close the tooltip after a delay
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Show for 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-md mx-4 transform transition-all duration-300 
          animate-fade-in pointer-events-auto"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">How to Use Goal Cards</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Long press</strong> on the goal card to start a practice session</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Click the <strong>number in the top-right corner</strong> to increment your practice count</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Click the <strong>Ⓘ</strong> icon to edit the goal's properties</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HelpTooltip;
