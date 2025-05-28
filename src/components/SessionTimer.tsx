import React, { useState, useEffect, useRef } from 'react';
import type { Goal } from '../types';
import SessionCompletionForm from './SessionCompletionForm';

interface SessionTimerProps {
  goal: Goal;
  onComplete: () => void;
  onCancel: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ goal, onComplete, onCancel }) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showCompletionForm, setShowCompletionForm] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  
  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start/pause timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const handleCompleteSession = () => {
    // Stop the timer
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Show the completion form instead of immediately creating a session
    setShowCompletionForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      {showCompletionForm ? (
        <SessionCompletionForm 
          goal={goal} 
          sessionDuration={seconds} 
          onClose={onComplete} 
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Practice Session</h3>
            <p className="text-sm text-gray-600">{goal.name}</p>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <div className="text-6xl font-mono font-bold mb-8">
              {formatTime(seconds)}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleToggleTimer}
                className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
            <button 
              onClick={onCancel}
              className="btn btn-secondary text-sm px-3 py-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleCompleteSession}
              className="btn btn-primary text-sm px-3 py-1"
            >
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
