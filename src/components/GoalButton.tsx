import React from 'react';
import type { Goal, GoalStatus } from '../types';
import { calculateGoalStatus, formatDate } from '../utils/goalUtils';

interface GoalButtonProps {
  goal: Goal;
  onClick: () => void;
  onEdit: () => void;
}

/**
 * A button component that represents a goal
 * 
 * @param goal - The goal to display
 * @param onClick - Function to call when the button is clicked
 * @param onEdit - Function to call when the edit button is clicked
 */
const GoalButton: React.FC<GoalButtonProps> = ({ goal, onClick, onEdit }) => {
  const [clickTimer, setClickTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [isDoubleClick, setIsDoubleClick] = React.useState(false);
  
  const status: GoalStatus = calculateGoalStatus(goal);
  
  // Handle click with double-click detection
  const handleClick = () => {
    // If we're already in a potential double-click state
    if (clickTimer) {
      // This is the second click - it's a double click
      clearTimeout(clickTimer);
      setClickTimer(null);
      setIsDoubleClick(true);
      
      // Reset double-click state after a delay
      setTimeout(() => {
        setIsDoubleClick(false);
      }, 300);
    } else {
      // This is the first click - wait to see if it's part of a double click
      setClickTimer(
        setTimeout(() => {
          // If we get here, it was a single click
          setClickTimer(null);
          
          // Only increment if we're not in a double-click state
          if (!isDoubleClick) {
            onClick();
          }
        }, 250) // Wait 250ms to see if a second click comes
      );
    }
  };
  
  // Handle touch end (for mobile)
  const handleTouchEnd = (e: React.TouchEvent) => {
    // If this was a tap, trigger the click handler
    if (!isDoubleClick) {
      onClick();
    }
    
    e.preventDefault(); // Prevent default to avoid double-tap zoom on mobile
  };
  
  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);
  
  // Handle link or edit button click - prevent event propagation to avoid triggering the goal button click
  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div 
      className={`goal-button goal-button-${status}`}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <div className="goal-counter">{goal.count}</div>
      <h3 className="text-lg font-bold">{goal.name}</h3>
      {goal.dueDate && (
        <div className="goal-due-date">
          Due: {formatDate(goal.dueDate)}
        </div>
      )}
      {goal.link && (
        <div className="goal-link" onClick={handleStopPropagation}>
          <a 
            href={goal.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="goal-link-anchor"
          >
            Visit Resource
          </a>
        </div>
      )}
      
      <button 
        className="edit-button" 
        onClick={handleEditClick}
        aria-label="Edit goal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </button>
    </div>
  );
};

export default GoalButton;
