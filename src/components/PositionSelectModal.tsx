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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content position-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reposition Goal</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Select a new position for "{goal.name}"</p>
          <div className="form-group">
            <label htmlFor="position-select">Position:</label>
            <select 
              id="position-select" 
              value={selectedPosition} 
              onChange={handleSelectChange}
              disabled={isSubmitting}
              className="position-select"
            >
              {Array.from({ length: totalGoals }, (_, i) => i + 1).map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
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
