import React, { useState, useEffect, useRef } from 'react';
import type { Goal, GoalStatus } from '../types';
import { calculateGoalStatus, formatDate } from '../utils/goalUtils';
import SessionTimer from './SessionTimer';

interface GoalButtonProps {
  goal: Goal;
  onClick: () => void;
  onEdit: () => void;
  onStartSession?: (goal: Goal) => void;
}

/**
 * A button component that represents a goal
 * 
 * @param goal - The goal to display
 * @param onClick - Function to call when the button is clicked
 * @param onEdit - Function to call when the edit button is clicked
 */
const GoalButton: React.FC<GoalButtonProps> = ({ goal, onClick, onEdit, onStartSession }) => {
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showSessionTimer, setShowSessionTimer] = useState(false);
  
  // Track if the pointer is down
  const isPointerDown = useRef(false);
  
  const status: GoalStatus = calculateGoalStatus(goal);
  
  // Handle pointer down - start long press timer
  const handlePointerDown = (_e: React.PointerEvent) => {
    isPointerDown.current = true;
    
    // Start long press timer
    const timer = setTimeout(() => {
      if (isPointerDown.current) {
        setIsLongPress(true);
        if (onStartSession) {
          // Start session on long press
          setShowSessionTimer(true);
        }
      }
    }, 800); // 800ms for long press
    
    setLongPressTimer(timer);
  };
  
  // Handle pointer up - clear long press timer
  const handlePointerUp = () => {
    isPointerDown.current = false;
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // If it wasn't a long press, handle as a normal click
    if (!isLongPress) {
      handleClick();
    }
    
    // Reset long press state after a short delay
    setTimeout(() => {
      setIsLongPress(false);
    }, 300);
  };
  
  // Handle pointer leave - clear long press timer
  const handlePointerLeave = () => {
    isPointerDown.current = false;
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
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
          
          // Only increment if we're not in a double-click state and not in long press
          if (!isDoubleClick && !isLongPress) {
            onClick();
          }
        }, 250) // Wait 250ms to see if a second click comes
      );
    }
  };
  
  // Handle session completion
  const handleSessionComplete = () => {
    setShowSessionTimer(false);
    // Increment the goal count since a session was completed
    onClick();
  };
  
  // Handle session cancellation
  const handleSessionCancel = () => {
    setShowSessionTimer(false);
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [clickTimer, longPressTimer]);
  
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
    <>
      <div 
        className={`relative flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition-all duration-300 text-white font-medium min-h-[180px] w-full mb-4 ${statusColors[status]} hover:translate-y-[-2px] hover:shadow-lg ${isLongPress ? 'scale-95 opacity-80' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
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
      
      {/* Session Timer Modal */}
      {showSessionTimer && (
        <SessionTimer 
          goal={goal} 
          onComplete={handleSessionComplete} 
          onCancel={handleSessionCancel} 
        />
      )}
    </>
  );
};

export default GoalButton;
