import React, { useState } from 'react';
import { testDatabaseConnection } from '../services/dbTest';

const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await testDatabaseConnection();
      setTestResult(result);
    } catch (err) {
      console.error('Test execution error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Database Connection Test</h2>
      
      <button 
        onClick={runTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Run Test'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {testResult && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <div className="bg-gray-100 p-3 rounded overflow-auto max-h-80">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;
