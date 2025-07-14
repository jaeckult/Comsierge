const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to check if we're on the client side
const isClient = () => typeof window !== 'undefined';

// Login API function
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token in localStorage
    if (data.token && isClient()) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Signup API function
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Logout function
export const logoutUser = () => {
  if (isClient()) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  if (!isClient()) return null;
  
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get token from localStorage
export const getToken = () => {
  if (!isClient()) return null;
  
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (!isClient()) return false;
  
  return !!getToken();
}; 