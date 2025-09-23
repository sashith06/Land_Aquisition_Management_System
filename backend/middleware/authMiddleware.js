const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Auth middleware - Token received:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    console.log('Auth middleware - Token decoded successfully. User:', decoded.id, 'Role:', decoded.role);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization middleware - Required roles:', roles);
    console.log('Authorization middleware - User role:', req.user?.role);
    
    if (!req.user) {
      console.log('Authorization middleware - No user in request');
      return res.status(401).json({ error: 'Access denied. Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('Authorization middleware - Role not authorized. Required:', roles.join(' or '), 'User has:', req.user.role);
      console.log('Authorization middleware - Full user object:', JSON.stringify(req.user));
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    console.log('Authorization middleware - Role authorized successfully');
    next();
  };
};

// Specific role middlewares
const requireChiefEngineer = authorize('chief_engineer');
const requireProjectEngineer = authorize('project_engineer');
const requireFinancialOfficer = authorize('financial_officer');
const requireLandOfficer = authorize('land_officer');
const requireLandowner = authorize('landowner');

// Special middleware to ensure only chief engineers can access admin functions
const requireSystemAdmin = (req, res, next) => {
  console.log('System Admin check - User:', req.user?.id, 'Email:', req.user?.email, 'Role:', req.user?.role);

  if (!req.user) {
    return res.status(401).json({ error: 'Access denied. Not authenticated.' });
  }

  if (req.user.role !== 'chief_engineer') {
    return res.status(403).json({
      error: 'Access denied. Chief Engineer privileges required.'
    });
  }

  console.log('System Admin check passed - Chief Engineer authorized');
  next();
};

// Multi-role middleware
const requireEngineers = authorize('chief_engineer', 'project_engineer');
const requireOfficers = authorize('financial_officer', 'land_officer');
const requireAll = authorize('chief_engineer', 'project_engineer', 'financial_officer', 'land_officer');

module.exports = {
  verifyToken,
  authorize,
  requireChiefEngineer,
  requireProjectEngineer,
  requireFinancialOfficer,
  requireLandOfficer,
  requireLandowner,
  requireSystemAdmin,
  requireEngineers,
  requireOfficers,
  requireAll
};
