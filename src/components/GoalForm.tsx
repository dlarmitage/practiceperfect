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
    <div className="goal-form-container">
      <h2 className="goal-form-title" style={{ marginBottom: '0.25rem' }}>{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
      <form onSubmit={handleSubmit} className="compact-form" style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto', marginTop: '0' }}>
        <div className="form-group compact">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group compact">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group compact half">
            <label htmlFor="cadence" className="form-label">
              Frequency *
            </label>
            <select
              id="cadence"
              value={cadence}
              onChange={(e) => setCadence(e.target.value as Cadence)}
              required
              className="form-select"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="form-group compact half">
            <label htmlFor="targetCount" className="form-label">
              Target *
            </label>
            <input
              type="number"
              id="targetCount"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
              min="1"
              required
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group compact half">
            <label htmlFor="startDate" className="form-label">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group compact half">
            <label htmlFor="dueDate" className="form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group compact">
          <label htmlFor="link" className="form-label">
            Link
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="form-input"
            placeholder="https://example.com"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group compact half checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="checkbox-label">
              Active
            </label>
          </div>

          {goal && (
            <div className="form-group compact half count-input-group">
              <label htmlFor="count" className="count-label">
                Count:
              </label>
              <input
                type="number"
                id="count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                min="0"
                className="count-input"
                maxLength={3}
              />
            </div>
          )}
        </div>
        
        <div className="button-group compact">
          {goal && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="primary-button"
            >
              Delete
            </button>
          )}
          
          <div className="action-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="primary-button"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="primary-button"
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
