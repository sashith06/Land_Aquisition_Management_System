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
