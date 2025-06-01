import React from 'react';
import type { Goal } from '../types';
import { calculateExpectedPracticeEvents } from '../utils/goalUtils';

interface GoalProgressProps {
  goal: Goal;
}

/**
 * Component that displays a goal's progress compared to expected progress
 */
const GoalProgress: React.FC<GoalProgressProps> = ({ goal }) => {
  const expectedEvents = calculateExpectedPracticeEvents(
    goal.startDate,
    goal.cadence,
    goal.targetCount
  );
  
  const actualEvents = goal.count;
  const progressPercentage = expectedEvents > 0 
    ? Math.min(100, Math.round((actualEvents / expectedEvents) * 100)) 
    : 100;
  
  // Calculate whether the goal is ahead, on track, or behind
  let statusText = 'On Track';
  let statusColor = 'text-green-600';
  
  if (actualEvents > expectedEvents) {
    statusText = 'Ahead';
    statusColor = 'text-blue-600';
  } else if (actualEvents < expectedEvents) {
    statusText = 'Behind';
    statusColor = 'text-orange-600';
  }
  
  return (
    <div className="mt-2 p-3 bg-white rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-1">Progress Tracker</h3>
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">
          {actualEvents} of {expectedEvents} expected sessions
        </span>
        <span className={`text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Additional stats */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Target: </span>
          {goal.targetCount} per {goal.cadence}
        </div>
        <div>
          <span className="font-medium">Current: </span>
          {actualEvents} total
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;
