'use client';
import { useState, useEffect } from 'react';
import { getMessages, deleteMessage, updateMessageStatus, getScheduledMessages } from '../../api/messages';
import { getCurrentUser, isAuthenticated } from '../../api/auth';
import { useRouter } from 'next/navigation';
import { MessageStatus, StatusSummary } from '../components/MessageStatus';

export default function Inbox() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    direction: '',
    status: '',
    limit: 20
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [showStatusSummary, setShowStatusSummary] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);

  useEffect(() => {
    // Check authentication on client side only
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      setAuthChecked(true);
      
      if (!authenticated) {
        router.push('/login');
        return;
      }
      
      fetchMessages();
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Only fetch messages if authenticated and auth has been checked
    if (isUserAuthenticated && authChecked) {
      fetchMessages();
    }
  }, [filters, pagination.offset, isUserAuthenticated, authChecked]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const queryParams = {
        ...filters,
        offset: pagination.offset
      };
      const [data, scheduledData] = await Promise.all([
        getMessages(queryParams),
        getScheduledMessages()
      ]);
      setMessages(data.messages);
      setScheduledMessages(scheduledData.scheduled || []);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (messageId, newStatus) => {
    try {
      await updateMessageStatus(messageId, newStatus);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, messageStatus: newStatus } : msg
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusCheck = (messageId, newStatus) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, messageStatus: newStatus } : msg
    ));
  };

  // Merge scheduled messages as 'queued' (status: scheduled) and sort
  const allMessages = [
    ...messages,
    ...scheduledMessages.map(msg => ({
      ...msg,
      id: msg.id + '-scheduled',
      messageStatus: 'scheduled',
      direction: 'outbound-api',
      timestamp: msg.sendAt,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      errorMessage: msg.errorMessage || null,
      statusTimestamp: msg.updatedAt,
      twilioPhoneNumber: msg.twilioPhoneNumber || null,
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredMessages = allMessages.filter(message =>
    message.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.from.includes(searchTerm) ||
    message.to.includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'queued': return 'text-yellow-600 bg-yellow-100';
      case 'sending': return 'text-blue-600 bg-blue-100';
      case 'undelivered': return 'text-red-600 bg-red-100';
      case 'received': return 'text-purple-600 bg-purple-100';
      case 'accepted': return 'text-blue-700 bg-blue-200';
      case 'scheduled': return 'text-gray-600 bg-gray-100';
      case 'canceled': return 'text-gray-700 bg-gray-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDirectionIcon = (direction) => {
    return direction === 'inbound' ? '📥' : '📤';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading state if not authenticated (will redirect)
  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
              <p className="text-sm text-gray-500">
                {pagination.total} messages total
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusSummary(!showStatusSummary)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {showStatusSummary ? 'Hide' : 'Show'} Status Summary
              </button>
              <button
                onClick={() => router.push('/compose')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Compose Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Summary */}
        {showStatusSummary && (
          <div className="mb-6">
            <StatusSummary />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Direction Filter */}
            <div>
              <select
                value={filters.direction}
                onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Directions</option>
                <option value="inbound">Incoming</option>
                <option value="outbound-api">Outgoing</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
                <option value="sending">Sending</option>
                <option value="undelivered">Undelivered</option>
                <option value="received">Received</option>
                <option value="accepted">Accepted</option>
                <option value="scheduled">Scheduled</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getDirectionIcon(message.direction)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.direction === 'inbound' ? message.from : message.to}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                        <MessageStatus 
                          messageId={message.id}
                          initialStatus={message.messageStatus}
                          onStatusUpdate={(newStatus) => handleStatusCheck(message.id, newStatus)}
                        />
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.body}
                      </p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={loadMore}
                className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
              >
                Load More Messages
              </button>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <span className="text-white text-lg">
                        {getDirectionIcon(selectedMessage.direction)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Message Details</h3>
                      <p className="text-blue-100 text-sm">
                        {selectedMessage.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Message
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-white hover:text-blue-100 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Message Info */}
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                          <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                            {selectedMessage.from}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                          <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                            {selectedMessage.to}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Message Status
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                          <MessageStatus 
                            messageId={selectedMessage.id}
                            initialStatus={selectedMessage.messageStatus}
                            onStatusUpdate={(newStatus) => {
                              handleStatusCheck(selectedMessage.id, newStatus);
                              setSelectedMessage({...selectedMessage, messageStatus: newStatus});
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                          <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                            {formatDate(selectedMessage.timestamp)}
                          </p>
                        </div>
                        {selectedMessage.statusTimestamp && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Updated</label>
                            <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                              {formatDate(selectedMessage.statusTimestamp)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error Information */}
                    {selectedMessage.errorMessage && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Error Information
                        </h4>
                        <div className="space-y-3">
                          {selectedMessage.errorCode && (
                            <div>
                              <label className="block text-sm font-medium text-red-700 mb-1">Error Code</label>
                              <p className="text-sm text-red-900 bg-white px-3 py-2 rounded border">
                                {selectedMessage.errorCode}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">Error Message</label>
                            <p className="text-sm text-red-900 bg-white px-3 py-2 rounded border">
                              {selectedMessage.errorMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Message Content */}
                  <div className="space-y-6">
                    {/* Message Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message Content
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Text</label>
                        <div className="bg-white rounded-lg border p-4 min-h-[120px]">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.body}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message Metadata */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Message Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message SID</label>
                          <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                            {selectedMessage.messageSid}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                          <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border capitalize">
                            {selectedMessage.direction}
                          </p>
                        </div>
                        {selectedMessage.numMedia > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                            <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                              {selectedMessage.numMedia} media file(s)
                            </p>
                          </div>
                        )}
                        {selectedMessage.mediaUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                            <a 
                              href={selectedMessage.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-2 rounded border block truncate"
                            >
                              {selectedMessage.mediaUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 