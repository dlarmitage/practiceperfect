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

  // Define color classes based on goal status
  const statusColors = {
    'not-started': 'bg-goal-not-started',
    'active': 'bg-goal-active',
    'out-of-cadence': 'bg-goal-out-of-cadence',
    'past-due': 'bg-goal-past-due'
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition-all duration-300 text-white font-medium min-h-[180px] w-full mb-4 ${statusColors[status]} hover:translate-y-[-2px] hover:shadow-lg`}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-2 right-2 bg-white/30 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
        {goal.count}
      </div>
      <h3 className="text-lg font-bold text-center">{goal.name}</h3>
      {goal.dueDate && (
        <div className="text-xs mt-2 opacity-80 text-center px-1">
          Due: {formatDate(goal.dueDate)}
        </div>
      )}
      {goal.link && (
        <div className="mt-2 text-center p-1 bg-white/20 rounded" onClick={handleStopPropagation}>
          <a 
            href={goal.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Visit Resource
          </a>
        </div>
      )}
      
      <button 
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors border border-white/50 shadow-sm" 
        onClick={handleEditClick}
        aria-label="Edit goal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </button>
    </div>
  );
};

export default GoalButton;
