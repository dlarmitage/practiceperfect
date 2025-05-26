import React from 'react';
import type { Goal, GoalStatus } from '../types';
import { calculateGoalStatus, formatDate } from '../utils/goalUtils';

interface GoalButtonProps {
  goal: Goal;
  onClick: () => void;
  onLongPress: () => void;
}

/**
 * A button component that represents a goal
 * 
 * @param goal - The goal to display
 * @param onClick - Function to call when the button is clicked
 * @param onLongPress - Function to call when the button is long-pressed
 */
const GoalButton: React.FC<GoalButtonProps> = ({ goal, onClick, onLongPress }) => {
  const [pressing, setPressing] = React.useState(false);
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [clickTimer, setClickTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [isDoubleClick, setIsDoubleClick] = React.useState(false);
  
  const status: GoalStatus = calculateGoalStatus(goal);
  
  // Handle long press via mouse down
  const handleMouseDown = () => {
    setPressing(true);
    const timer = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };
  
  // Handle mouse up - don't trigger click here
  const handleMouseUp = () => {
    if (pressing && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setPressing(false);
    }
  };
  
  // Handle click with double-click detection
  const handleClick = () => {
    // If we're already in a potential double-click state
    if (clickTimer) {
      // This is the second click - it's a double click
      clearTimeout(clickTimer);
      setClickTimer(null);
      setIsDoubleClick(true);
      
      // Use the long press handler for double click
      onLongPress();
      
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
  
  // Handle touch start (for mobile)
  const handleTouchStart = () => {
    setPressing(true);
    const timer = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };
  
  // Handle touch end (for mobile)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressing && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setPressing(false);
      
      // If this was a short tap (not a long press), trigger the click handler
      if (!isDoubleClick) {
        onClick();
      }
      
      e.preventDefault(); // Prevent default to avoid double-tap zoom on mobile
    }
  };
  
  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [longPressTimer, clickTimer]);
  
  // Handle link click - prevent event propagation to avoid triggering the goal button click
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`goal-button goal-button-${status}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
        setPressing(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
        setPressing(false);
      }}
    >
      <div className="goal-counter">{goal.count}</div>
      <h3 className="text-lg font-bold">{goal.name}</h3>
      {goal.dueDate && (
        <div className="goal-due-date">
          Due: {formatDate(goal.dueDate)}
        </div>
      )}
      {goal.link && (
        <div className="goal-link" onClick={handleLinkClick}>
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
    </div>
  );
};

export default GoalButton;
