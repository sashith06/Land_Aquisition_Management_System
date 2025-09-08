// Logout utility function
export const logout = () => {
  // Clear all authentication data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return token !== null;
};

// Get current user information
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get current user's full name
export const getCurrentUserName = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // Try to construct full name from first_name and last_name
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  // Fallback to name field if available
  if (user.name) {
    return user.name;
  }
  
  return null;
};
