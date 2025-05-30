import React, { useState, useEffect, useRef } from 'react';
import type { Goal, Cadence } from '../types';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'user_id'> & { dueDate?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

/**
 * Form component for creating and editing goals
 */
const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel, onDelete }) => {
  const [name, setName] = useState('');
const [completed, setCompleted] = useState(false);
  const [description, setDescription] = useState('');
  const [cadence, setCadence] = useState<Cadence>('daily');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(1);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setDescription(goal.description || '');
      setCadence(goal.cadence);
      setStartDate(goal.startDate.split('T')[0]); // Format date for input
      setDueDate(goal.dueDate ? goal.dueDate.split('T')[0] : '');
      setLink(goal.link || '');
      setIsActive(goal.isActive);
      setCompleted(goal.completed || false);
      setCount(goal.count);
      setTargetCount(goal.targetCount || 1);
    } else {
      // Set default values for new goal
      // Use local date format to ensure correct timezone
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      setStartDate(today);
      setIsActive(true);
      setCount(0);
      setTargetCount(1);
    }
  }, [goal]);
  
  // Only update isActive when start date changes if editing an existing goal
  useEffect(() => {
    // Only apply this logic when editing an existing goal, not for new goals
    if (goal) {
      // Check if start date is in the future
      const selectedStartDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison
      
      // If start date is in the future, automatically set to inactive
      if (selectedStartDate > today) {
        setIsActive(false);
      }
    } else {
      setIsActive(true);
    }
  }, [startDate, goal]);

  // Refs for press-and-hold functionality
  const incrementIntervalRef = useRef<number | null>(null);
  const decrementIntervalRef = useRef<number | null>(null);
  
  // Handle press-and-hold for increment
  const startIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, currentValue: number, min: number = 0) => {
    // Immediate increment
    setter(Math.max(min, currentValue + 1));
    
    // Clear any existing interval
    if (incrementIntervalRef.current) {
      window.clearInterval(incrementIntervalRef.current);
    }
    
    // Set up interval for continuous increment
    incrementIntervalRef.current = window.setInterval(() => {
      setter(prev => Math.max(min, prev + 1));
    }, 300);
  };
  
  // Handle press-and-hold for decrement
  const startDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, currentValue: number, min: number = 0) => {
    // Immediate decrement
    setter(Math.max(min, currentValue - 1));
    
    // Clear any existing interval
    if (decrementIntervalRef.current) {
      window.clearInterval(decrementIntervalRef.current);
    }
    
    // Set up interval for continuous decrement
    decrementIntervalRef.current = window.setInterval(() => {
      setter(prev => Math.max(min, prev - 1));
    }, 300);
  };
  
  // Stop the interval when mouse/touch is released
  const stopInterval = () => {
    if (incrementIntervalRef.current) {
      window.clearInterval(incrementIntervalRef.current);
      incrementIntervalRef.current = null;
    }
    if (decrementIntervalRef.current) {
      window.clearInterval(decrementIntervalRef.current);
      decrementIntervalRef.current = null;
    }
  };
  
  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (incrementIntervalRef.current) window.clearInterval(incrementIntervalRef.current);
      if (decrementIntervalRef.current) window.clearInterval(decrementIntervalRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format dates with time
    const formattedStartDate = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;
    
    onSubmit({
      name,
      description: description || undefined,
      cadence,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      link: link || undefined,
      isActive,
      completed,
      count,
      targetCount
    } as any); // Type assertion to avoid TypeScript error
  };

  // Count is now directly editable via input field

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold text-gray-800">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={new Date(startDate) > new Date(new Date().setHours(0, 0, 0, 0))}
              className="h-5 w-5 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 flex items-center text-base font-medium text-gray-700 whitespace-nowrap">
              Active
              {new Date(startDate) > new Date(new Date().setHours(0, 0, 0, 0)) && (
                <span className="text-xs text-gray-500 ml-1">(future)</span>
              )}
            </label>
          </div>
          
          {goal && (
            <div className="flex items-center">
              <label className="text-base font-medium text-gray-700 mr-2">Count:</label>
              <div className="flex rounded-md overflow-hidden">
                <button 
                  type="button" 
                  className="h-8 w-8 flex items-center justify-center text-lg font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                  onMouseDown={() => startDecrement(setCount, count, 0)}
                  onMouseUp={stopInterval}
                  onMouseLeave={stopInterval}
                  onTouchStart={() => startDecrement(setCount, count, 0)}
                  onTouchEnd={stopInterval}
                  aria-label="Decrease count"
                >−</button>
                <span className="h-8 w-10 flex items-center justify-center border-y border-x-0 border-gray-200 bg-gray-50 text-center text-base">
                  {count}
                </span>
                <button 
                  type="button" 
                  className="h-8 w-8 flex items-center justify-center text-lg font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                  onMouseDown={() => startIncrement(setCount, count)}
                  onMouseUp={stopInterval}
                  onMouseLeave={stopInterval}
                  onTouchStart={() => startIncrement(setCount, count)}
                  onTouchEnd={stopInterval}
                  aria-label="Increase count"
                >+</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={e => setCompleted(e.target.checked)}
              className="h-5 w-5 text-green-600 border-gray-200 rounded focus:ring-green-500"
            />
            <label htmlFor="completed" className="ml-2 text-base font-medium text-gray-700 whitespace-nowrap">Completed</label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cadence <span className="text-red-500">*</span>
            </label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm w-full">
              <button
                type="button"
                className={`flex-1 px-2 py-2 text-xs sm:text-sm ${cadence === 'hourly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCadence('hourly')}
                aria-label="Hourly cadence"
              >
                Hourly
              </button>
              <button
                type="button"
                className={`flex-1 px-2 py-2 text-xs sm:text-sm border-l border-r border-gray-300 ${cadence === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCadence('daily')}
                aria-label="Daily cadence"
              >
                Daily
              </button>
              <button
                type="button"
                className={`flex-1 px-2 py-2 text-xs sm:text-sm ${cadence === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCadence('weekly')}
                aria-label="Weekly cadence"
              >
                Weekly
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-1">
              How many times per {cadence === 'weekly' ? 'Week' : cadence === 'daily' ? 'Day' : 'Hour'}? <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-md overflow-hidden shadow-sm w-full border border-gray-300">
              <button 
                type="button" 
                className="w-10 py-1 flex items-center justify-center text-lg font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                onMouseDown={() => startDecrement(setTargetCount, targetCount, 1)}
                onMouseUp={stopInterval}
                onMouseLeave={stopInterval}
                onTouchStart={() => startDecrement(setTargetCount, targetCount, 1)}
                onTouchEnd={stopInterval}
                aria-label="Decrease target count"
              >−</button>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 px-2 py-1 text-center text-xs sm:text-sm border-x border-gray-300 bg-white flex-grow focus:outline-none focus:ring-0 focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <button 
                type="button" 
                className="w-10 py-1 flex items-center justify-center text-lg font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                onMouseDown={() => startIncrement(setTargetCount, targetCount)}
                onMouseUp={stopInterval}
                onMouseLeave={stopInterval}
                onTouchStart={() => startIncrement(setTargetCount, targetCount)}
                onTouchEnd={stopInterval}
                aria-label="Increase target count"
              >+</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
            Optional link to help practice this goal
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        
        {/* Grid removed - Active checkbox and Count controls moved to header */}
        
        <div className="flex justify-between pt-6 mt-4 border-t border-gray-200">
          {goal && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Delete
            </button>
          )}
          
          <div className="flex space-x-4 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {goal ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;
