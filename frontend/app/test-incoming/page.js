'use client';
import { useState } from 'react';

export default function TestIncoming() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testIncomingSMS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smsWebhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          MessageSid: 'SM_TEST_INCOMING_' + Date.now(),
          AccountSid: 'AC_TEST_ACCOUNT',
          From: '+16293022885', // The number that sent the message
          To: '+19282605947',   // Your Twilio number
          Body: 'This is a test incoming message from ' + new Date().toLocaleString(),
          MessageStatus: 'received',
          Timestamp: new Date().toISOString()
        })
      });

      const data = await response.text(); // Webhook returns TwiML, not JSON
      setResult({
        status: response.status,
        data: data,
        success: response.ok
      });
    } catch (error) {
      setResult({
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testStatusUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messageStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          MessageSid: 'SM_TEST_STATUS_' + Date.now(),
          MessageStatus: 'delivered',
          Timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data: data,
        success: response.ok
      });
    } catch (error) {
      setResult({
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Incoming SMS Webhook</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Incoming SMS</h2>
          <p className="text-gray-600 mb-4">
            This simulates an incoming SMS to your Twilio number (+1 9282605947)
          </p>
          <button
            onClick={testIncomingSMS}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Testing...' : 'Test Incoming SMS'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Status Update</h2>
          <p className="text-gray-600 mb-4">
            This simulates a message status update from Twilio
          </p>
          <button
            onClick={testStatusUpdate}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Testing...' : 'Test Status Update'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-medium mb-2">
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Next Steps</h2>
          <div className="space-y-4 text-yellow-700">
            <div>
              <h3 className="font-medium">1. Check Twilio Console</h3>
              <p className="text-sm">Verify webhook URLs are set correctly in Twilio Console</p>
            </div>
            <div>
              <h3 className="font-medium">2. Check Backend Logs</h3>
              <p className="text-sm">Look for "Received SMS webhook" in your backend console</p>
            </div>
            <div>
              <h3 className="font-medium">3. Check Database</h3>
              <p className="text-sm">Verify the test message appears in your inbox</p>
            </div>
            <div>
              <h3 className="font-medium">4. Test Real SMS</h3>
              <p className="text-sm">Send a real SMS to +1 9282605947 and check if it appears</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 