import React from 'react';
import { Navigate } from 'react-router-dom';

// Get user role from token stored in localStorage
const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Decode JWT token to get role or type
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.type;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Protected Route Component
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-specific route components
export const ChiefEngineerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['chief_engineer']}>
    {children}
  </ProtectedRoute>
);

export const ProjectEngineerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['project_engineer']}>
    {children}
  </ProtectedRoute>
);

export const FinancialOfficerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['financial_officer']}>
    {children}
  </ProtectedRoute>
);

export const LandOfficerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['land_officer']}>
    {children}
  </ProtectedRoute>
);

export const LandownerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['landowner']}>
    {children}
  </ProtectedRoute>
);

// Multi-role routes
export const AnyOfficerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['chief_engineer', 'project_engineer', 'financial_officer', 'land_officer']}>
    {children}
  </ProtectedRoute>
);

export { getUserRole, isAuthenticated };
