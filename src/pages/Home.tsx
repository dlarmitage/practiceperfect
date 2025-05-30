import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import { useSession } from '../context/SessionContext';
// We don't need to import SortMethod since we're using it directly from the context
import type { Goal } from '../types';
import GoalButton from '../components/GoalButton';
import GoalForm from '../components/GoalForm';
import ConfirmationModal from '../components/ConfirmationModal';
import PositionSelectModal from '../components/PositionSelectModal';
import { generateWelcomeMessage } from '../services/openai';
import PWAInstallModal from '../components/PWAInstallModal';
import { isRunningAsPWA } from '../utils/deviceDetection';

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
    decrementGoalCount,
    deleteGoal,
    showInactive,
    setShowInactive,
    sortMethod,
    setSortMethod,
    updateGoalOrder
  } = useGoals();
  const { setActiveGoalId } = useSession();
  
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  // Removed unused isLoading state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [dragOverGoal, setDragOverGoal] = useState<Goal | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [currentPosition] = useState(0); // setCurrentPosition is unused
  const [isPWA, setIsPWA] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  
  // Ref to track if we're currently reordering goals
  const isReordering = useRef(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Check if the app is running as a PWA and if we should show the install prompt
  useEffect(() => {
    // Check if app is running as PWA
    const isPWAStatus = isRunningAsPWA();
    setIsPWA(isPWAStatus);
    
    // Don't show prompt if already running as PWA
    if (isPWAStatus) return;
    
    // Check if user has dismissed the prompt permanently
    const dontShowAgain = localStorage.getItem('pwa_install_dont_show_again');
    if (dontShowAgain === 'true') return;
    
    // Only show prompt if user has been active (has goals)
    if (goals.length > 0) {
      // Wait a moment before showing the modal for better UX
      const timer = setTimeout(() => {
        setShowPWAPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [goals.length]);
  
  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      window.deferredPrompt = e;
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
      // setIsLoading removed (was unused)
    };

    if (!goalsLoading && user) {
      fetchWelcomeMessage();
      
      // Mark initial data as loaded once we've fetched goals
      if (!initialDataLoaded) {
        setInitialDataLoaded(true);
      }
    }
  }, [goals, goalsLoading, user]);

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const handleGoalClick = async (goalId: string) => {
    try {
      await incrementGoalCount(goalId);
    } catch (error) {
      console.error('Error incrementing goal count:', error);
    }
  };
  
  const handleGoalDecrement = async (goalId: string) => {
    try {
      await decrementGoalCount(goalId);
    } catch (error) {
      console.error('Error decrementing goal count:', error);
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
          // setIsLoading removed (was unused)
          // setIsLoading removed (was unused)
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
        // setIsLoading removed (was unused)
        
        const result = await deleteGoal(selectedGoal.id);
        console.log(`Home: Delete goal result:`, result);
        
        setShowDeleteConfirmation(false);
        setIsFormOpen(false);
        setSelectedGoal(null);
        
        // Ensure UI is refreshed
        // setIsLoading removed (was unused)
      } catch (error) {
        console.error('Home: Error deleting goal:', error);
        // Show error in UI if needed
        // setIsLoading removed (was unused)
        
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
  // Removed unused isMobile state
  useEffect(() => {
    const checkIfMobile = () => {
      // setIsMobile removed (was unused)
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle drag start for custom sorting
  const handleDragStart = (goal: Goal) => {
    // If not already in custom sort mode, switch to it
    if (sortMethod !== 'custom') {
      setSortMethod('custom');
    }
    isDragging.current = true;
    setDraggedGoal(goal);
    // Set a timestamp when drag starts
    lastDragEndTime.current = Date.now();
  };
  
  // Removed unused handleTouchStart function
  
  // Handle touch move for mobile drag and drop
  const handleTouchMove = (e: React.TouchEvent, goal: Goal) => {
    if (!touchedGoal.current) return;
    
    // If not already in custom sort mode, switch to it
    if (sortMethod !== 'custom') {
      setSortMethod('custom');
    }
    
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
    if (!touchedGoal.current) return;
    
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
        // setIsLoading removed (was unused)
        
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
        // setIsLoading removed (was unused)
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
    if (!draggedGoal || draggedGoal.id === goal.id) return;
    
    // If not already in custom sort mode, switch to it
    if (sortMethod !== 'custom') {
      setSortMethod('custom');
    }
    
    setDragOverGoal(goal);
  };
  
  // Handle drop for custom sorting
  const handleDrop = async (e: React.DragEvent, targetGoal: Goal) => {
    e.preventDefault();
    if (!draggedGoal || draggedGoal.id === targetGoal.id) return;
    
    // If not already in custom sort mode, switch to it
    if (sortMethod !== 'custom') {
      setSortMethod('custom');
    }
    
    // Prevent multiple reordering operations at once
    if (isReordering.current) return;
    isReordering.current = true;
    
    try {
      // setIsLoading removed (was unused)
      
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
      // setIsLoading removed (was unused)
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

  // Skip loading indicator completely - just render the content
  // This ensures no loading indicator is shown when switching tabs
  // We'll still set initialDataLoaded for consistency
  useEffect(() => {
    if (goalsLoading === false) {
      setInitialDataLoaded(true);
    }
  }, [goalsLoading]);
  
  // Only show loading during initial authentication
  if (authLoading && !user) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome message - only show when there are goals */}
        {goals.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">{welcomeMessage}</p>
          </div>
        )}
        
        {/* PWA Installation Modal */}
        {showPWAPrompt && !isPWA && (
          <PWAInstallModal 
            onClose={() => setShowPWAPrompt(false)}
            onDontShowAgain={() => {
              localStorage.setItem('pwa_install_dont_show_again', 'true');
              setShowPWAPrompt(false);
            }}
          />
        )}
        
        {/* Controls - only show when there are goals */}
        {goals.length > 0 && (
          <div className="flex justify-between items-center mb-6 space-x-2 overflow-x-auto">
            {/* Left side controls */}
            <div className="flex items-center flex-shrink-0">
              <input
                type="checkbox"
                id="show-inactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="show-inactive" className="ml-2 text-sm text-gray-700 whitespace-nowrap">
                Show Inactive
              </label>
            </div>
            
            {/* Right side controls grouped together */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Mobile-friendly sort toggle buttons */}
              <div className="flex items-center flex-shrink-0">
                <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs sm:text-sm ${sortMethod === 'newest' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSortMethod('newest')}
                    aria-label="Sort by newest"
                  >
                    Newest
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs sm:text-sm border-l border-r border-gray-300 ${sortMethod === 'oldest' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSortMethod('oldest')}
                    aria-label="Sort by oldest"
                  >
                    Oldest
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs sm:text-sm ${sortMethod === 'custom' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSortMethod('custom')}
                    aria-label="Sort by custom order"
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {/* Add Goal button */}
              <button
                onClick={handleCreateGoal}
                className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800 active:scale-95 transition-all"
                aria-label="Add Goal"
              >
                {/* Plus icon always visible */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                
                {/* Text only visible on larger screens */}
                <span className="hidden sm:inline-block ml-2">Add Goal</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Goals grid */}
        {filteredGoals.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
            {goals.length === 0 ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">Welcome to Practice Perfect!</h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                  Track your practice goals and improve your skills with deliberate practice.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleCreateGoal}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Your First Goal
                  </button>
                </div>
                
                <div className="mt-6 bg-blue-50 p-5 rounded-lg border border-blue-100 text-left max-w-lg mx-auto">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    How to use Practice Perfect:
                  </h4>
                  
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path>
                        </svg>
                      </div>
                      <span><b>Quick tap</b> on a goal to quickly log that you practiced it</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <span><b>Long press</b> on a goal to start a timed practice session</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <span>Sessions track your practice duration, mood, and notes for better insights</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                      </div>
                      <span>View your practice history in the Sessions tab</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <span>Track your progress with charts and statistics in the Analysis tab</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 pt-3 border-t border-blue-100 text-center">
                    <span className="text-blue-700 text-sm font-medium">Start by creating your first goal!</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                You don't have any active goals. Enable 'Show Inactive' to see your inactive goals.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-6 sm:px-0">
            {filteredGoals.map((goal) => (
              <div 
                key={goal.id}
                className={`relative ${dragOverGoal?.id === goal.id ? 'border-2 border-blue-400 rounded-lg' : ''} ${draggedGoal?.id === goal.id ? 'opacity-50 transform scale-105' : ''}`}
                draggable={sortMethod === 'custom'}
                onDragStart={() => handleDragStart(goal)}
                onDragOver={(e) => handleDragOver(e, goal)}
                onDrop={(e) => handleDrop(e, goal)}
                onDragEnd={handleDragEnd}
                onTouchMove={(e) => handleTouchMove(e, goal)}
                onTouchEnd={(e) => handleTouchEnd(e, goal)}
              >
                {/* Drag handle removed - now using the one in GoalButton */}
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
                    onDecrement={() => handleGoalDecrement(goal.id)}
                    onEdit={() => handleGoalEdit(goal)}
                    onStartSession={() => setActiveGoalId(goal.id)}
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
