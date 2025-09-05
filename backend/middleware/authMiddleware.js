const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Specific role middlewares
const requireChiefEngineer = authorize('chief_engineer');
const requireProjectEngineer = authorize('project_engineer');
const requireFinancialOfficer = authorize('financial_officer');
const requireLandOfficer = authorize('land_officer');

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
  requireEngineers,
  requireOfficers,
  requireAll
};
