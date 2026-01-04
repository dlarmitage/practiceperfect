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
// import { generateWelcomeMessage } from '../services/openai'; // Commented out to eliminate OpenAI costs
// import PWAInstallModal from '../components/PWAInstallModal';
import { isRunningAsPWA } from '../utils/deviceDetection';
import { calculateGoalStatus } from '../utils/goalUtils';

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
    fetchGoals,
    showInactive,
    sortMethod,
    setSortMethod,
    updateGoalOrder
  } = useGoals();
  const { setActiveGoalId } = useSession();

  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  // Add ref to track when to update goal statuses (without affecting welcome message)
  const statusUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track per-goal status for efficient re-render
  const [goalStatuses, setGoalStatuses] = useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  // Removed unused isLoading state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [dragOverGoal, setDragOverGoal] = useState<Goal | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [currentPosition] = useState(0); // setCurrentPosition is unused
  const setIsPWA = useState(false)[1];
  const setShowPWAPrompt = useState(false)[1];
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Toast notification state for drag instruction
  const [showDragToast, setShowDragToast] = useState(false);

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

  // Show drag instruction toast when custom mode is selected
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (sortMethod === 'custom' && initialDataLoaded) {
      setShowDragToast(true);
      timer = setTimeout(() => {
        setShowDragToast(false);
      }, 20000); // Show for 20 seconds
    } else {
      // Hide toast when switching away from custom mode
      setShowDragToast(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sortMethod, initialDataLoaded]);

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

  // Array of motivational messages for the welcome message
  const motivationalMessages = [
    "Every session counts. Keep building your momentum.",
    "Small steps lead to big achievements. Stay consistent.",
    "Practice today, progress tomorrow. You're on the right path.",
    "Your dedication shapes your success. Keep going.",
    "Habits form through repetition. Stay committed.",
    "Each practice session brings you closer to your goals.",
    "You're not just practicing—you're becoming.",
    "Consistency beats intensity. Show up today.",
    "Progress isn't always loud. Trust the process.",
    "Build the habit, and the habit will build you.",
    "Your future self is thanking you for today's effort.",
    "Practice doesn't make perfect—practice makes progress."
  ];

  // Define the welcome message generation function outside useEffect to avoid recreation
  const generateWelcomeMessage = () => {
    // Get the user's first name from user metadata if available
    const firstName = user?.user_metadata?.display_name || '';

    if (goals.length > 0) {
      // Select a random motivational message from the array
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      const randomMessage = motivationalMessages[randomIndex];

      // Create the welcome message with the user's first name and the random motivational message
      const welcomeMsg = firstName
        ? `Welcome back, ${firstName}. ${randomMessage}`
        : `Welcome back. ${randomMessage}`;

      return welcomeMsg;
    } else {
      // For users with no goals, use a different message encouraging them to create goals
      const defaultMessage = firstName
        ? `Welcome to PracticePerfect, ${firstName}! Create your first goal to start tracking your practice sessions.`
        : 'Welcome to PracticePerfect! Create your first goal to start tracking your practice sessions.';
      return defaultMessage;
    }
  };

  // This effect runs only after goals are fully loaded and initialDataLoaded is true
  // Using a ref to track if we've already set the welcome message
  const welcomeMessageSet = useRef(false);
  // Store the goals length to avoid unnecessary welcome message updates
  const goalsLengthRef = useRef(0);

  useEffect(() => {
    // Only set the welcome message when we're sure goals are loaded and initialDataLoaded is true
    // And only if we haven't already set it OR if the goals array length has changed (new user, first goal)
    const shouldUpdateWelcomeMessage =
      initialDataLoaded &&
      !goalsLoading &&
      user &&
      (!welcomeMessageSet.current || goalsLengthRef.current !== goals.length);

    if (shouldUpdateWelcomeMessage) {
      // Update our refs to track state
      welcomeMessageSet.current = true;
      goalsLengthRef.current = goals.length;

      // Wait a bit to ensure all data processing is complete
      const timer = setTimeout(() => {
        const message = generateWelcomeMessage();
        setWelcomeMessage(message);
      }, 100);

      return () => clearTimeout(timer);
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      welcomeMessageSet.current = false;
    };
  }, [initialDataLoaded, goalsLoading, user, motivationalMessages]);

  // This effect sets up event-driven goal status updates that only trigger when needed
  useEffect(() => {
    // Only set up if we have goals and the user is logged in
    if (goals.length === 0 || !user || isFormOpen) return;

    // Flag to prevent multiple simultaneous checks
    let isCheckingGoals = false;

    // Track goals that need status updates and when they should update
    const goalUpdateTimes: { [goalId: string]: { goal: Goal, updateTime: number } } = {};

    // Calculate next update time for each goal based on its cadence
    goals.forEach(goal => {
      // Skip completed goals or inactive goals
      if (goal.completed || !goal.isActive) return;

      // Calculate when this goal should next update its status
      let nextUpdateTime: number | null = null;

      if (goal.cadence === 'hourly' && goal.targetCount > 0) {
        // For hourly goals, calculate exact time when it will be out of cadence
        const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
        const minutesPerUpdate = 60 / goal.targetCount;
        const msUntilOutOfCadence = minutesPerUpdate * 60 * 1000;
        nextUpdateTime = lastInteraction.getTime() + msUntilOutOfCadence;
      }
      else if (goal.cadence === 'daily' && goal.targetCount > 0) {
        // For daily goals
        const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
        const hoursPerUpdate = 24 / goal.targetCount;
        const msUntilOutOfCadence = hoursPerUpdate * 60 * 60 * 1000;
        nextUpdateTime = lastInteraction.getTime() + msUntilOutOfCadence;
      }
      else if (goal.cadence === 'weekly' && goal.targetCount > 0) {
        // For weekly goals
        const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
        const daysPerUpdate = 7 / goal.targetCount;
        const msUntilOutOfCadence = daysPerUpdate * 24 * 60 * 60 * 1000;
        nextUpdateTime = lastInteraction.getTime() + msUntilOutOfCadence;
      }

      // If we calculated a valid update time, store it
      if (nextUpdateTime !== null) {
        // Only add goals that will need updates in the future
        // This prevents immediate re-checking of already out-of-cadence goals
        if (nextUpdateTime > new Date().getTime()) {
          goalUpdateTimes[goal.id] = {
            goal,
            updateTime: nextUpdateTime
          };
        }
      }
    });

    // Function to check and update goal statuses
    const checkAndUpdateGoals = async () => {
      if (isCheckingGoals) return;
      isCheckingGoals = true;
      try {
        const now = new Date();
        let nextCheckTime = Infinity;
        let updatedStatuses: Record<string, string> = { ...goalStatuses };
        let changed = false;
        goals.forEach(goal => {
          let newStatus = '';
          if (!goal.isActive) {
            newStatus = 'inactive';
          } else if (goal.completed) {
            newStatus = 'completed';
          } else {
            newStatus = calculateGoalStatus(goal);
          }
          if (goalStatuses[goal.id] !== newStatus) {
            updatedStatuses[goal.id] = newStatus;
            changed = true;
          }
          // Calculate next update time for active, non-completed goals
          let nextUpdate: number | null = null;
          if (goal.isActive && !goal.completed) {
            if (goal.cadence === 'hourly' && goal.targetCount > 0) {
              const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
              const minutesPerUpdate = 60 / goal.targetCount;
              nextUpdate = lastInteraction.getTime() + minutesPerUpdate * 60 * 1000;
            } else if (goal.cadence === 'daily' && goal.targetCount > 0) {
              const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
              const hoursPerUpdate = 24 / goal.targetCount;
              nextUpdate = lastInteraction.getTime() + hoursPerUpdate * 60 * 60 * 1000;
            } else if (goal.cadence === 'weekly' && goal.targetCount > 0) {
              const lastInteraction = goal.lastClicked ? new Date(goal.lastClicked) : new Date(goal.startDate);
              const daysPerUpdate = 7 / goal.targetCount;
              nextUpdate = lastInteraction.getTime() + daysPerUpdate * 24 * 60 * 60 * 1000;
            }
            if (nextUpdate && nextUpdate > now.getTime()) {
              nextCheckTime = Math.min(nextCheckTime, nextUpdate);
            }
          }
        });
        if (changed) {
          setGoalStatuses(updatedStatuses);
        }
        if (nextCheckTime !== Infinity) {
          const ms = Math.max(nextCheckTime - now.getTime(), 30 * 1000);
          if (statusUpdateTimerRef.current) clearTimeout(statusUpdateTimerRef.current);
          statusUpdateTimerRef.current = setTimeout(checkAndUpdateGoals, ms);
        }
      } finally {
        isCheckingGoals = false;
      }
    };


    // Start the initial check
    checkAndUpdateGoals();

    return () => {
      // Clean up any pending timeout
      if (statusUpdateTimerRef.current) {
        clearTimeout(statusUpdateTimerRef.current);
      }
    };
  }, [goals, user, isFormOpen, fetchGoals]);

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

  // const handleCreateGoal = () => {
  //   setSelectedGoal(null);
  //   setIsFormOpen(true);
  // };

  // Define the type for goal form data
  type GoalFormData = Omit<Goal, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>;

  const handleFormSubmit = async (goalData: GoalFormData) => {
    try {
      if (selectedGoal) {
        // Update existing goal
        await updateGoal(selectedGoal.id, goalData);

      } else if (user) {
        // Create a new goal
        const goalToCreate = {
          name: goalData.name,
          description: goalData.description,
          count: goalData.count,
          targetCount: goalData.targetCount,
          cadence: goalData.cadence,
          isActive: goalData.isActive,
          completed: goalData.completed,
          startDate: goalData.startDate,
          dueDate: goalData.dueDate,
          link: goalData.link,
          user_id: user.id // Include user_id to match the expected type
        };

        // Create the goal and store the result
        await createGoal(goalToCreate);


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

        // Set loading state while deletion is in progress
        // setIsLoading removed (was unused)

        await deleteGoal(selectedGoal.id);


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

  // Handle touch start for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, goal: Goal) => {
    // Store the initial touch position
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchedGoal.current = goal;
  };

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
      console.error('❌ Error reordering goals:', error);
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

  // Pull-to-refresh state and refs
  const setIsRefreshing = useState(false)[1];
  const [pullDistance, setPullDistance] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const PULL_THRESHOLD = 60;

  // Pull-to-refresh handlers (only for main goals list)
  const handlePullTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };
  const handlePullTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullDistance(delta > 120 ? 120 : delta);
      if (mainRef.current) mainRef.current.style.overscrollBehavior = 'contain';
      e.preventDefault(); // Prevent native browser pull-to-refresh
    }
  };
  const handlePullTouchEnd = async () => {
    if (!pulling.current) return;
    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(0);
      await fetchGoals();
      setTimeout(() => setIsRefreshing(false), 800);
    } else {
      setPullDistance(0);
    }
    pulling.current = false;
    if (mainRef.current) mainRef.current.style.overscrollBehavior = '';
  };

  // Remove duplicate declarations

  // Set initialDataLoaded when goals are loaded
  // This prevents showing the welcome screen while goals are loading
  useEffect(() => {
    if (goalsLoading === false) {
      // Add a small delay to ensure all data is processed
      const timer = setTimeout(() => {
        setInitialDataLoaded(true);
      }, 300); // Increased delay to ensure goals are fully loaded
      return () => clearTimeout(timer);
    }
  }, [goalsLoading]);

  // When sort method changes, fetch without showing loading indicator
  useEffect(() => {
    if (user && initialDataLoaded) {
      fetchGoals(false);
    }
  }, [sortMethod]);

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
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <main
        className="flex-1 px-4 md:px-8 lg:px-12 pb-20 overflow-y-auto"
        ref={mainRef}
        onTouchStart={handlePullTouchStart}
        onTouchMove={handlePullTouchMove}
        onTouchEnd={handlePullTouchEnd}
      >
        {initialDataLoaded && (
          <div className="w-full">
            {/* Welcome message */}
            {welcomeMessage && (
              <div className="text-center mt-4 mb-6">
                <h2 className="text-xl font-medium text-gray-700">{welcomeMessage}</h2>
              </div>
            )}

            {/* Mobile-friendly sort selector */}
            <div className="flex justify-center mt-4 mb-6">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSortMethod('newest')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sortMethod === 'newest'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => setSortMethod('oldest')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sortMethod === 'oldest'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Oldest First
                </button>
                <button
                  onClick={() => setSortMethod('custom')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sortMethod === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Custom Order
                </button>
              </div>
            </div>

            {/* Toast notification for drag instruction */}
            <div
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-600 ease-out ${showDragToast
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                }`}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setShowDragToast(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
                <span className="text-sm font-medium">Drag the three lines to reorder goals</span>
              </div>
            </div>

            {/* Show help info only when there are no goals */}
            {filteredGoals.length === 0 ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      </svg>
                    </div>
                    <span><b>Drag</b> the three lines at the top of any goal to reorder your practice priorities (use "Custom Order" mode)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M3 8h18M3 12h18M3 16h18"></path>
                      </svg>
                    </div>
                    <span>Use the sort options above to view goals by <b>Newest First</b>, <b>Oldest First</b>, or <b>Custom Order</b></span>
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
                  <button
                    onClick={() => { setSelectedGoal(null); setIsFormOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Create your first goal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                {filteredGoals.length === 0 && "You don't have any active goals. Enable 'Show Inactive' to see your inactive goals."}
              </p>
            )}
          </div>
        )}
        {initialDataLoaded && filteredGoals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGoals.map((goal) => {
              const isDraggable = sortMethod === 'custom';
              return (
                <div
                  key={goal.id}
                  className={`relative ${dragOverGoal?.id === goal.id ? 'border-2 border-blue-400 rounded-lg' : ''} ${draggedGoal?.id === goal.id ? 'opacity-50 transform scale-105' : ''}`}
                  onTouchStart={(e) => handleTouchStart(e, goal)}
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
                      status={goalStatuses[goal.id] || ''}
                      onClick={() => handleGoalClick(goal.id)}
                      onDecrement={() => handleGoalDecrement(goal.id)}
                      onEdit={() => handleGoalEdit(goal)}
                      onStartSession={() => setActiveGoalId(goal.id)}
                      draggable={isDraggable}
                      onDragStart={() => {
                        handleDragStart(goal);
                      }}
                      onDragOver={(e) => handleDragOver(e, goal)}
                      onDrop={(e) => handleDrop(e, goal)}
                      onDragEnd={handleDragEnd}
                    />

                  </div>
                </div>
              );
            })}
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

      {/* Floating Action Button for adding new goals */}
      {filteredGoals.length > 0 && !isFormOpen && (
        <button
          onClick={() => { setSelectedGoal(null); setIsFormOpen(true); }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
          aria-label="Add new goal"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Home;