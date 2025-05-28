import React, { useState, useEffect } from 'react';
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
      setCount(goal.count);
      setTargetCount(goal.targetCount || 1);
    } else {
      // Set default values for new goal
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setIsActive(true);
      setCount(0);
      setTargetCount(1);
    }
  }, [goal]);
  
  // Update isActive when start date changes
  useEffect(() => {
    // Check if start date is in the future
    const selectedStartDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison
    
    // If start date is in the future, automatically set to inactive
    if (selectedStartDate > today) {
      setIsActive(false);
    }
  }, [startDate]);

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
      count,
      targetCount
    } as any); // Type assertion to avoid TypeScript error
  };

  // Count is now directly editable via input field

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={new Date(startDate) > new Date(new Date().setHours(0, 0, 0, 0))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 whitespace-nowrap">
              Active
              {new Date(startDate) > new Date(new Date().setHours(0, 0, 0, 0)) && (
                <span className="text-xs text-gray-500 ml-1">(future)</span>
              )}
            </label>
          </div>
          
          {goal && (
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Count:</span>
              <button 
                type="button" 
                className="px-2 py-1 border border-gray-300 bg-gray-100 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={() => setCount(Math.max(0, count - 1))}
                aria-label="Decrease count"
              >−</button>
              <span className="px-2 py-1 border-y border-gray-300 bg-white text-center min-w-[40px] inline-block">
                {count}
              </span>
              <button 
                type="button" 
                className="px-2 py-1 border border-gray-300 bg-gray-100 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={() => setCount(count + 1)}
                aria-label="Increase count"
              >+</button>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-1.5" style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
        <div className="space-y-0.5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-0.5">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={1}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label htmlFor="cadence" className="block text-sm font-medium text-gray-700">
              Cadence *
            </label>
            <select
              id="cadence"
              value={cadence}
              onChange={(e) => setCadence(e.target.value as Cadence)}
              required
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="space-y-0.5">
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700">
              Target *
            </label>
            <div className="flex items-center w-full">
              <button 
                type="button" 
                className="px-2 py-1 text-sm border border-gray-300 bg-gray-100 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                aria-label="Decrease target count"
              >−</button>
              <span className="px-2 py-1 text-sm border-y border-gray-300 bg-white text-center flex-grow">
                {targetCount}
              </span>
              <button 
                type="button" 
                className="px-2 py-1 text-sm border border-gray-300 bg-gray-100 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                onClick={() => setTargetCount(targetCount + 1)}
                aria-label="Increase target count"
              >+</button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-0.5">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-0.5">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">
            Link
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
        
        {/* Grid removed - Active checkbox and Count controls moved to header */}
        
        <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
          {goal && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn btn-danger text-sm px-3 py-1"
            >
              Delete
            </button>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
