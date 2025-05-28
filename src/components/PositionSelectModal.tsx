import React, { useState, useEffect } from 'react';
import type { Goal } from '../types';

interface PositionSelectModalProps {
  goal: Goal;
  totalGoals: number;
  currentPosition: number;
  onClose: () => void;
  onPositionSelect: (goalId: string, newPosition: number) => Promise<void>;
}

const PositionSelectModal: React.FC<PositionSelectModalProps> = ({
  goal,
  totalGoals,
  currentPosition,
  onClose,
  onPositionSelect
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(currentPosition);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle position change
  const handlePositionChange = async () => {
    if (selectedPosition === currentPosition) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onPositionSelect(goal.id, selectedPosition);
      onClose();
    } catch (error) {
      console.error('Error updating position:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update selected position when dropdown changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPosition(parseInt(e.target.value, 10));
  };

  // When position changes, automatically apply it
  useEffect(() => {
    if (selectedPosition !== currentPosition) {
      handlePositionChange();
    }
  }, [selectedPosition]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-4/5 max-w-xs overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Reposition the Goal</h2>
          <button 
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Reposition "{goal.name}"</p>
          <div className="text-center">
            <select 
              id="position-select" 
              value={selectedPosition} 
              onChange={handleSelectChange}
              disabled={isSubmitting}
              className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: totalGoals }, (_, i) => i + 1).map((pos) => (
                <option key={pos} value={pos}>
                  Position {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionSelectModal;
