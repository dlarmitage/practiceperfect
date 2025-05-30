import React, { useState, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { useGoals } from '../context/GoalContext';
import type { Goal } from '../types';
import { format, parseISO, subDays, isSameDay } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

// Time period options for filtering
type TimePeriod = '7days' | '30days' | '90days' | 'all';

const Analysis: React.FC = () => {
  const { sessions, activeGoalId, setActiveGoalId } = useSession();
  const { goals } = useGoals();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  const [includeCompleted, setIncludeCompleted] = useState<boolean>(false);
  
  // Reset activeGoalId when entering Analytics to ensure we see all sessions
  React.useEffect(() => {
    // Only reset if there's an active goal ID
    if (activeGoalId) {
      setActiveGoalId(null);
    }
  }, [activeGoalId, setActiveGoalId]);
  
  // Filter sessions based on selected time period
  const filteredSessions = useMemo(() => {
    if (timePeriod === 'all') return sessions;
    
    const today = new Date();
    const cutoffDate = subDays(today, timePeriod === '7days' ? 7 : timePeriod === '30days' ? 30 : 90);
    
    return sessions.filter(session => {
      const sessionDate = parseISO(session.session_date);
      return sessionDate >= cutoffDate;
    });
  }, [sessions, timePeriod]);

  // Calculate basic stats
  const totalSessions = filteredSessions.length;
  const totalDuration = filteredSessions.reduce((total, session) => total + (session.duration || 0), 0);
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  
  // Find max duration for dynamic axis scaling
  const maxDuration = useMemo(() => {
    if (filteredSessions.length === 0) return 0;
    return Math.max(...filteredSessions.map(session => session.duration || 0));
  }, [filteredSessions]);
  
  // Determine appropriate duration unit based on max duration
  const durationUnit = useMemo(() => {
    if (maxDuration < 60) return 'seconds';
    if (maxDuration < 3600) return 'minutes';
    return 'hours';
  }, [maxDuration]);
  
  // Format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format duration in hours and minutes for larger values
  const formatLongDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Group sessions by goal, adding completed goals only when checkbox is checked
  const sessionsByGoal = useMemo(() => {
    // Filter goals based on their status
    const filteredGoals = goals.filter(goal => {
      // If goal is completed, only include it when the checkbox is checked
      if (goal.completed) {
        return includeCompleted;
      }
      
      // Always include active goals (non-completed goals)
      // This includes past due goals, which are still active but past their due date
      return true;
    });
      
    return filteredGoals.map((goal: Goal) => {
      const goalSessions = filteredSessions.filter(session => session.goal_id === goal.id);
      return {
        goal,
        sessionCount: goalSessions.length,
        totalDuration: goalSessions.reduce((total, session) => total + (session.duration || 0), 0),
        averageDuration: goalSessions.length > 0 
          ? Math.round(goalSessions.reduce((total, session) => total + (session.duration || 0), 0) / goalSessions.length)
          : 0,
        sessions: goalSessions
      };
    }); // Removed filter to include all goals, even those without sessions
  }, [filteredSessions, goals, includeCompleted]);
  
  // Prepare data for practice trend chart (sessions per day)
  const practiceByDayData = useMemo(() => {
    if (filteredSessions.length === 0) return [];
    
    const today = new Date();
    const daysToShow = timePeriod === '7days' ? 7 : timePeriod === '30days' ? 30 : timePeriod === '90days' ? 90 : 30;
    
    // Create an array of the last X days
    const daysArray = Array.from({ length: daysToShow }, (_, i) => {
      const date = subDays(today, daysToShow - 1 - i);
      return {
        date,
        dateStr: format(date, 'MMM d'),
        count: 0,
        duration: 0
      };
    });
    
    // Count sessions for each day
    filteredSessions.forEach(session => {
      const sessionDate = parseISO(session.session_date);
      const dayIndex = daysArray.findIndex(day => isSameDay(day.date, sessionDate));
      if (dayIndex >= 0) {
        daysArray[dayIndex].count += 1;
        daysArray[dayIndex].duration += session.duration || 0;
      }
    });
    
    return daysArray;
  }, [filteredSessions, timePeriod]);
  
  // Generate a color based on goal status and completion
  const getColorForGoal = (goal: Goal): string => {
    if (goal.completed) {
      return 'rgb(59, 130, 246)'; // Blue for completed goals
    }
    
    const now = new Date();
    const dueDate = goal.dueDate ? parseISO(goal.dueDate) : null;
    const isActive = goal.isActive;
    const progress = goal.count / goal.targetCount;

    if (!isActive) {
      return 'rgb(156, 163, 175)'; // Gray for inactive goals
    }

    if (dueDate && dueDate < now) {
      return 'rgb(239, 68, 68)'; // Red for overdue goals
    }

    if (progress >= 1) {
      return 'rgb(34, 197, 94)'; // Green for goals meeting target
    }

    return 'rgb(249, 115, 22)'; // Orange for active goals in progress
  };
  
  // Prepare data for goal distribution pie chart using goal count instead of session duration
  const goalDistributionData = useMemo(() => {
    return sessionsByGoal.map(({ goal }) => ({
      name: goal.name,
      value: goal.count, // Using goal count instead of session duration
      color: getColorForGoal(goal)
    }));
  }, [sessionsByGoal]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 items-center">
          <button 
            onClick={() => setTimePeriod('7days')}
            className={`px-3 py-1 text-sm rounded-md ${timePeriod === '7days' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimePeriod('30days')}
            className={`px-3 py-1 text-sm rounded-md ${timePeriod === '30days' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimePeriod('90days')}
            className={`px-3 py-1 text-sm rounded-md ${timePeriod === '90days' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            90 Days
          </button>
          <button 
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-1 text-sm rounded-md ${timePeriod === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Time
          </button>
          
          <div className="flex items-center ml-4 space-x-2">
            <input
              type="checkbox"
              id="includeCompleted"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="includeCompleted" className="text-sm text-gray-700">
              Include Completed Goals
            </label>
          </div>
        </div>
      </div>
      
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold">{totalSessions}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Practice Time</div>
          <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Average Session Length</div>
          <div className="text-2xl font-bold">{formatDuration(averageDuration)}</div>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center my-8">
          <p className="text-gray-600">No practice data available for this time period.</p>
          <p className="text-sm text-gray-500 mt-2">
            Try selecting a different time range or start recording sessions.
          </p>
        </div>
      ) : (
        <>
          {/* Practice Trend Chart */}
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4">Practice Trends (all sessions)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={practiceByDayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateStr" tick={{ fontSize: 12 }} />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#3b82f6" 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#10b981"
                    domain={[0, 'auto']} 
                    tickFormatter={(value) => {
                      if (value === 0) return '0';
                      
                      // Format based on the appropriate unit
                      if (durationUnit === 'seconds') {
                        return `${value}s`;
                      } else if (durationUnit === 'minutes') {
                        return `${Math.round(value / 60)}m`;
                      } else {
                        return `${(value / 3600).toFixed(1)}h`;
                      }
                    }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'duration') {
                        const numValue = Number(value);
                        if (durationUnit === 'seconds') {
                          return `${numValue} seconds`;
                        } else if (durationUnit === 'minutes') {
                          return `${Math.floor(numValue / 60)}m ${numValue % 60}s`;
                        } else {
                          const hours = Math.floor(numValue / 3600);
                          const minutes = Math.floor((numValue % 3600) / 60);
                          return `${hours}h ${minutes}m`;
                        }
                      }
                      return value;
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="count" 
                    name="Sessions" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="duration" 
                    name="Duration" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Goal Distribution Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Practice Count</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {goalDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} practices`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Practice Duration by Goal</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsByGoal.map(item => ({
                    name: item.goal.name,
                    duration: item.totalDuration,
                    sessions: item.sessionCount,
                    color: getColorForGoal(item.goal)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${Math.round(value / 60)}m`} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'duration') return formatLongDuration(Number(value));
                        return value;
                      }}
                    />
                    <Bar dataKey="duration" name="Duration" fill="#3b82f6">
                      {sessionsByGoal.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorForGoal(entry.goal)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Practice by Goal</h2>
      
      {sessionsByGoal.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No practice data available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start recording sessions to see your analytics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessionsByGoal
            .sort((a, b) => b.totalDuration - a.totalDuration)
            .map(({ goal, sessionCount, totalDuration, averageDuration }) => (
              <div key={goal.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{goal.name}</div>
                    <div className="text-sm text-gray-500">
                      {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} · {formatDuration(totalDuration)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-semibold">
                      {Math.round((totalDuration / 60))} min
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {formatDuration(averageDuration)}/session
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Analysis;
