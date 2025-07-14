'use client';
import { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, getToken } from '../../api/auth';
import { getMessageHistory } from '../../api/webhooks';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState({});
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    const token = getToken();
    
    setAuthStatus({
      isAuthenticated: authenticated,
      user: user,
      token: token,
      tokenLength: token ? token.length : 0
    });
  };

  const testMessagesAPI = async () => {
    try {
      setTestResult('Testing...');
      const result = await getMessageHistory({ limit: 5 });
      setTestResult(`Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Auth Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Messages API</h2>
          <button
            onClick={testMessagesAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Messages API
          </button>
          {testResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {testResult}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <button
            onClick={checkAuthStatus}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mr-4"
          >
            Refresh Auth Status
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              checkAuthStatus();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Clear localStorage
          </button>
        </div>
      </div>
    </div>
  );
} 