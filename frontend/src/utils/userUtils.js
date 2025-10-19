// Utility functions for user data management

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

export const getCurrentUserFullName = () => {
  const user = getCurrentUser();
  if (!user) return 'Guest';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return user.email || 'User';
  }
};

export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'User';
};

export const isCurrentUserCreator = (creatorName) => {
  const currentUserName = getCurrentUserFullName();
  return currentUserName === creatorName;
};

// Get user avatar - default to a placeholder if not available
export const getUserAvatar = () => {
  const user = getCurrentUser();
  return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getCurrentUserFullName())}&background=f97316&color=fff&size=128`;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  const roleFromStorage = localStorage.getItem('role');
  
  console.log('isAdmin check:', { 
    userRole: user?.role, 
    roleFromStorage: roleFromStorage,
    isAdmin: user?.is_admin 
  });
  
  // Check role from localStorage first (most reliable)
  if (roleFromStorage === 'chief_engineer') {
    return true;
  }
  
  // Fallback to user object role with various formats
  const role = user?.role?.toLowerCase();
  return role === 'chief_engineer' || 
         role === 'chief engineer' || 
         role === 'admin' ||
         user?.is_admin === true;
};

export const isLandowner = () => {
  const role = localStorage.getItem('role');
  return role === 'landowner';
};
