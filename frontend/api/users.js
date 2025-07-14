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
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Update user profile
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }

    return data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}; 

// Contact API
export const getContacts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users/contacts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch contacts');
  return data;
};

export const createContact = async (name, phone) => {
  const response = await fetch(`${API_BASE_URL}/api/users/contacts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, phone }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create contact');
  return data;
};

export const updateContact = async (id, name, phone) => {
  const response = await fetch(`${API_BASE_URL}/api/users/contacts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, phone }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update contact');
  return data;
};

export const deleteContact = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/users/contacts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to delete contact');
  return data;
}; 