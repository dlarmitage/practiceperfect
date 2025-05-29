import React, { useState, useEffect, useRef } from 'react';
import type { Goal, GoalStatus } from '../types';
import { calculateGoalStatus, formatDate, formatCadence } from '../utils/goalUtils';
import { triggerConfettiEffect } from '../utils/confettiUtils';
import SessionTimer from './SessionTimer';
import HelpTooltip from './HelpTooltip';

interface GoalButtonProps {
  goal: Goal;
  onClick: () => void;
  onDecrement?: () => void;
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
const GoalButton: React.FC<GoalButtonProps> = ({ goal, onClick, onDecrement, onEdit, onStartSession }) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showSessionTimer, setShowSessionTimer] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  
  // Track clicks to detect if user might be confused
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const CLICK_THRESHOLD = 3; // Number of clicks before showing help
  const CLICK_TIMEOUT = 2000; // Reset click count after 2 seconds of inactivity
  
  // References to the audio elements for sounds
  const dingAudioRef = useRef<HTMLAudioElement | null>(null);
  const trumpetAudioRef = useRef<HTMLAudioElement | null>(null);
  const cheeringAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize the audio elements
  useEffect(() => {
    dingAudioRef.current = new Audio('/media/ding.mp3');
    dingAudioRef.current.volume = 0.5; // Set volume to 50%
    
    trumpetAudioRef.current = new Audio('/media/trumpet.mp3');
    trumpetAudioRef.current.volume = 0.5; // Set volume to 50%
    
    cheeringAudioRef.current = new Audio('/media/cheering.mp3');
    cheeringAudioRef.current.volume = 0.5; // Set volume to 50%
    
    return () => {
      // Clean up
      if (dingAudioRef.current) {
        dingAudioRef.current.pause();
        dingAudioRef.current = null;
      }
      if (trumpetAudioRef.current) {
        trumpetAudioRef.current.pause();
        trumpetAudioRef.current = null;
      }
      if (cheeringAudioRef.current) {
        cheeringAudioRef.current.pause();
        cheeringAudioRef.current = null;
      }
    };
  }, []);
  
  // Function to provide feedback when count is clicked
  const provideFeedback = (isIncrement: boolean = true) => {
    // Determine the count to check for milestone
    // We check the current count for decrements, and the count+1 for increments
    const checkCount = isIncrement ? goal.count + 1 : goal.count;
    
    // Determine which milestone (if any) we've reached
    let audioRef = dingAudioRef; // Default sound
    let vibrationLength = 50; // Default vibration length in ms
    let isMilestone = false;
    
    if (checkCount > 0) {
      if (checkCount % 20 === 0) {
        // Major milestone (divisible by 20) - play cheering sound
        audioRef = cheeringAudioRef;
        vibrationLength = 150; // Longer vibration for major milestones
        isMilestone = true;
      } else if (checkCount % 10 === 0) {
        // Regular milestone (divisible by 10 but not 20) - play trumpet sound
        audioRef = trumpetAudioRef;
        vibrationLength = 100; // Medium vibration for regular milestones
        isMilestone = true;
      } else if (checkCount % 5 === 0) {
        // Minor milestone (divisible by 5 but not 10 or 20)
        isMilestone = true;
      }
    }
    
    // Play the selected sound
    if (audioRef.current) {
      // Reset the audio to the beginning if it's already playing
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Silently handle errors - often due to user interaction requirements
        console.log('Audio playback failed:', error);
      });
    }
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(vibrationLength);
    }
    
    // Trigger confetti effect for milestones
    if (isIncrement && isMilestone) {
      triggerConfettiEffect(checkCount);
    }
  };
  
  // Track if the pointer is down
  const isPointerDown = useRef(false);
  
  const status: GoalStatus = calculateGoalStatus(goal);
  
  // Handle pointer down event
  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default behavior
    e.preventDefault();
    
    // Mark pointer as down
    isPointerDown.current = true;
    
    // Set a timer for long press
    const timer = setTimeout(() => {
      if (isPointerDown.current) {
        setIsLongPress(true);
        
        // Check if shift key is pressed for decrement
        if (e.shiftKey && onDecrement) {
          // Decrement on shift + long press (no feedback)
          onDecrement();
        } 
        // Start session on long press for all devices if not shift-pressing
        else if (onStartSession) {
          onStartSession(goal);
          setShowSessionTimer(true);
        }
      }
    }, 800); // Increased from 500ms to 800ms for long press
    
    setLongPressTimer(timer);
  };
  
  // Handle pointer up event
  const handlePointerUp = () => {
    // Mark pointer as up
    isPointerDown.current = false;
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Reset long press state
    setIsLongPress(false);
  };
  
  // Handle pointer leave event
  const handlePointerLeave = () => {
    isPointerDown.current = false;
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  // Handle session completion
  const handleSessionComplete = () => {
    setShowSessionTimer(false);
    // Reset the long press state to ensure the card returns to normal size
    setIsLongPress(false);
    // Sessions now increment the goal count through the SessionCompletionForm
    // We no longer need to increment here
  };
  
  // Handle session cancellation
  const handleSessionCancel = () => {
    setShowSessionTimer(false);
    // Reset the long press state to ensure the card returns to normal size
    setIsLongPress(false);
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);
  
  // Track clicks on the goal card to detect confusion
  const trackCardClick = () => {
    const now = Date.now();
    
    // If it's been too long since the last click, reset the counter
    if (now - lastClickTime.current > CLICK_TIMEOUT) {
      clickCount.current = 0;
    }
    
    // Increment click count and update last click time
    clickCount.current += 1;
    lastClickTime.current = now;
    
    // If user has clicked multiple times in a short period, they might be confused
    if (clickCount.current >= CLICK_THRESHOLD) {
      setShowHelpTooltip(true);
      clickCount.current = 0; // Reset after showing help
    }
  };
  
  // Handle closing the help tooltip
  const handleCloseTooltip = () => {
    setShowHelpTooltip(false);
  };
  
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };
  
  // Get the status color based on the goal status
  const statusColors: Record<string, string> = {
    'completed': 'bg-green-600',
    'in-progress': 'bg-blue-600',
    'not-started': 'bg-gray-600',
    'past-due': 'bg-red-600',
    'active': 'bg-[#2f8f69]',
    'out-of-cadence': 'bg-yellow-600'
  };

  return (
    <div className="relative">
      {/* Help tooltip */}
      <HelpTooltip 
        isVisible={showHelpTooltip} 
        onClose={handleCloseTooltip} 
      />
      
      {/* Session Timer (rendered outside the goal card as a modal) */}
      {showSessionTimer && (
        <SessionTimer
          goal={goal}
          onComplete={handleSessionComplete}
          onCancel={handleSessionCancel}
        />
      )}
      
      <div 
        className={`relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 text-white font-medium min-h-[180px] w-full mb-4 
          ${statusColors[status]} 
          border-2 border-t-white/30 border-l-white/30 border-r-black/10 border-b-black/20
          shadow-md
          hover:translate-y-[-2px] hover:shadow-lg hover:border-t-white/40 hover:border-l-white/40
          active:translate-y-[1px] active:shadow-inner active:scale-[0.98] active:border-t-black/10 active:border-l-black/10 active:border-r-white/20 active:border-b-white/10
          select-none touch-none 
          ${isLongPress ? 'scale-95 opacity-90 border-t-black/10 border-l-black/10 border-r-white/20 border-b-white/10' : ''}
        `}
        onClick={trackCardClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Drag handle */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-6 flex flex-col items-center justify-center gap-[3px] z-10"
          onPointerDown={(e) => {
            // Stop propagation to prevent the long press from triggering the session timer
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            // Stop propagation to prevent the long press from triggering the session timer
            e.stopPropagation();
          }}
        >
          <div className="w-6 h-[2px] bg-white/20 rounded-full"></div>
          <div className="w-6 h-[2px] bg-white/20 rounded-full"></div>
          <div className="w-6 h-[2px] bg-white/20 rounded-full"></div>
        </div>

        {/* Count indicator */}
        <div 
          className="absolute top-2 right-2 bg-white/30 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-white/50 active:bg-white/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            
            // Check if shift key is pressed for decrement
            const isDecrement = e.shiftKey && onDecrement;
            
            // Only provide feedback for increments, not decrements
            if (!isDecrement) {
              provideFeedback(true);
            }
            
            // Execute the appropriate action
            if (isDecrement) {
              onDecrement && onDecrement();
            } else {
              onClick();
            }
          }}
        >
          {goal.count}
        </div>
        
        {/* Info/Edit button */}
        <div 
          className="absolute top-2 left-2 bg-white/30 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-white/50 active:bg-white/70 transition-colors"
          onClick={handleEditClick}
        >
          Ⓘ
        </div>

        {/* Goal content */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-center text-xl font-bold mb-2 mt-4">
            {goal.name}
          </div>
          
          {goal.description && (
            <p className="text-sm opacity-90 line-clamp-2 mb-2 text-center">{goal.description}</p>
          )}
          
          <div className="text-center opacity-80 mb-auto">
            <div className="text-sm">Total Practice Sessions: {goal.count}</div>
            <div className="text-sm">Cadence is {goal.targetCount} per {formatCadence(goal.cadence).replace('ly', '')}</div>
          </div>
          
          {/* Link button container - always the same height */}
          <div className="mt-3 h-8 flex items-center justify-center">
            {goal.link ? (
              <a 
                href={goal.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 active:bg-white/10 transition-colors text-sm"
              >
                Link
              </a>
            ) : null}
          </div>
          
          {/* Due date (if set) */}
          {goal.dueDate && (
            <div className="mt-2">
              <p className={`text-sm ${status === 'past-due' ? 'text-red-200 font-bold' : 'text-white/80'}`}>
                Due: {formatDate(goal.dueDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalButton;
