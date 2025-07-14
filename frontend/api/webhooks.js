const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

// Helper function to check if we're on the client side
const isClient = () => typeof window !== 'undefined';

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (!isClient()) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token); // Debug log
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  console.log('Auth headers:', headers); // Debug log
  return headers;
};

// Send SMS message
export const sendSMS = async (messageData) => {
  try {
    console.log('Sending SMS with data:', messageData);
    
    const response = await fetch(`${API_BASE_URL}/api/messages/sendSMS`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });

    const data = await response.json();
    console.log('SMS API response:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send SMS');
    }

    return data;
  } catch (error) {
    console.error('Send SMS error:', error);
    throw error;
  }
};

// Get message history
export const getMessageHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_BASE_URL}/api/messages?${queryParams}` : `${API_BASE_URL}/api/messages`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch message history');
    }

    return data;
  } catch (error) {
    console.error('Get message history error:', error);
    throw error;
  }
};

// Get message by ID
export const getMessageById = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch message');
    }

    return data;
  } catch (error) {
    console.error('Get message error:', error);
    throw error;
  }
};

// Update message status
export const updateMessageStatus = async (messageId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update message status');
    }

    return data;
  } catch (error) {
    console.error('Update message status error:', error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete message');
    }

    return data;
  } catch (error) {
    console.error('Delete message error:', error);
    throw error;
  }
};

// Utility function to parse webhook data (for debugging only)
export const parseWebhookData = (formData) => {
  return {
    messageSid: formData.get('MessageSid'),
    accountSid: formData.get('AccountSid'),
    from: formData.get('From'),
    to: formData.get('To'),
    body: formData.get('Body'),
    numMedia: formData.get('NumMedia'),
    mediaUrl: formData.get('MediaUrl0'),
    messageStatus: formData.get('MessageStatus'),
    timestamp: formData.get('Timestamp'),
  };
}; 