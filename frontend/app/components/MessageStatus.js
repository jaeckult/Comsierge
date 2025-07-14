'use client';

import { useState, useEffect } from 'react';
import { checkMessageStatus, getStatusSummary } from '../../api/messages';

const MessageStatus = ({ messageId, initialStatus, onStatusUpdate }) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const statusColors = {
    'queued': 'text-yellow-600 bg-yellow-100',
    'sending': 'text-blue-600 bg-blue-100',
    'sent': 'text-green-600 bg-green-100',
    'delivered': 'text-green-700 bg-green-200',
    'undelivered': 'text-red-600 bg-red-100',
    'failed': 'text-red-700 bg-red-200',
    'received': 'text-purple-600 bg-purple-100',
    'accepted': 'text-blue-700 bg-blue-200',
    'scheduled': 'text-gray-600 bg-gray-100',
    'canceled': 'text-gray-700 bg-gray-200'
  };

  const statusLabels = {
    'queued': 'Queued',
    'sending': 'Sending',
    'sent': 'Sent',
    'delivered': 'Delivered',
    'undelivered': 'Undelivered',
    'failed': 'Failed',
    'received': 'Received',
    'accepted': 'Accepted',
    'scheduled': 'Scheduled',
    'canceled': 'Canceled'
  };

  const handleCheckStatus = async () => {
    // If the message is scheduled, show a friendly message
    if (status === 'scheduled') {
      setError('This message is scheduled and has not been sent yet.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const response = await checkMessageStatus(messageId);
      setStatus(response.currentStatus);
      setLastChecked(new Date());
      
      if (onStatusUpdate) {
        onStatusUpdate(response.currentStatus);
      }
    } catch (err) {
      setError(err.message || 'Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    return statusLabels[status] || status;
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusLabel(status)}
      </span>
      
      <button
        onClick={handleCheckStatus}
        disabled={loading}
        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
      
      {lastChecked && (
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

const StatusSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatusSummary();
  }, []);

  const loadStatusSummary = async () => {
    try {
      const response = await getStatusSummary();
      setSummary(response);
    } catch (err) {
      setError(err.message || 'Failed to load status summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-600">Loading status summary...</div>;
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (!summary) return null;

  return (
  <div className="bg-white rounded-lg shadow p-6 text-gray-900">
    <h3 className="text-lg font-semibold mb-4 text-gray-900">Message Status Summary</h3>
    
    {/* Status Counters */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summary.statusSummary.map((item) => (
        <div key={item.status} className="text-center bg-gray-50 p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-700">{item.count}</div>
          <div className="text-sm text-gray-700 capitalize">{item.status}</div>
        </div>
      ))}
    </div>
    
    {/* Recent Status Updates */}
    <div>
      <h4 className="font-medium mb-2 text-gray-900">Recent Status Updates</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {summary.recentUpdates.map((update) => (
          <div key={update.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-medium text-gray-800">{update.from} → {update.to}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(update.messageStatus)}`}>
                {getStatusLabel(update.messageStatus)}
              </span>
            </div>
            <div className="text-gray-500 text-xs whitespace-nowrap">
              {new Date(update.statusTimestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

};

// Helper functions for status colors and labels
const getStatusColor = (status) => {
  const statusColors = {
    'queued': 'text-yellow-600 bg-yellow-100',
    'sending': 'text-blue-600 bg-blue-100',
    'sent': 'text-green-600 bg-green-100',
    'delivered': 'text-green-700 bg-green-200',
    'undelivered': 'text-red-600 bg-red-100',
    'failed': 'text-red-700 bg-red-200',
    'received': 'text-purple-600 bg-purple-100',
    'accepted': 'text-blue-700 bg-blue-200',
    'scheduled': 'text-gray-600 bg-gray-100',
    'canceled': 'text-gray-700 bg-gray-200'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    'queued': 'Queued',
    'sending': 'Sending',
    'sent': 'Sent',
    'delivered': 'Delivered',
    'undelivered': 'Undelivered',
    'failed': 'Failed',
    'received': 'Received',
    'accepted': 'Accepted',
    'scheduled': 'Scheduled',
    'canceled': 'Canceled'
  };
  return statusLabels[status] || status;
};

export { MessageStatus, StatusSummary }; 