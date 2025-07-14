'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../../api/auth';
import { getMessageHistory } from '../../api/webhooks';

export default function DebugWebhooks() {
  const [authStatus, setAuthStatus] = useState({});
  const [messages, setMessages] = useState([]);
  const [webhookStatus, setWebhookStatus] = useState({});

  useEffect(() => {
    checkAuthStatus();
    fetchMessages();
  }, []);

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    
    setAuthStatus({
      isAuthenticated: authenticated,
      user: user,
      twilioPhoneNumber: user?.twilioPhoneNumber
    });
  };

  const fetchMessages = async () => {
    try {
      const data = await getMessageHistory({ limit: 50 });
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const testWebhookEndpoint = async () => {
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          MessageSid: 'TEST_MESSAGE_SID',
          From: '+1234567890',
          To: authStatus.user?.twilioPhoneNumber || '+1234567890',
          Body: 'Test webhook message',
          MessageStatus: 'received'
        })
      });
      
      const result = await response.json();
      setWebhookStatus({ success: true, result });
    } catch (error) {
      setWebhookStatus({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Webhook Debug Dashboard</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        {/* Webhook Test */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Webhook Endpoint</h2>
          <button
            onClick={testWebhookEndpoint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Webhook
          </button>
          {webhookStatus.result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(webhookStatus.result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Messages ({messages.length})</h2>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {message.direction === 'inbound' ? '📥 Incoming' : '📤 Outgoing'}
                    </p>
                    <p className="text-sm text-gray-600">
                      From: {message.from} | To: {message.to}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {message.messageStatus} | Time: {new Date(message.timestamp).toLocaleString()}
                    </p>
                    <p className="mt-2">{message.body}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    message.messageStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                    message.messageStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                    message.messageStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {message.messageStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Troubleshooting Guide</h2>
          <div className="space-y-4 text-yellow-700">
            <div>
              <h3 className="font-medium">1. Check Twilio Webhook Configuration</h3>
              <p className="text-sm">Go to Twilio Console → Phone Numbers → Your Number → Webhook URLs</p>
              <p className="text-sm">Should be set to: https://your-domain.com/api/smsWebhook</p>
            </div>
            <div>
              <h3 className="font-medium">2. Check Backend Logs</h3>
              <p className="text-sm">Look for "Received SMS webhook" messages in your backend console</p>
            </div>
            <div>
              <h3 className="font-medium">3. Check Database</h3>
              <p className="text-sm">Verify messages are being stored in the database</p>
            </div>
            <div>
              <h3 className="font-medium">4. Test with ngrok (Development)</h3>
              <p className="text-sm">Use ngrok to expose your local backend: ngrok http 3000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 