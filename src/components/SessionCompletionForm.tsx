import React, { useState } from 'react';
import type { Goal } from '../types';
import { useSession } from '../context/SessionContext';
import { useGoals } from '../context/GoalContext';

interface SessionCompletionFormProps {
  goal: Goal;
  sessionDuration: number;
  onClose: () => void;
}

const SessionCompletionForm: React.FC<SessionCompletionFormProps> = ({ 
  goal, 
  sessionDuration, 
  onClose 
}) => {
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { createNewSession } = useSession();
  const { incrementGoalCount } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting session with data:', {
        goal_id: goal.id,
        session_date: new Date().toISOString(),
        count: 1,
        duration: sessionDuration,
        mood: mood,
        notes: notes,
        location: location
      });
      
      // Create the new session
      const newSession = await createNewSession({
        goal_id: goal.id,
        session_date: new Date().toISOString(), // Save the full ISO timestamp with time
        count: 1,
        duration: sessionDuration,
        mood: mood || undefined,
        notes: notes || undefined,
        location: location || undefined
      });
      
      console.log('Session created successfully:', newSession);
      
      // Increment the goal count
      await incrementGoalCount(goal.id);
      
      // Close the form after successful submission
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('There was an error saving your session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Session Complete</h3>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{goal.name}</p>
            <div className="text-sm font-medium">
              Duration: <span className="font-semibold">{Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did it go?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(value)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    mood === value 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value <= 2 ? '😕' : value === 3 ? '😐' : '😊'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="What did you work on? Any breakthroughs?"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location (optional)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              placeholder="Where did you practice?"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-sm px-3 py-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary text-sm px-3 py-1"
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionCompletionForm;
