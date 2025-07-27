import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useGoals } from '../context/GoalContext';
import type { Goal, Session } from '../types';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import SessionTimer from '../components/SessionTimer';

const Sessions: React.FC = () => {
  const { sessions, activeGoalId, setActiveGoalId, isLoading, deleteExistingSession } = useSession();
  const { goals } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSessionTimer, setShowSessionTimer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);



  // Set selected goal based on activeGoalId or default to most recent
  useEffect(() => {

    
    if (goals.length === 0) return;
    
    // If there's an active goal, select it
    if (activeGoalId) {
      const activeGoal = goals.find(goal => goal.id === activeGoalId);
      if (activeGoal) {

        setSelectedGoal(activeGoal);
        return;
      }
    }
    
    // Default to the most recently updated goal

    const mostRecentGoal = [...goals]
      .filter((g: Goal) => g.isActive)
      .sort((a: Goal, b: Goal) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    
    if (mostRecentGoal) {

      setSelectedGoal(mostRecentGoal);
      // Only set active goal ID if there isn't one already
      if (!activeGoalId) {

        setActiveGoalId(mostRecentGoal.id);
      }
    }
  }, [goals, activeGoalId, setActiveGoalId]);
  
  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  
  // Log when sessions change
  useEffect(() => {

    
    // Mark data as loaded once we have sessions or explicitly know there are none
    if (!initialDataLoaded && !isLoading) {
      setInitialDataLoaded(true);
    }
  }, [sessions, selectedGoal, isLoading, initialDataLoaded]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const goalId = e.target.value;
    const goal = goals.find(g => g.id === goalId) || null;
    setSelectedGoal(goal);
    setActiveGoalId(goalId);
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getMoodEmoji = (mood: number | undefined): string => {
    if (!mood) return '';
    return mood <= 2 ? '😕' : mood === 3 ? '😐' : '😊';
  };
  
  const getMoodText = (mood: number | undefined): string => {
    if (!mood) return '';
    if (mood <= 2) return 'Needs improvement';
    if (mood === 3) return 'Okay';
    return 'Great';
  };
  
  // Handle session deletion
  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteSession = async () => {
    if (sessionToDelete) {
      try {
        await deleteExistingSession(sessionToDelete.id);
        setShowDeleteConfirm(false);
        setSessionToDelete(null);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };
  
  const cancelDeleteSession = () => {
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      
      <div className="mb-6">
        <div className="flex justify-between items-end">
          <div className="flex-grow">
            <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Goal
            </label>
          </div>
          <div className="flex-shrink-0 ml-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">
              Action
            </label>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex-grow mr-2">
            <select
              id="goalSelect"
              value={selectedGoal?.id || ''}
              onChange={handleGoalChange}
              className="form-select w-full"
            >
              <option value="" disabled>Select a goal</option>
              {goals
                .filter((goal: Goal) => goal.isActive)
                .map((goal: Goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowSessionTimer(true)}
              disabled={!selectedGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-150 shadow active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed h-full select-none"
            >
              New Session
            </button>
          </div>
        </div>
      </div>

      {/* Session Timer Modal */}
      {showSessionTimer && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">New Session: {selectedGoal.name}</h2>
              <button 
                onClick={() => setShowSessionTimer(false)}
                className="text-gray-500 hover:text-gray-700 active:text-gray-900 active:scale-90 transition-all duration-150"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <SessionTimer 
                goal={selectedGoal} 
                onComplete={() => setShowSessionTimer(false)}
                onCancel={() => setShowSessionTimer(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && sessionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Session</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700">Are you sure you want to delete this session? This action cannot be undone.</p>
              <p className="mt-2 text-sm text-gray-500">
                {format(
                  toZonedTime(
                    parseISO(sessionToDelete.session_date), 
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  ),
                  'MMM d, yyyy h:mm a'
                )}
              </p>
            </div>
            
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
              <button 
                onClick={cancelDeleteSession}
                className="btn btn-secondary text-sm px-3 py-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteSession}
                className="btn btn-danger text-sm px-3 py-1 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 active:scale-95 transition-all duration-150 shadow active:shadow-inner select-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && !initialDataLoaded ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No practice sessions found for this goal.</p>
          <p className="text-sm text-gray-500 mb-4">Use the "New Session" button above to start tracking your practice.</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md inline-block mx-auto">
            <p className="text-sm text-blue-700 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Pro Tip:</strong> You can also press on a goal in the <strong>Goals tab</strong> to quickly start a new session.</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">
                    {format(
                      toZonedTime(
                        parseISO(session.session_date), 
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
                      'MMM d, yyyy h:mm a'
                    )}
                  </div>
                  <div className="font-medium flex items-center">
                    <span>Duration: {formatDuration(session.duration)}</span>
                    {session.mood && (
                      <div className="flex items-center ml-3">
                        <div className="text-xl mr-1">
                          {getMoodEmoji(session.mood)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getMoodText(session.mood)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleDeleteClick(session)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete session"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {session.notes && (
                <div className="mt-2 text-gray-700 text-sm border-t border-gray-100 pt-2">
                  {session.notes}
                </div>
              )}
              
              {session.location && (
                <div className="mt-2 text-xs text-gray-500">
                  📍 {session.location}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
