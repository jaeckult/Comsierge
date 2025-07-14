'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, getToken, logoutUser } from '../../api/auth';
import { useRouter } from 'next/navigation';

export default function AuthDebug() {
  const router = useRouter();
  const [authInfo, setAuthInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = getToken();
    const user = getCurrentUser();
    const authenticated = isAuthenticated();
    
    setAuthInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      user: user,
      isAuthenticated: authenticated,
      localStorage: {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      }
    });
  };

  const testAuthEndpoint = async () => {
    try {
      const response = await fetch('/api/test-auth', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      setTestResult({
        status: response.status,
        data: data,
        success: response.ok
      });
    } catch (error) {
      setTestResult({
        error: error.message,
        success: false
      });
    }
  };

  const clearAuth = () => {
    logoutUser();
    checkAuthStatus();
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={checkAuthStatus}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
            <button
              onClick={testAuthEndpoint}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Test Auth Endpoint
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Auth
            </button>
            <button
              onClick={goToLogin}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-medium mb-2">
                {testResult.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Troubleshooting Guide</h2>
          <div className="space-y-4 text-yellow-700">
            <div>
              <h3 className="font-medium">1. No Token Found</h3>
              <p className="text-sm">• Click "Go to Login" to authenticate</p>
              <p className="text-sm">• Check if login was successful</p>
            </div>
            <div>
              <h3 className="font-medium">2. Token Expired</h3>
              <p className="text-sm">• Click "Clear Auth" then "Go to Login"</p>
              <p className="text-sm">• Re-authenticate to get a new token</p>
            </div>
            <div>
              <h3 className="font-medium">3. Invalid Token</h3>
              <p className="text-sm">• Check backend JWT_SECRET configuration</p>
              <p className="text-sm">• Verify token format in localStorage</p>
            </div>
            <div>
              <h3 className="font-medium">4. Backend Issues</h3>
              <p className="text-sm">• Check backend server is running</p>
              <p className="text-sm">• Verify JWT_SECRET is set in backend .env</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 