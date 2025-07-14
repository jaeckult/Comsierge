const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Send SMS message
export const sendSMS = async (to, body, mediaUrl = null) => {
  const payload = { to, body };
  if (mediaUrl) payload.mediaUrl = mediaUrl;

  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/sendSMS`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Get message history
export const getMessages = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return makeAuthenticatedRequest(url);
};

// Get message by ID
export const getMessage = async (messageId) => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/${messageId}`);
};

// Check message status from Twilio
export const checkMessageStatus = async (messageId) => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/${messageId}/check-status`);
};

// Get message status summary
export const getStatusSummary = async () => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/status/summary`);
};

// Update message status manually
export const updateMessageStatus = async (messageId, status) => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/${messageId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Delete message
export const deleteMessage = async (messageId) => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
  });
}; 

// Schedule a message
export const scheduleMessage = async (to, body, sendAt) => {
  const payload = { to, body, sendAt };
  return makeAuthenticatedRequest(`${API_BASE_URL}/schedule`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}; 

// Get scheduled messages
export const getScheduledMessages = async () => {
  return makeAuthenticatedRequest(`${API_BASE_URL}/schedule`);
}; 