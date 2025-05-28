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
  const { sessions } = useSession();
  const { goals } = useGoals();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  
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

  // Group sessions by goal
  const sessionsByGoal = useMemo(() => {
    return goals.map((goal: Goal) => {
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
    }).filter((item: {sessionCount: number}) => item.sessionCount > 0);
  }, [filteredSessions, goals]);
  
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
  
  // Prepare data for goal distribution pie chart
  const goalDistributionData = useMemo(() => {
    return sessionsByGoal.map(({ goal, totalDuration }) => ({
      name: goal.name,
      value: totalDuration,
      color: getColorForGoal(goal.id)
    }));
  }, [sessionsByGoal]);
  
  // Generate a consistent color based on goal ID
  function getColorForGoal(goalId: string): string {
    // Simple hash function to generate a color
    const hash = goalId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate a hue between 0 and 360 based on the hash
    const hue = Math.abs(hash % 360);
    
    // Use HSL to generate colors with consistent saturation and lightness
    return `hsl(${hue}, 70%, 50%)`;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
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
            <h2 className="text-lg font-semibold mb-4">Practice Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={practiceByDayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="dateStr" 
                    tick={{ fontSize: 12 }}
                    interval={timePeriod === '7days' ? 0 : 'preserveStartEnd'}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                    name="Sessions"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${Math.round(value / 60)}m`}
                    name="Duration"
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Sessions') return value;
                      if (name === 'Duration') return formatLongDuration(Number(value));
                      return value;
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
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
              <h2 className="text-lg font-semibold mb-4">Practice Distribution</h2>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {goalDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatLongDuration(Number(value))} />
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
                    color: getColorForGoal(item.goal.id)
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
                        <Cell key={`cell-${index}`} fill={getColorForGoal(entry.goal.id)} />
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
