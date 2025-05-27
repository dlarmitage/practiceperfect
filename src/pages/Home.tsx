import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import type { SortMethod } from '../context/GoalContext';
import GoalButton from '../components/GoalButton';
import GoalForm from '../components/GoalForm';
import ConfirmationModal from '../components/ConfirmationModal';
import Avatar from '../components/Avatar';
import { generateWelcomeMessage } from '../services/openai';
import type { Goal } from '../types';

/**
 * Home page component displaying the user's goals
 */
const Home: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    goals, 
    loading: goalsLoading, 
    createGoal, 
    updateGoal, 
    incrementGoalCount, 
    deleteGoal,
    showInactive,
    setShowInactive,
    sortMethod,
    setSortMethod,
    updateGoalOrder
  } = useGoals();
  
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [dragOverGoal, setDragOverGoal] = useState<Goal | null>(null);
  
  // Ref to track if we're currently reordering goals
  const isReordering = useRef(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      // Get the user's first name from user metadata if available
      const firstName = user?.user_metadata?.display_name || '';
      
      if (goals.length > 0) {
        try {
          const message = await generateWelcomeMessage(goals, firstName);
          setWelcomeMessage(message);
        } catch (error) {
          console.error('Error generating welcome message:', error);
          const defaultMessage = firstName 
            ? `Welcome to PracticePerfect, ${firstName}! Track your practice sessions and achieve your goals.`
            : 'Welcome to PracticePerfect! Track your practice sessions and achieve your goals.';
          setWelcomeMessage(defaultMessage);
        }
      } else {
        const defaultMessage = firstName 
          ? `Welcome to PracticePerfect, ${firstName}! Create your first goal to start tracking your practice sessions.`
          : 'Welcome to PracticePerfect! Create your first goal to start tracking your practice sessions.';
        setWelcomeMessage(defaultMessage);
      }
      setIsLoading(false);
    };

    if (!goalsLoading && user) {
      fetchWelcomeMessage();
    }
  }, [goals, goalsLoading, user]);

  const handleGoalClick = async (goalId: string) => {
    try {
      await incrementGoalCount(goalId);
    } catch (error) {
      console.error('Error incrementing goal count:', error);
    }
  };

  const handleGoalEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleCreateGoal = () => {
    setSelectedGoal(undefined);
    setIsFormOpen(true);
  };

  // Define the type for goal form data
  type GoalFormData = Omit<Goal, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>;

  const handleFormSubmit = async (goalData: GoalFormData) => {
    try {
      if (selectedGoal) {
        // Update existing goal
        const updatedGoal = await updateGoal(selectedGoal.id, goalData);
        console.log('Goal updated successfully:', updatedGoal);
      } else if (user) {
        // Create a new goal
        const goalToCreate = {
          name: goalData.name,
          description: goalData.description,
          count: goalData.count,
          targetCount: goalData.targetCount,
          cadence: goalData.cadence,
          isActive: goalData.isActive,
          startDate: goalData.startDate,
          dueDate: goalData.dueDate,
          link: goalData.link,
          user_id: user.id // Include user_id to match the expected type
        };
        
        // Create the goal and store the result
        const createdGoal = await createGoal(goalToCreate);
        console.log('Goal created successfully:', createdGoal);
        
        // The context should have already updated the goals array,
        // but we'll force a refresh of the goals list just to be sure
        setTimeout(() => {
          // This will trigger a re-render with the updated goals
          setIsLoading(true);
          setIsLoading(false);
        }, 100);
      }
      
      // Close the form
      setIsFormOpen(false);
      setSelectedGoal(undefined);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedGoal(undefined);
  };

  const handleDeleteGoal = () => {
    // Show the confirmation modal instead of using window.confirm
    if (selectedGoal) {
      setShowDeleteConfirmation(true);
    }
  };
  
  const confirmDeleteGoal = async () => {
    if (selectedGoal) {
      try {
        console.log(`Home: Attempting to delete goal: ${selectedGoal.name} (${selectedGoal.id})`);
        // Set loading state while deletion is in progress
        setIsLoading(true);
        
        const result = await deleteGoal(selectedGoal.id);
        console.log(`Home: Delete goal result:`, result);
        
        setShowDeleteConfirmation(false);
        setIsFormOpen(false);
        setSelectedGoal(undefined);
        
        // Ensure UI is refreshed
        setIsLoading(false);
      } catch (error) {
        console.error('Home: Error deleting goal:', error);
        // Show error in UI if needed
        setIsLoading(false);
        
        // Even if there's an error, close the modal
        setShowDeleteConfirmation(false);
      }
    }
  };
  
  const cancelDeleteGoal = () => {
    setShowDeleteConfirmation(false);
  };

  const filteredGoals = showInactive 
    ? goals 
    : goals.filter(goal => goal.isActive);
    
  // Track if we're currently dragging to prevent click events
  const isDragging = useRef(false);
  // Track when the last drag ended to prevent clicks immediately after
  const lastDragEndTime = useRef(0);
  
  // Handle drag start for custom sorting
  const handleDragStart = (goal: Goal) => {
    if (sortMethod !== 'custom') return;
    isDragging.current = true;
    setDraggedGoal(goal);
    // Set a timestamp when drag starts
    lastDragEndTime.current = Date.now();
  };
  
  // Handle drag over for custom sorting
  const handleDragOver = (e: React.DragEvent, goal: Goal) => {
    e.preventDefault();
    if (sortMethod !== 'custom' || !draggedGoal || draggedGoal.id === goal.id) return;
    setDragOverGoal(goal);
  };
  
  // Handle drop for custom sorting
  const handleDrop = async (e: React.DragEvent, targetGoal: Goal) => {
    e.preventDefault();
    if (sortMethod !== 'custom' || !draggedGoal || draggedGoal.id === targetGoal.id) return;
    
    // Prevent multiple reordering operations at once
    if (isReordering.current) return;
    isReordering.current = true;
    
    try {
      setIsLoading(true);
      
      // Find the indices of the dragged and target goals
      const draggedIndex = filteredGoals.findIndex(g => g.id === draggedGoal.id);
      const targetIndex = filteredGoals.findIndex(g => g.id === targetGoal.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return;
      
      // Calculate new sort orders for the dragged goal
      let newSortOrder: number;
      
      if (targetIndex === 0) {
        // If dropping at the beginning, use a value smaller than the first item
        newSortOrder = ((targetGoal as any).sortOrder || 0) - 10;
      } else if (targetIndex === filteredGoals.length - 1) {
        // If dropping at the end, use a value larger than the last item
        newSortOrder = ((targetGoal as any).sortOrder || 0) + 10;
      } else {
        // If dropping in the middle, use the average of the target and the next item
        const nextGoal = filteredGoals[targetIndex + (draggedIndex < targetIndex ? 1 : -1)];
        newSortOrder = (((targetGoal as any).sortOrder || 0) + ((nextGoal as any).sortOrder || 0)) / 2;
      }
      
      // Update the sort order in the database
      await updateGoalOrder(draggedGoal.id, newSortOrder);
    } catch (error) {
      console.error('Error reordering goals:', error);
    } finally {
      setDraggedGoal(null);
      setDragOverGoal(null);
      setIsLoading(false);
      isReordering.current = false;
    }
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggedGoal(null);
    setDragOverGoal(null);
    
    // Record when the drag ended
    lastDragEndTime.current = Date.now();
    
    // Set a timeout before allowing clicks again
    // This prevents the click event from firing immediately after drag ends
    setTimeout(() => {
      isDragging.current = false;
    }, 300); // Increased timeout to ensure no accidental clicks
  };

  if (authLoading || goalsLoading || isLoading) {
    return (
      <div className="auth-container">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header">
        <div className="header-content">
          <img src="/Logo.webp" alt="PracticePerfect Logo" className="logo-image" />
          <Avatar size="md" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome message */}
        <div className="welcome-message">
          <p>{welcomeMessage}</p>
        </div>
        
        {/* Controls */}
        <div className="controls">
          <div className="controls-left">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="show-inactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show-inactive" className="checkbox-label">
                Inactive Goals
              </label>
            </div>
          </div>
          
          <div className="controls-right">
            <div className="sort-dropdown">
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value as SortMethod)}
                className="sort-select"
                aria-label="Sort goals by"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateGoal}
              className="primary-button"
              aria-label="Add new goal"
            >
              + New Goal
            </button>
          </div>
        </div>
        
        {/* Goals grid */}
        {filteredGoals.length === 0 ? (
          <div className="welcome-message text-center">
            <p>
              {goals.length === 0 
                ? "You don't have any goals yet. Create your first goal to get started!" 
                : "You don't have any active goals. Enable 'Show Inactive Goals' to see your inactive goals."}
            </p>
          </div>
        ) : (
          <div className="goals-grid">
            {filteredGoals.map((goal) => (
              <div 
                key={goal.id}
                className={`goal-container ${dragOverGoal?.id === goal.id ? 'drag-over' : ''} ${sortMethod === 'custom' ? 'draggable' : ''}`}
                draggable={sortMethod === 'custom'}
                onDragStart={() => handleDragStart(goal)}
                onDragOver={(e) => handleDragOver(e, goal)}
                onDrop={(e) => handleDrop(e, goal)}
                onDragEnd={handleDragEnd}
              >
                {sortMethod === 'custom' && (
                  <div className="drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6"></line>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                  </div>
                )}
                <div 
                  onClick={(e) => {
                    // Prevent click events during or immediately after dragging
                    if (sortMethod === 'custom' && (
                      isDragging.current || 
                      (Date.now() - lastDragEndTime.current < 500)
                    )) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }}
                >
                  <GoalButton
                    goal={goal}
                    onClick={() => handleGoalClick(goal.id)}
                    onEdit={() => handleGoalEdit(goal)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Goal form modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <GoalForm
              goal={selectedGoal}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              onDelete={selectedGoal ? handleDeleteGoal : undefined}
            />
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Goal"
        message={`Are you sure you want to delete ${selectedGoal?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteGoal}
        onCancel={cancelDeleteGoal}
        isDanger={true}
      />
    </div>
  );
};

export default Home;
