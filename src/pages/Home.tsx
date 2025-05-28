import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import type { SortMethod } from '../context/GoalContext';
import GoalButton from '../components/GoalButton';
import GoalForm from '../components/GoalForm';
import ConfirmationModal from '../components/ConfirmationModal';
import PositionSelectModal from '../components/PositionSelectModal';
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
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [dragOverGoal, setDragOverGoal] = useState<Goal | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  
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
    setSelectedGoal(null);
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
      setSelectedGoal(null);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedGoal(null);
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
        setSelectedGoal(null);
        
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
  // Track touch position for mobile drag and drop
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchedGoal = useRef<Goal | null>(null);
  
  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle drag start for custom sorting
  const handleDragStart = (goal: Goal) => {
    if (sortMethod !== 'custom') return;
    isDragging.current = true;
    setDraggedGoal(goal);
    // Set a timestamp when drag starts
    lastDragEndTime.current = Date.now();
  };
  
  // Handle touch start for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, goal: Goal) => {
    if (sortMethod !== 'custom') return;
    
    // Record the starting position
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchedGoal.current = goal;
    
    // Don't prevent default here to allow normal touch behavior initially
  };
  
  // Handle touch move for mobile drag and drop
  const handleTouchMove = (e: React.TouchEvent, goal: Goal) => {
    if (sortMethod !== 'custom' || !touchedGoal.current) return;
    
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    
    // If we've moved enough to consider it a drag
    const moveThreshold = 10; // pixels
    if (Math.abs(touchY - touchStartY.current) > moveThreshold || 
        Math.abs(touchX - touchStartX.current) > moveThreshold) {
      // Once we determine it's a drag, prevent default browser behavior
      // This prevents the page from scrolling or the browser from interpreting
      // this as a swipe gesture
      e.preventDefault();
      e.stopPropagation();
      
      // Set dragging state
      isDragging.current = true;
      setDraggedGoal(touchedGoal.current);
      setDragOverGoal(goal);
      
      // Add a class to the body to prevent scrolling
      document.body.classList.add('dragging');
    }
  };
  
  // Handle touch end for mobile drag and drop
  const handleTouchEnd = async (e: React.TouchEvent, targetGoal: Goal) => {
    if (sortMethod !== 'custom' || !touchedGoal.current) return;
    
    // Remove the dragging class from the body
    document.body.classList.remove('dragging');
    
    // If we were dragging and have a target
    if (isDragging.current && draggedGoal && dragOverGoal) {
      e.preventDefault();
      e.stopPropagation();
      
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
        
        // Update the sort order in the database - directly use updateGoalOrder to preserve timestamp
        await updateGoalOrder(draggedGoal.id, newSortOrder);
      } catch (error) {
        console.error('Error reordering goals:', error);
      } finally {
        setDraggedGoal(null);
        setDragOverGoal(null);
        setIsLoading(false);
        isReordering.current = false;
      }
    }
    
    // Reset touch tracking
    touchedGoal.current = null;
    lastDragEndTime.current = Date.now();
    
    // Set a timeout before allowing clicks again
    setTimeout(() => {
      isDragging.current = false;
    }, 300);
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

  // Remove duplicate declarations

  if (authLoading || goalsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10" />
          <Avatar size="md" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome message */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-700">{welcomeMessage}</p>
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show-inactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show-inactive" className="ml-2 text-sm text-gray-700 whitespace-nowrap">
                Show Inactive
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value as SortMethod)}
                className="form-select text-sm pr-8"
                aria-label="Sort goals by"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="custom">Custom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <button
              onClick={handleCreateGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Add new goal"
            >
              + New Goal
            </button>
          </div>
        </div>
        
        {/* Goals grid */}
        {filteredGoals.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600">
              {goals.length === 0 
                ? "You don't have any goals yet. Create your first goal to get started!" 
                : "You don't have any active goals. Enable 'Show Inactive' to see your inactive goals."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGoals.map((goal) => (
              <div 
                key={goal.id}
                className={`relative ${dragOverGoal?.id === goal.id ? 'border-2 border-blue-400 rounded-lg' : ''} ${sortMethod === 'custom' ? 'cursor-move' : ''} ${draggedGoal?.id === goal.id ? 'opacity-50 transform scale-105' : ''}`}
                draggable={sortMethod === 'custom'}
                onDragStart={() => handleDragStart(goal)}
                onDragOver={(e) => handleDragOver(e, goal)}
                onDrop={(e) => handleDrop(e, goal)}
                onDragEnd={handleDragEnd}
                onTouchMove={(e) => handleTouchMove(e, goal)}
                onTouchEnd={(e) => handleTouchEnd(e, goal)}
              >
                {sortMethod === 'custom' && (
                  <div 
                    className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-sm cursor-move hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      if (isMobile && sortMethod === 'custom') {
                        // On mobile, show position selection modal
                        const position = filteredGoals.findIndex(g => g.id === goal.id) + 1;
                        setSelectedGoal(goal);
                        setCurrentPosition(position);
                        setShowPositionModal(true);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!isMobile && sortMethod === 'custom') {
                        // On desktop, use drag and drop
                        e.stopPropagation();
                        handleTouchStart(e, goal);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <GoalForm
              goal={selectedGoal || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              onDelete={selectedGoal ? handleDeleteGoal : undefined}
            />
          </div>
        </div>
      )}
      
      {/* Position selection modal for mobile */}
      {showPositionModal && selectedGoal && (
        <PositionSelectModal
          goal={selectedGoal}
          totalGoals={filteredGoals.length}
          currentPosition={currentPosition}
          onClose={() => setShowPositionModal(false)}
          onPositionSelect={async (goalId, newPosition) => {
            // Convert 1-based position to 0-based index
            const targetIndex = newPosition - 1;
            
            // Calculate new sort order
            let newSortOrder: number;
            
            if (targetIndex === 0) {
              // If moving to the beginning, use a value smaller than the first item
              newSortOrder = ((filteredGoals[0] as any).sortOrder || 0) - 10;
            } else if (targetIndex === filteredGoals.length - 1) {
              // If moving to the end, use a value larger than the last item
              newSortOrder = ((filteredGoals[filteredGoals.length - 1] as any).sortOrder || 0) + 10;
            } else {
              // If moving to the middle, use the average of the target and the next item
              const targetGoal = filteredGoals[targetIndex];
              const nextGoal = filteredGoals[targetIndex + 1] || targetGoal;
              newSortOrder = (((targetGoal as any).sortOrder || 0) + ((nextGoal as any).sortOrder || 0)) / 2;
            }
            
            // Update the goal's sort order
            await updateGoalOrder(goalId, newSortOrder);
          }}
        />
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
