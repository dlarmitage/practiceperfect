import React from 'react';
import { useSession } from '../context/SessionContext';
import { useGoals } from '../context/GoalContext';
import type { Goal } from '../types';

const Analysis: React.FC = () => {
  const { sessions } = useSession();
  const { goals } = useGoals();

  // Calculate basic stats
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((total, session) => total + (session.duration || 0), 0);
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  
  // Format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Group sessions by goal
  const sessionsByGoal = goals.map((goal: Goal) => {
    const goalSessions = sessions.filter(session => session.goal_id === goal.id);
    return {
      goal,
      sessionCount: goalSessions.length,
      totalDuration: goalSessions.reduce((total, session) => total + (session.duration || 0), 0)
    };
  }).filter((item: {sessionCount: number}) => item.sessionCount > 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Practice Analysis</h1>
      
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
            .sort((a: any, b: any) => b.sessionCount - a.sessionCount)
            .map(({ goal, sessionCount, totalDuration }: { goal: Goal, sessionCount: number, totalDuration: number }) => (
              <div key={goal.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{goal.name}</div>
                    <div className="text-sm text-gray-500">
                      {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} · {formatDuration(totalDuration)}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.round((totalDuration / 60))} min
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Coming Soon</h3>
        <p className="text-blue-700">
          More detailed analytics, including practice streaks, goal completion rates, 
          and personalized insights to help you practice more effectively.
        </p>
      </div>
    </div>
  );
};

export default Analysis;
